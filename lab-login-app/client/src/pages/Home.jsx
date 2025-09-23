import React, { useState } from 'react';
import QRDisplay from '../components/QRDisplay';
import { apiClient } from '../utils/api';

function Home() {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    year: ''
  });
  const [member, setMember] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiClient.post('/api/members', formData);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create member');
      }

      setMember(data.member);
      setQrDataUrl(data.qrDataUrl);
      setSuccess(`QR code generated successfully for ${data.member.name}!`);
      
      // Reset form
      setFormData({ name: '', department: '', year: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = (dataUrl, memberName) => {
    // Create a download link for the QR code
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qr-code-${memberName.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🧪 Lab Member Registration
        </h1>
        <p className="text-gray-600">
          Register as a lab member and get your unique QR code for attendance tracking
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          ✅ {success}
        </div>
      )}

      {/* Registration Form */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-6">Member Registration Form</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department *
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="e.g., Computer Science, Physics, Chemistry"
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year *
            </label>
            <input
              type="text"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="e.g., 1st Year, 2nd Year, Graduate, PhD"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Generating QR Code...
              </>
            ) : (
              '🎯 Generate QR Code'
            )}
          </button>
        </form>
      </div>

      {/* QR Code Display */}
      {qrDataUrl && member && (
        <div className="card">
          <QRDisplay 
            qrDataUrl={qrDataUrl} 
            member={member} 
            onDownload={handleDownloadQR}
          />
        </div>
      )}

      {/* Instructions */}
      <div className="card mt-8 bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          📋 How to Use Your QR Code
        </h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• <strong>Step 1:</strong> Fill out the registration form above</li>
          <li>• <strong>Step 2:</strong> Download your generated QR code</li>
          <li>• <strong>Step 3:</strong> Use the Scanner page to scan QR codes for attendance</li>
          <li>• <strong>Step 4:</strong> Admin can view and export attendance records</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;