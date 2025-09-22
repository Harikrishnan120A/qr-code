import React from 'react';

function AttendanceTable({ attendance, loading }) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading attendance records...</p>
      </div>
    );
  }

  if (!attendance || attendance.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No attendance records found for this date.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Year</th>
            <th>Type</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((record) => (
            <tr key={record.id}>
              <td className="font-medium">{record.member.name}</td>
              <td>{record.member.department}</td>
              <td>{record.member.year}</td>
              <td>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  record.type === 'in' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {record.type === 'in' ? '⬇️ In' : '⬆️ Out'}
                </span>
              </td>
              <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceTable;