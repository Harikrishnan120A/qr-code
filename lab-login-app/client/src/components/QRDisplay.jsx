import React from 'react';

function QRDisplay({ qrDataUrl, member, onDownload }) {
  if (!qrDataUrl || !member) {
    return null;
  }

  return (
    <div className="qr-display">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        QR Code Generated Successfully! 📱
      </h3>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <img 
          src={qrDataUrl} 
          alt="QR Code" 
          className="mx-auto"
        />
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          <strong>Member:</strong> {member.name}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Department:</strong> {member.department} | <strong>Year:</strong> {member.year}
        </p>
        <p className="text-xs text-gray-500">
          Scan this QR code to mark attendance
        </p>
      </div>
      
      <button
        onClick={() => onDownload(qrDataUrl, member.name)}
        className="btn-secondary"
      >
        📥 Download QR Code
      </button>
    </div>
  );
}

export default QRDisplay;