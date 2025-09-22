import { Request, Response } from 'express';
import { createMemberSchema, scanSchema, dateSchema } from '../utils/validation';
import { generateMemberQR } from '../services/qrcodeService';
import { rateLimit } from '../utils/rateLimit';
import { config } from '../config';
import prisma from '../prismaClient';
import ExcelJS from 'exceljs';

/**
 * Controller for attendance-related operations
 */

/**
 * Create a new member and generate QR code
 * POST /api/members
 */
export async function createMember(req: Request, res: Response) {
  try {
    const validatedData = createMemberSchema.parse(req.body);
    
    // Generate unique token (using cuid from Prisma)
    const member = await prisma.member.create({
      data: {
        name: validatedData.name,
        department: validatedData.department,
        year: validatedData.year,
        qrToken: '', // Will be updated after creation to include the ID
      }
    });

    // Update with proper token (using member ID for uniqueness)
    const updatedMember = await prisma.member.update({
      where: { id: member.id },
      data: { qrToken: member.id } // Using the cuid as the token
    });

    // Generate QR code data URL
    const qrDataUrl = await generateMemberQR(updatedMember.qrToken);

    console.log(`Created new member: ${updatedMember.name} (${updatedMember.id})`);

    res.json({
      member: updatedMember,
      qrDataUrl
    });
  } catch (error) {
    console.error('Error creating member:', error);
    if (error instanceof Error && 'issues' in error) {
      return res.status(400).json({ error: 'Validation failed', details: error });
    }
    res.status(500).json({ error: 'Failed to create member' });
  }
}

/**
 * Scan QR code via GET request
 * GET /api/scan/:token?type=in|out
 */
export async function scanQRGet(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const type = (req.query.type as string) || 'in';

    const validatedData = scanSchema.parse({ token, type });

    // Check rate limiting
    if (!rateLimit.isAllowed(token)) {
      return res.status(429).json({ 
        error: 'Rate limited', 
        message: 'Please wait 5 seconds before scanning again' 
      });
    }

    // Find member by token
    const member = await prisma.member.findUnique({
      where: { qrToken: token }
    });

    if (!member) {
      return res.status(404).json({ error: 'Token not found' });
    }

    // Create attendance record
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const attendance = await prisma.attendance.create({
      data: {
        memberId: member.id,
        type: validatedData.type,
        date: today
      }
    });

    console.log(`Scan recorded: ${member.name} - ${validatedData.type} at ${attendance.timestamp}`);

    res.json({
      success: true,
      member: {
        id: member.id,
        name: member.name,
        department: member.department,
        year: member.year
      },
      attendance: {
        id: attendance.id,
        type: attendance.type,
        timestamp: attendance.timestamp,
        date: attendance.date
      }
    });
  } catch (error) {
    console.error('Error processing scan:', error);
    if (error instanceof Error && 'issues' in error) {
      return res.status(400).json({ error: 'Validation failed', details: error });
    }
    res.status(500).json({ error: 'Failed to process scan' });
  }
}

/**
 * Scan QR code via POST request (fallback)
 * POST /api/scan
 */
export async function scanQRPost(req: Request, res: Response) {
  try {
    const validatedData = scanSchema.parse(req.body);

    // Check rate limiting
    if (!rateLimit.isAllowed(validatedData.token)) {
      return res.status(429).json({ 
        error: 'Rate limited', 
        message: 'Please wait 5 seconds before scanning again' 
      });
    }

    // Find member by token
    const member = await prisma.member.findUnique({
      where: { qrToken: validatedData.token }
    });

    if (!member) {
      return res.status(404).json({ error: 'Token not found' });
    }

    // Create attendance record
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const attendance = await prisma.attendance.create({
      data: {
        memberId: member.id,
        type: validatedData.type,
        date: today
      }
    });

    console.log(`Scan recorded: ${member.name} - ${validatedData.type} at ${attendance.timestamp}`);

    res.json({
      success: true,
      member: {
        id: member.id,
        name: member.name,
        department: member.department,
        year: member.year
      },
      attendance: {
        id: attendance.id,
        type: attendance.type,
        timestamp: attendance.timestamp,
        date: attendance.date
      }
    });
  } catch (error) {
    console.error('Error processing scan:', error);
    if (error instanceof Error && 'issues' in error) {
      return res.status(400).json({ error: 'Validation failed', details: error });
    }
    res.status(500).json({ error: 'Failed to process scan' });
  }
}

/**
 * Get all members (admin protected)
 * GET /api/members
 */
export async function getMembers(req: Request, res: Response) {
  try {
    // Check admin authentication
    const adminSecret = req.headers['x-admin-secret'] || req.query.admin_secret;
    if (adminSecret !== config.adminSecret) {
      return res.status(401).json({ error: 'Unauthorized - Invalid admin secret' });
    }

    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        attendance: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    res.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
}

/**
 * Get attendance records for a specific date
 * GET /api/attendance?date=YYYY-MM-DD
 */
export async function getAttendance(req: Request, res: Response) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const validatedData = dateSchema.parse(req.query);
    const targetDate = validatedData.date || today;

    const attendance = await prisma.attendance.findMany({
      where: { date: targetDate },
      include: {
        Member: true
      },
      orderBy: { timestamp: 'desc' }
    });

    res.json({ 
      date: targetDate,
      attendance: attendance.map(record => ({
        id: record.id,
        type: record.type,
        timestamp: record.timestamp,
        date: record.date,
        member: {
          id: record.Member.id,
          name: record.Member.name,
          department: record.Member.department,
          year: record.Member.year
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    if (error instanceof Error && 'issues' in error) {
      return res.status(400).json({ error: 'Validation failed', details: error });
    }
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
}

/**
 * Export attendance to Excel (admin protected)
 * GET /api/export?date=YYYY-MM-DD
 */
export async function exportAttendance(req: Request, res: Response) {
  try {
    // Check admin authentication
    const adminSecret = req.headers['x-admin-secret'] || req.query.admin_secret;
    if (adminSecret !== config.adminSecret) {
      return res.status(401).json({ error: 'Unauthorized - Invalid admin secret' });
    }

    const today = new Date().toISOString().split('T')[0];
    const validatedData = dateSchema.parse(req.query);
    const targetDate = validatedData.date || today;

    // Fetch attendance data
    const attendance = await prisma.attendance.findMany({
      where: { date: targetDate },
      include: {
        Member: true
      },
      orderBy: { timestamp: 'asc' }
    });

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    // Add headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Department', key: 'department', width: 15 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Timestamp', key: 'timestamp', width: 25 },
      { header: 'Date', key: 'date', width: 12 }
    ];

    // Add data rows
    attendance.forEach(record => {
      worksheet.addRow({
        name: record.Member.name,
        department: record.Member.department,
        year: record.Member.year,
        type: record.type,
        timestamp: record.timestamp.toISOString(),
        date: record.date
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'CCCCCC' }
    };

    // Set response headers for file download
    const filename = `attendance_${targetDate}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    
    console.log(`Excel export generated for ${targetDate}: ${attendance.length} records`);
    
    res.end();
  } catch (error) {
    console.error('Error exporting attendance:', error);
    if (error instanceof Error && 'issues' in error) {
      return res.status(400).json({ error: 'Validation failed', details: error });
    }
    res.status(500).json({ error: 'Failed to export attendance' });
  }
}