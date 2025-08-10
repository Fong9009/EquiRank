# EquiRank - Investment Technology Platform

EquiRank is a modern web application for investment technology and company comparison, built with Next.js and TypeScript.

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: CSS Modules with custom design system
- **Database**: MySQL 8.0+ with MySQL2 driver
- **Authentication**: User management system (borrowers, lenders, admins)
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── users/         # User management endpoints
│   │   └── test-db/       # Database connection test
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── common/            # Reusable components
│   ├── layout/            # Layout components
│   └── pages/             # Page-specific components
├── database/               # Database configuration
│   ├── db.ts              # Database connection and operations
│   └── schema.sql         # Database schema
└── styles/                 # CSS Modules
    ├── components/         # Component styles
    ├── layout/            # Layout styles
    └── pages/             # Page styles
```

## 🗄️ Database Setup

### Prerequisites
- MySQL Server 8.0+
- Node.js 18+
- npm package manager

### Quick Setup
1. **Install MySQL**: `brew install mysql` (macOS) or download from [mysql.com](https://dev.mysql.com/downloads/mysql/)
2. **Start MySQL**: `brew services start mysql`
3. **Install dependencies**: `npm install mysql2`
4. **Create `.env.local`**:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=equirank
   DB_PORT=3306
   ```
5. **Initialize database**: `mysql -u root -p < src/database/schema.sql`

### Database Schema
The application uses a **3-user type system**:
- **🔵 Borrowers** - Companies seeking funding
- **🟢 Lenders** - Banks/investors providing funding
- **🔴 Admins** - System administrators

**Users Table Structure:**
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_type ENUM('borrower', 'lender', 'admin') NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔌 API Endpoints

### User Management
- **`POST /api/users`** - Create new user
- **`GET /api/users`** - Get all users
- **`GET /api/users/borrowers`** - Get borrowers only
- **`GET /api/users/lenders`** - Get lenders only
- **`GET /api/users/admins`** - Get admins only

### Database
- **`GET /api/test-db`** - Test database connection

## 🛠️ Development

### Getting Started
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials

# Start development server
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Operations
All database functions are available in `src/database/db.ts`:

```typescript
import { createUser, getBorrowers, getLenders, getAdmins } from '@/database/db';

// Create a new borrower
const userId = await createUser(
  'john@company.com',
  'hashedPassword',
  'John',
  'Doe',
  'borrower',
  'ABC Company'
);

// Get all lenders
const lenders = await getLenders();
```

## Design System

The application uses a consistent design system with:
- **Typography**: Custom font (Iceland-Regular) for headings
- **Colors**: Dark theme (#1f2123 background)
- **Components**: Reusable FlipCard, TitleText components
- **Responsive**: Mobile-first design with CSS media queries

## Pages

- **Home** (`/`) - Landing page with features and benefits
- **About** (`/about`) - Company information and vision
- **Contact** (`/contact`) - Contact form and information

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables
Ensure these are set in production:
- `DB_HOST` - Database host
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `DB_PORT` - Database port

## Security Notes

- **Passwords**: Currently stored as-is (NOT production ready)
- **Authentication**: Basic user management (implement proper auth)
- **Database**: Use strong passwords and limit user privileges
- **Environment**: Never commit `.env.local` to version control


