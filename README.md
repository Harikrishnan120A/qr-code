# QR Code Attendance System

A comprehensive QR code-based attendance management system built with Python. This repository provides tools for generating QR codes and tracking attendance for various locations, events, or institutions. Perfect for schools, offices, events, or any place that requires efficient attendance tracking.

## Features

- **QR Code Generation**: Create unique QR codes for different locations, events, or sessions
- **Attendance Tracking**: Scan QR codes to mark attendance automatically
- **Location-Based Attendance**: Support for multiple venues and locations
- **Real-time Monitoring**: Track attendance in real-time
- **Data Export**: Export attendance records for analysis
- **User Management**: Handle multiple users and their attendance records
- **Time-stamped Records**: Automatic timestamp for each attendance entry

## Getting Started

### Prerequisites

- Python 3.x

Install required dependencies:
```bash
pip install qrcode[pil] opencv-python pandas datetime
```

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/Harikrishnan120A/qr-code.git
    cd qr-code
    ```

2. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Usage

### Generating QR Codes for Locations

```python
import qrcode
import json
from datetime import datetime

# Create location data
location_data = {
    "location_id": "LOC001",
    "location_name": "Conference Room A",
    "session_date": "2025-10-01",
    "session_time": "09:00"
}

# Generate QR code with location information
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4,
)

qr.add_data(json.dumps(location_data))
qr.make(fit=True)

# Create and save QR code image
img = qr.make_image(fill_color="black", back_color="white")
img.save(f"attendance_qr_{location_data['location_id']}.png")
```

### Scanning QR Codes for Attendance

```python
# Example of scanning and recording attendance
def mark_attendance(user_id, location_data):
    timestamp = datetime.now()
    attendance_record = {
        "user_id": user_id,
        "location": location_data["location_name"],
        "date": timestamp.strftime("%Y-%m-%d"),
        "time": timestamp.strftime("%H:%M:%S"),
        "status": "Present"
    }
    # Save to database or file
    save_attendance(attendance_record)
```

## Use Cases

- **Educational Institutions**: Track student attendance in classrooms
- **Corporate Offices**: Monitor employee attendance in meetings or workspaces
- **Events & Conferences**: Manage attendee check-ins
- **Workshops & Training**: Record participant attendance
- **Visitor Management**: Track guest entries at different locations

## Project Structure

```
qr-code/
├── src/
│   ├── qr_generator.py      # QR code generation functionality
│   ├── attendance_tracker.py # Attendance management
│   ├── scanner.py           # QR code scanning utilities
│   └── database.py          # Data storage and retrieval
├── data/
│   ├── attendance_records.csv
│   └── locations.json
├── generated_qr_codes/      # Directory for generated QR codes
├── requirements.txt
└── README.md
```

## Features in Detail

### QR Code Generation
- Generate unique QR codes for different locations
- Include location metadata (name, ID, date, time)
- Customizable QR code appearance

### Attendance Management
- Real-time attendance marking
- Support for multiple locations simultaneously
- Duplicate entry prevention
- Late arrival tracking

### Data Management
- CSV/Excel export functionality
- Database integration support
- Historical attendance reports
- Location-wise attendance analytics

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with Python and the `qrcode` library
- Inspired by the need for contactless attendance solutions
- Perfect for post-pandemic attendance management

---

**Author:** Harikrishnan120A  
**Contact:** [GitHub Profile](https://github.com/Harikrishnan120A)
