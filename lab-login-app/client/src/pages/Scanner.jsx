import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function Scanner() {
  const [scanResult, setScanResult] = useState(null);
  const [manualToken, setManualToken] = useState('');
  const [scanType, setScanType] = useState('in');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const scannerRef = useRef(null);
  const scannerDivId = "qr-reader";

  useEffect(() => {
    // Initialize QR Scanner when component mounts
    if (!scannerInitialized) {
      initializeScanner();
      setScannerInitialized(true);
    }

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [scannerInitialized]);

  const initializeScanner = () => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };

    const scanner = new Html5QrcodeScanner(scannerDivId, config, false);
    scannerRef.current = scanner;

    scanner.render(onScanSuccess, onScanFailure);
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    console.log(`QR Code detected: ${decodedText}`);
    
    // Extract token from URL if it's a full URL
    let token = decodedText;
    if (decodedText.includes('/api/scan/')) {
      const urlParts = decodedText.split('/api/scan/');
      if (urlParts.length > 1) {
        token = urlParts[1].split('?')[0];
      }
    }

    setScanResult({
      text: decodedText,
      token: token
    });

    // Auto-submit the scan
    processScan(token);
  };

  const onScanFailure = (error) => {
    // This is called frequently and is normal - QR code not found
    // We don't want to show these errors to the user
    console.log("QR scan failed:", error);
  };

  const processScan = async (token, type = scanType) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/scan/${token}?type=${type}`, {
        method: 'GET'
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Please wait 5 seconds before scanning again');
        }
        throw new Error(data.error || 'Failed to process scan');
      }

      setSuccess(`✅ Attendance recorded successfully!
        Member: ${data.member.name}
        Type: ${data.attendance.type.toUpperCase()}
        Time: ${new Date(data.attendance.timestamp).toLocaleString()}`);
      
      // Clear scan result after successful processing
      setTimeout(() => {
        setScanResult(null);
        setSuccess(null);
      }, 5000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualScan = async (e) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      setError('Please enter a token');
      return;
    }

    await processScan(manualToken.trim(), scanType);
  };

  const handleTokenChange = (e) => {
    setManualToken(e.target.value);
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📱 QR Code Scanner
        </h1>
        <p className="text-gray-600">
          Scan QR codes to mark attendance or enter tokens manually
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error mb-6">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-6">
          <pre className="whitespace-pre-wrap">{success}</pre>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* QR Scanner */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">📷 Camera Scanner</h2>
          
          <div className="scanner-container">
            <div id={scannerDivId} className="scanner-video"></div>
          </div>

          {scanResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800">QR Code Detected:</h4>
              <p className="text-sm text-green-700 break-all">{scanResult.text}</p>
              <p className="text-sm text-green-700">Token: {scanResult.token}</p>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scan Type:
            </label>
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value)}
              className="input-field"
            >
              <option value="in">⬇️ Check In</option>
              <option value="out">⬆️ Check Out</option>
            </select>
          </div>
        </div>

        {/* Manual Token Entry */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">✍️ Manual Token Entry</h2>
          
          <form onSubmit={handleManualScan} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                Token or QR URL
              </label>
              <input
                type="text"
                id="token"
                value={manualToken}
                onChange={handleTokenChange}
                className="input-field"
                placeholder="Enter token or paste QR code URL"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can paste the full QR code URL or just the token
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scan Type:
              </label>
              <select
                value={scanType}
                onChange={(e) => setScanType(e.target.value)}
                className="input-field"
              >
                <option value="in">⬇️ Check In</option>
                <option value="out">⬆️ Check Out</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !manualToken.trim()}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Processing...
                </>
              ) : (
                '🎯 Process Scan'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Instructions */}
      <div className="card mt-8 bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          📋 Scanner Instructions
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Camera Scanner:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Allow camera permissions when prompted</li>
              <li>• Point camera at QR code</li>
              <li>• Wait for automatic detection</li>
              <li>• Select check-in or check-out type</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Manual Entry:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Paste full QR code URL or token</li>
              <li>• Select scan type (in/out)</li>
              <li>• Click "Process Scan"</li>
              <li>• Useful when camera is not available</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Scanner;