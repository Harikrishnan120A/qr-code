# Lab Login System

A complete full-stack application for lab attendance tracking using QR codes. Lab members can register and generate unique QR codes, which can be scanned to mark entry/exit attendance. Admins can view and export attendance records to Excel.

## 🚀 Features

- **Member Registration**: Create lab member profiles with QR code generation
- **QR Code Generation**: Unique QR codes for each member using PNG data URLs
- **Live QR Scanning**: Camera-based scanning with html5-qrcode + manual token entry fallback
- **Attendance Tracking**: Mark entry/exit with timestamps and date tracking
- **Admin Dashboard**: View members, attendance records, and export data
- **Excel Export**: Download attendance records as Excel files (.xlsx)
- **Rate Limiting**: Prevent duplicate scans within 5 seconds
- **Responsive UI**: Clean Tailwind CSS interface that works on all devices

## 🛠️ Tech Stack

### Backend
- **Node.js** (>=18) with **Express** and **TypeScript**
- **Prisma ORM** with **SQLite** database
- **QR Generation**: `qrcode` npm package for PNG data URLs
- **Excel Export**: `exceljs` for .xlsx file generation
- **Validation**: `zod` for request validation
- **Security**: CORS, rate limiting, admin authentication

### Frontend
- **React** with **Vite** for fast development
- **Tailwind CSS** for responsive styling
- **React Router** for client-side routing
- **QR Scanning**: `html5-qrcode` for live camera scanning

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Modern web browser with camera access (for QR scanning)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd lab-login-app

# Install server dependencies
cd server
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env file with your configuration

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev --name init

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration

Edit `server/.env` file:

```env
# Server Configuration
PORT=4000
HOST=localhost:4000
NODE_ENV=development

# Admin Authentication (CHANGE THIS IN PRODUCTION)
ADMIN_SECRET=your-secure-admin-secret

# Database (auto-created)
DATABASE_URL="file:./dev.db"
```

### 3. Run the Application

**Option A: Run separately (recommended for development)**

```bash
# Terminal 1 - Start backend server
cd server
npm run dev
# Server runs on http://localhost:4000

# Terminal 2 - Start frontend client
cd client
npm run dev
# Client runs on http://localhost:5173
```

**Option B: Production build**

```bash
# Build and start server
cd server
npm run build
npm start

# Build client
cd client
npm run build
npm run preview
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **API Health Check**: http://localhost:4000/health

## 📱 How to Use

### For Lab Members:

1. **Register**: Go to Home page, fill registration form (Name, Department, Year)
2. **Get QR Code**: Click "Generate QR Code" to create your unique QR code
3. **Download**: Save your QR code image for future use
4. **Scan**: Use the Scanner page or let others scan your QR code for attendance

### For Admins:

1. **Login**: Go to Admin page, enter admin secret (default: `admin123`)
2. **View Records**: See all members and attendance for any date
3. **Export Data**: Download attendance records as Excel files
4. **Monitor**: Real-time stats on members and daily attendance

### For Scanning:

1. **Camera Scanner**: Use the Scanner page, allow camera permissions
2. **Manual Entry**: Paste QR URLs or tokens directly
3. **Select Type**: Choose "Check In" or "Check Out"
4. **Confirmation**: See success message with member details

## 🔧 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/members` | Create new member + generate QR |
| `GET` | `/api/scan/:token` | Scan QR code (with type=in/out query) |
| `POST` | `/api/scan` | Scan QR code (JSON body fallback) |
| `GET` | `/api/attendance` | Get attendance records (date query) |

### Admin Protected Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/members` | List all members | Admin Secret Header |
| `GET` | `/api/export` | Download Excel file | Admin Secret Query |

### Request Examples

**Create Member:**
```json
POST /api/members
{
  "name": "John Doe",
  "department": "Computer Science", 
  "year": "3rd Year"
}
```

**Scan QR Code:**
```
GET /api/scan/cm1abc123?type=in
POST /api/scan
{
  "token": "cm1abc123",
  "type": "out"
}
```

**Admin Access:**
```
GET /api/members
Header: x-admin-secret: your-admin-secret

GET /api/export?date=2025-09-22&admin_secret=your-admin-secret
```

## 🗄️ Database Schema

```prisma
model Member {
  id         String   @id @default(cuid())
  name       String
  department String
  year       String
  qrToken    String   @unique
  createdAt  DateTime @default(now())
  attendance Attendance[]
}

model Attendance {
  id        String   @id @default(cuid())
  memberId  String
  type      String   // "in" | "out"
  timestamp DateTime @default(now())
  date      String   // YYYY-MM-DD
  Member    Member   @relation(fields: [memberId], references: [id])
}
```

## 🔒 Security Features

- **Rate Limiting**: 5-second cooldown between scans for same token
- **Admin Authentication**: Protected routes require admin secret
- **Input Validation**: Zod schemas validate all requests
- **CORS**: Configured for frontend origin
- **SQL Injection Protection**: Prisma ORM with prepared statements

## 📊 File Structure

```
lab-login-app/
├── server/                     # Backend Node.js/TypeScript
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Validation, rate limiting
│   │   ├── config.ts         # Environment config
│   │   ├── prismaClient.ts   # Database client
│   │   └── index.ts          # Express app
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── client/                    # Frontend React/Vite
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # App entry point
│   │   └── styles.css       # Tailwind styles
│   ├── package.json
│   ├── vite.config.js       # Vite config with proxy
│   ├── tailwind.config.js   # Tailwind configuration
│   └── index.html
└── README.md                 # This file
```

## 🧪 Testing

### Manual Testing Checklist

1. **Member Registration**:
   - [ ] Create member with valid data
   - [ ] Generate QR code successfully
   - [ ] Download QR code image
   - [ ] Validate form errors for invalid input

2. **QR Scanning**:
   - [ ] Camera scanner detects QR codes
   - [ ] Manual token entry works
   - [ ] Both "in" and "out" types record correctly
   - [ ] Rate limiting prevents duplicate scans
   - [ ] Error handling for invalid tokens

3. **Admin Functions**:
   - [ ] Authentication with admin secret
   - [ ] View all members list
   - [ ] Filter attendance by date
   - [ ] Export Excel file downloads correctly
   - [ ] Logout functionality

4. **Database**:
   - [ ] SQLite database created automatically
   - [ ] Migrations run successfully
   - [ ] Unique constraints work (duplicate prevention)
   - [ ] Proper date formatting (YYYY-MM-DD)

### Sample Data for Testing

Use these values to test the system:

```
Name: "Alice Johnson"
Department: "Computer Science"
Year: "2nd Year"

Name: "Bob Smith" 
Department: "Physics"
Year: "Graduate"
```

## 🚀 Production Deployment

### Environment Setup

1. **Update .env for production**:
   ```env
   NODE_ENV=production
   PORT=4000
   ADMIN_SECRET=very-secure-secret-here
   HOST=your-domain.com:4000
   ```

2. **Database**: Consider PostgreSQL for production:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/lablogin"
   ```

3. **Build and deploy**:
   ```bash
   cd server && npm run build
   cd client && npm run build
   ```

### Security Checklist

- [ ] Change default admin secret
- [ ] Use HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Monitor rate limiting logs
- [ ] Use environment variables for all secrets

## 🔧 Troubleshooting

### Common Issues

**1. Camera not working in Scanner**
- Ensure HTTPS or localhost (camera requires secure context)
- Check browser permissions for camera access
- Use manual token entry as fallback

**2. CORS errors**
- Verify Vite proxy configuration in `vite.config.js`
- Check server CORS settings in `src/index.ts`

**3. Database errors**
- Run `npx prisma generate` after schema changes
- Run `npx prisma migrate dev` to apply migrations
- Check file permissions for SQLite database

**4. Admin authentication fails**
- Verify ADMIN_SECRET in server/.env
- Check header name: `x-admin-secret`
- Try query parameter: `?admin_secret=...`

**5. QR codes not generating**
- Check server logs for errors
- Verify `qrcode` package installation
- Ensure HOST configuration is correct

### Development Tips

- Use `npx prisma studio` to view database in browser
- Check server logs for detailed error messages
- Use browser dev tools to inspect API requests
- Test QR codes with phone camera apps

## 🌐 GitHub Pages Deployment

This project includes automated GitHub Pages deployment for the frontend using GitHub Actions.

### Setup GitHub Pages Deployment

1. **Enable GitHub Pages**:
   - Go to your repository Settings → Pages
   - Set Source to "GitHub Actions"

2. **Configure Repository Secrets**:
   - Go to Settings → Secrets and variables → Actions
   - Add the following repository secret:
     - `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.herokuapp.com`)

3. **Deploy**:
   ```bash
   # Push to main branch to trigger deployment
   git push origin main
   ```

4. **Access Your App**:
   - Your app will be available at: `https://yourusername.github.io/your-repo-name`
   - The GitHub Action will automatically build and deploy on every push to main

### Environment Configuration

The frontend automatically adapts to different environments:

- **Development**: Uses `VITE_API_URL` from `.env.development` (default: `http://localhost:4000`)
- **Production**: Uses `VITE_API_URL` from environment variables or `.env.production`

### Backend Deployment Notes

For a complete deployment, you'll need to deploy your backend separately:

1. **Recommended platforms**: Railway, Render, Heroku, or any Node.js hosting
2. **Environment variables needed**:
   ```
   NODE_ENV=production
   HOST=your-backend-domain.com
   CLIENT_URL=https://yourusername.github.io/your-repo-name
   PORT=4000
   ADMIN_SECRET=your-secure-secret
   ```
3. **Update frontend config**: Set `VITE_API_URL` in GitHub repository secrets

### GitHub Actions Workflow

The deployment uses `.github/workflows/deploy.yml` which:
- Installs Node.js 18
- Installs dependencies
- Builds the project with environment variables
- Deploys to GitHub Pages using `peaceiris/actions-gh-pages`

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review server logs for detailed errors
3. Ensure all dependencies are installed correctly
4. Verify environment configuration

---

**Created**: September 2025  
**Version**: 1.0.1  
**Tech Stack**: Node.js + Express + TypeScript + Prisma + React + Vite + Tailwind CSS  
**Deployment**: GitHub Pages Ready + Railway Backend Support