import QRCode from 'qrcode';
import { config } from '../config';

/**
 * QR Code generation service
 * Creates PNG data URLs for QR codes
 */

/**
 * Generate QR code data URL for a scan endpoint
 * @param token Unique token for the member
 * @param type Scan type (in/out)
 * @returns Promise<string> Data URL for the QR code PNG
 */
export async function generateQRDataURL(token: string, type: string = 'in'): Promise<string> {
  try {
    const scanUrl = `http://${config.host}/api/scan/${token}?type=${type}`;
    
    // Generate QR code as data URL with PNG format
    const qrDataURL = await QRCode.toDataURL(scanUrl, {
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });

    return qrDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code for member with default "in" type
 * @param token Member's unique token
 * @returns Promise<string> Data URL for the QR code PNG
 */
export async function generateMemberQR(token: string): Promise<string> {
  return generateQRDataURL(token, 'in');
}