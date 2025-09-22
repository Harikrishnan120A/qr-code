import React, { useState, useEffect } from 'react';
import AttendanceTable from '../components/AttendanceTable';

function Admin() {
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to today
    return new Date().toISOString().split('T')[0];
  });
  const [adminSecret, setAdminSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAttendance();
    }
  }, [selectedDate, isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!adminSecret.trim()) {
      setError('Please enter admin secret');
      return;
    }

    // Test authentication by fetching members
    try {
      setLoading(true);
      const response = await fetch('/api/members', {
        headers: {
          'x-admin-secret': adminSecret
        }
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setSuccess('Authentication successful!');
        fetchMembers();
        fetchAttendance();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members', {
        headers: {
          'x-admin-secret': adminSecret
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const data = await response.json();
      setMembers(data.members);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/attendance?date=${selectedDate}`);

      if (!response.ok) {
        throw new Error('Failed to fetch attendance');
      }

      const data = await response.json();
      setAttendance(data.attendance);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/export?date=${selectedDate}&admin_secret=${adminSecret}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to export data');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance_${selectedDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('Excel file downloaded successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setError(null);
    setSuccess(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👑 Admin Login
          </h1>
          <p className="text-gray-600">
            Enter admin secret to access attendance records
          </p>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-6">
            ✅ {success}
          </div>
        )}

        <div className="card">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="adminSecret" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Secret
              </label>
              <input
                type="password"
                id="adminSecret"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                className="input-field"
                placeholder="Enter admin secret"
                required
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
                  Authenticating...
                </>
              ) : (
                '🔐 Login'
              )}
            </button>
          </form>
        </div>

        <div className="card mt-6 bg-yellow-50 border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            ℹ️ Default Admin Credentials
          </h3>
          <p className="text-sm text-yellow-800">
            For testing purposes, the default admin secret is: <code className="bg-yellow-100 px-1 rounded">admin123</code>
          </p>
          <p className="text-xs text-yellow-700 mt-2">
            Change this in the server's .env file for production use.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          👑 Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage lab members and view attendance records
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
          ✅ {success}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">👥 Total Members</h3>
          <p className="text-3xl font-bold text-blue-700">{members.length}</p>
        </div>
        
        <div className="card bg-green-50 border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-2">📅 Today's Attendance</h3>
          <p className="text-3xl font-bold text-green-700">{attendance.length}</p>
        </div>

        <div className="card bg-purple-50 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">⬇️ Check-ins Today</h3>
          <p className="text-3xl font-bold text-purple-700">
            {attendance.filter(record => record.type === 'in').length}
          </p>
        </div>
      </div>

      {/* Date Selection and Export */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <label htmlFor="date" className="text-sm font-medium text-gray-700">
              Select Date:
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="input-field max-w-xs"
            />
            <button
              onClick={fetchAttendance}
              disabled={loading}
              className="btn-secondary"
            >
              🔄 Refresh
            </button>
          </div>

          <button
            onClick={handleExport}
            disabled={loading || attendance.length === 0}
            className="btn-success"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Exporting...
              </>
            ) : (
              '📊 Download Excel'
            )}
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            📋 Attendance Records for {selectedDate}
          </h2>
          <span className="text-sm text-gray-500">
            {attendance.length} record(s)
          </span>
        </div>

        <AttendanceTable attendance={attendance} loading={loading} />
      </div>

      {/* Members List */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold mb-6">👥 All Members</h2>
        
        {members.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No members registered yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Registered</th>
                  <th>Total Scans</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="font-medium">{member.name}</td>
                    <td>{member.department}</td>
                    <td>{member.year}</td>
                    <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {member.attendance.length}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="text-center mt-8">
        <button
          onClick={() => {
            setIsAuthenticated(false);
            setAdminSecret('');
            setMembers([]);
            setAttendance([]);
            setError(null);
            setSuccess(null);
          }}
          className="btn-danger"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Admin;