const express = require('express');
const path = require('path');
const cors = require('cors');

// Import your existing server app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:4001', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Import and use your existing API routes
const { PrismaClient } = require('@prisma/client');
const QRCode = require('qrcode');
const ExcelJS = require('exceljs');
const { z } = require('zod');

const prisma = new PrismaClient();

// Environment configuration
const PORT = process.env.PORT || 4001;
const HOST = process.env.HOST || 'localhost:4001';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'lab-admin-production-2023';

console.log('🔧 Environment loaded:');
console.log(`📍 Host: ${HOST}`);
console.log(`🚪 Port: ${PORT}`);
console.log(`🔑 Admin secret configured: ${ADMIN_SECRET ? 'Yes' : 'No'}`);

// Rate limiting for scanning
const scanCooldowns = new Map();
const SCAN_COOLDOWN_MS = 5000;

// Validation schemas
const createMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  department: z.string().min(1, 'Department is required'),
  year: z.string().min(1, 'Year is required')
});

const scanSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  type: z.enum(['in', 'out'], { required_error: 'Type must be "in" or "out"' })
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    host: HOST
  });
});

// API Routes

// Create member with QR code
app.post('/api/members', async (req, res) => {
  try {
    const { name, department, year } = createMemberSchema.parse(req.body);
    
    const member = await prisma.member.create({
      data: { name, department, year }
    });

    // Generate QR code as data URL
    const qrData = `http://${HOST}/api/scan/${member.qrToken}?type=in`;
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      member,
      qrCode: qrCodeDataURL,
      qrData
    });
  } catch (error) {
    console.error('Error creating member:', error);
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create member' });
    }
  }
});

// Get all members (admin only)
app.get('/api/members', async (req, res) => {
  try {
    const adminSecret = req.headers['x-admin-secret'];
    if (adminSecret !== ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized - Invalid admin secret' });
    }

    const members = await prisma.member.findMany({
      include: {
        attendance: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Scan QR code
app.get('/api/scan/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { type } = req.query;
    
    const validatedData = scanSchema.parse({ token, type });
    
    // Check rate limiting
    const now = Date.now();
    const lastScan = scanCooldowns.get(token);
    if (lastScan && (now - lastScan) < SCAN_COOLDOWN_MS) {
      return res.status(429).json({ 
        error: 'Rate limited', 
        message: 'Please wait 5 seconds between scans',
        cooldownRemaining: Math.ceil((SCAN_COOLDOWN_MS - (now - lastScan)) / 1000)
      });
    }

    const member = await prisma.member.findUnique({
      where: { qrToken: token }
    });

    if (!member) {
      return res.status(404).json({ error: 'Invalid QR code' });
    }

    // Record attendance
    const attendance = await prisma.attendance.create({
      data: {
        memberId: member.id,
        type: validatedData.type,
        date: new Date().toISOString().split('T')[0]
      }
    });

    // Update rate limiting
    scanCooldowns.set(token, now);

    res.json({
      success: true,
      member: {
        name: member.name,
        department: member.department,
        year: member.year
      },
      attendance: {
        type: attendance.type,
        timestamp: attendance.timestamp,
        date: attendance.date
      }
    });
  } catch (error) {
    console.error('Error scanning QR code:', error);
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid scan data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to process scan' });
    }
  }
});

// Scan QR code (POST method fallback)
app.post('/api/scan', async (req, res) => {
  try {
    const { token, type } = scanSchema.parse(req.body);
    
    // Check rate limiting
    const now = Date.now();
    const lastScan = scanCooldowns.get(token);
    if (lastScan && (now - lastScan) < SCAN_COOLDOWN_MS) {
      return res.status(429).json({ 
        error: 'Rate limited', 
        message: 'Please wait 5 seconds between scans',
        cooldownRemaining: Math.ceil((SCAN_COOLDOWN_MS - (now - lastScan)) / 1000)
      });
    }

    const member = await prisma.member.findUnique({
      where: { qrToken: token }
    });

    if (!member) {
      return res.status(404).json({ error: 'Invalid QR code' });
    }

    // Record attendance
    const attendance = await prisma.attendance.create({
      data: {
        memberId: member.id,
        type,
        date: new Date().toISOString().split('T')[0]
      }
    });

    // Update rate limiting
    scanCooldowns.set(token, now);

    res.json({
      success: true,
      member: {
        name: member.name,
        department: member.department,
        year: member.year
      },
      attendance: {
        type: attendance.type,
        timestamp: attendance.timestamp,
        date: attendance.date
      }
    });
  } catch (error) {
    console.error('Error scanning QR code:', error);
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid scan data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to process scan' });
    }
  }
});

// Get attendance records
app.get('/api/attendance', async (req, res) => {
  try {
    const { date } = req.query;
    
    const whereClause = date ? { date } : {};
    
    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        Member: {
          select: {
            name: true,
            department: true,
            year: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Export attendance to Excel (admin only)
app.get('/api/export', async (req, res) => {
  try {
    const { date, admin_secret } = req.query;
    
    if (admin_secret !== ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized - Invalid admin secret' });
    }

    const whereClause = date ? { date } : {};
    
    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        Member: {
          select: {
            name: true,
            department: true,
            year: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    // Add headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Year', key: 'year', width: 15 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Time', key: 'time', width: 20 }
    ];

    // Add data
    attendance.forEach(record => {
      worksheet.addRow({
        name: record.Member.name,
        department: record.Member.department,
        year: record.Member.year,
        type: record.type.toUpperCase(),
        date: record.date,
        time: new Date(record.timestamp).toLocaleString()
      });
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFCCCCCC' }
    };

    // Set response headers
    const filename = `attendance_${date || 'all'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send Excel file
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting attendance:', error);
    res.status(500).json({ error: 'Failed to export attendance' });
  }
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Lab Login System - Production Deployment');
  console.log('===========================================');
  console.log(`📱 Frontend & API: http://localhost:${PORT}`);
  console.log(`🔧 Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔑 Admin Authentication: ${ADMIN_SECRET ? 'Enabled' : 'Disabled'}`);
  console.log('===========================================');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;