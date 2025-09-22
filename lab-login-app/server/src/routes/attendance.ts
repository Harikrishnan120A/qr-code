import express from 'express';
import {
  createMember,
  scanQRGet,
  scanQRPost,
  getMembers,
  getAttendance,
  exportAttendance
} from '../controllers/attendanceController';

const router = express.Router();

/**
 * Attendance routes
 */

// Create new member and generate QR code
router.post('/members', createMember);

// Scan QR code via GET (main scanning endpoint)
router.get('/scan/:token', scanQRGet);

// Scan QR code via POST (fallback for scanners that send JSON)
router.post('/scan', scanQRPost);

// Get all members (admin protected)
router.get('/members', getMembers);

// Get attendance records for a date
router.get('/attendance', getAttendance);

// Export attendance to Excel (admin protected)
router.get('/export', exportAttendance);

export default router;