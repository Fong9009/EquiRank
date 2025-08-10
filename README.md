# EquiRank - Financial Marketplace Platform

A modern, secure financial marketplace platform built with Next.js 14, React 18, TypeScript, and MySQL. The platform connects borrowers and lenders in a transparent, secure environment with comprehensive admin management capabilities.

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - Full-stack React framework with App Router
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript development
- **CSS Modules** - Scoped styling with custom design system
- **Glass Morphism UI** - Modern, translucent design aesthetic

### Backend & Database
- **Next.js API Routes** - Serverless API endpoints
- **MySQL 8.0+** - Relational database with MySQL2 driver
- **NextAuth.js v5** - Authentication and session management

### Security & Authentication
- **bcryptjs** - Secure password hashing (12 salt rounds)
- **jsonwebtoken** - JWT token generation and verification
- **NextAuth.js** - Comprehensive authentication solution
- **Rate Limiting** - API protection against abuse
- **Security Headers** - XSS, CSRF, and clickjacking protection

### Design System
- **Custom Typography** - 'Iceland-Regular' font family
- **Dark Theme** - Consistent color palette and visual hierarchy
- **Responsive Design** - Mobile-first approach with breakpoints
- **Glass Morphism** - Translucent backgrounds with backdrop blur

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── users/         # User management
│   │   └── admin/         # Admin operations
│   ├── admin/             # Admin dashboard
│   ├── about/             # About page
│   ├── contact-us/        # Contact page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── layout.tsx         # Root layout with providers
├── components/            # Reusable components
│   ├── common/            # Shared components
│   ├── layout/            # Layout components
│   ├── pages/             # Page-specific components
│   └── providers/         # Context providers
├── database/              # Database configuration
│   ├── db.ts             # Database operations
│   └── schema.sql        # Database schema
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   └── security.ts       # Security utilities
├── middleware.ts         # Global security middleware
└── styles/               # CSS Modules
    ├── components/       # Component styles
    ├── layout/          # Layout styles
    └── pages/           # Page styles
```

## 🔐 Authentication System

### NextAuth.js Integration
The platform uses **NextAuth.js v5** for secure authentication with the following features:

- **Credentials Provider** - Email/password authentication
- **JWT Strategy** - Secure session management
- **Role-based Access Control** - Admin, borrower, and lender roles
- **Approval Workflow** - Admin approval required for new users
- **Session Management** - 30-day session duration
- **Enhanced Security** - bcrypt password hashing, JWT tokens

### Authentication Flow
1. **Registration** → User submits registration form with validation
2. **Admin Review** → Admin reviews and approves/rejects users
3. **Login** → Approved users can sign in with secure authentication
4. **Session** → JWT-based session management with security headers
5. **Access Control** → Role-based route protection and middleware

### Demo Accounts
For testing purposes, the following demo accounts are available:

| Email | Password | Role | Status |
|-------|----------|------|---------|
| `admin@equirank.com` | `Test123!` | Admin | Approved |
| `borrower1@company.com` | `Test123!` | Borrower | Approved |
| `lender1@bank.com` | `Test123!` | Lender | Approved |
| `borrower2@individual.com` | `Test123!` | Borrower | Pending |
| `lender2@investor.com` | `Test123!` | Lender | Pending |

**Note:** All demo accounts use the same password for testing convenience.

### Environment Variables
```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=equirank
DB_PORT=3306

# Security Configuration
JWT_SECRET=your-jwt-secret-key-here
BCRYPT_SALT_ROUNDS=12

# Environment
NODE_ENV=development
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('borrower', 'lender', 'admin') NOT NULL,
    entity_type ENUM('company', 'individual') NOT NULL,
    company VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Contact Messages Table
```sql
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### User Management
- `POST /api/users` - Create new user with password hashing
- `GET /api/users/[type]` - Get users by type (borrower/lender)

### Admin Operations
- `GET /api/admin/pending` - Get users pending approval
- `POST /api/admin/approve` - Approve/reject users
- `GET /api/admin/contact-messages` - Get contact messages
- `PATCH /api/admin/contact-messages/[id]` - Update message status
- `DELETE /api/admin/contact-messages/[id]` - Delete message

### Contact System
- `POST /api/contact` - Submit contact form

## 🎯 Features

### User Management
- **Multi-role System** - Borrower, lender, and admin roles
- **Entity Types** - Company and individual registration options
- **Admin Approval** - Manual approval workflow for new registrations
- **Account Status** - Active/inactive and approved/pending states
- **Enhanced Security** - bcrypt password hashing, JWT tokens

### Contact System
- **Contact Form** - Public contact submission with validation
- **Message Management** - Admin dashboard for message handling
- **Status Tracking** - New, read, and replied message states

### Admin Panel
- **User Approvals** - Review and manage new registrations
- **Contact Messages** - Handle incoming contact form submissions
- **Tabbed Interface** - Organized workflow management
- **Secure Access** - Admin-only authentication required

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- Git

### Installation
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd team071-app_fit3048
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your database credentials and secrets
   ```

4. **Generate security secrets**
   ```bash
   # Generate NextAuth secret
   openssl rand -base64 32
   
   # Generate JWT secret
   openssl rand -base64 32
   ```

5. **Set up database**
   ```bash
   # Create database and run schema
   mysql -u root -p < src/database/schema.sql
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Main app: http://localhost:3000
   - Admin panel: http://localhost:3000/admin (admin login required)

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style
- **TypeScript** - Strict type checking enabled
- **ESLint** - Code quality and consistency
- **CSS Modules** - Scoped styling with BEM methodology
- **Component Structure** - Functional components with hooks

### Database Operations
All database operations are centralized in `src/database/db.ts`:
- User CRUD operations with security
- Approval workflow management
- Contact message handling
- Connection pooling and error handling

## 🛡️ Security Features

### Authentication Security
- **JWT Tokens** - Secure session management with expiration
- **Password Hashing** - bcrypt with 12 salt rounds
- **Role-based Access** - Admin-only routes protected
- **Session Expiration** - Automatic session cleanup
- **Rate Limiting** - API protection against abuse

### Application Security
- **Security Headers** - XSS, CSRF, and clickjacking protection
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Server-side validation for all inputs
- **SQL Injection Protection** - Parameterized queries
- **XSS Prevention** - Content Security Policy headers

### Admin Access Control
- **Secure Routes** - Admin panel requires authentication
- **Role Verification** - Admin role required for access
- **No Public Links** - Admin panel not accessible from public navigation
- **Session Validation** - Continuous authentication checks

## 📱 Responsive Design

### Breakpoints
- **Mobile First** - 320px and up
- **Tablet** - 768px and up
- **Desktop** - 1024px and up
- **Large Desktop** - 1200px and up

### Glass Morphism UI
- **Translucent Backgrounds** - Modern, layered design
- **Backdrop Blur** - Smooth visual effects
- **Border Highlights** - Subtle depth and dimension
- **Hover States** - Interactive feedback and animations

## 🔄 State Management

### Client-side State
- **React Hooks** - useState, useEffect, useRouter
- **NextAuth Session** - Authentication state management
- **Form State** - Controlled form inputs and validation
- **Loading States** - User feedback during operations

### Server-side State
- **Database State** - Persistent data storage
- **API State** - Server-side data processing
- **Session State** - Server-side session validation

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Configuration
- Set `NODE_ENV=production`
- Configure production database credentials
- Set secure `NEXTAUTH_SECRET` and `JWT_SECRET`
- Update `NEXTAUTH_URL` for production domain
- Configure production database with proper security

### Database Migration
- Export production schema
- Configure production database with secure credentials
- Run schema creation scripts
- Verify data integrity and security

## 🧪 Testing

### Demo Accounts
Use the provided demo accounts to test different user roles and workflows:

1. **Admin Testing** - Login as admin to test approval workflow
2. **User Registration** - Test the registration process
3. **Login Flow** - Test authentication with different account statuses
4. **Admin Panel** - Test user approval and contact message management

### Security Testing
- Test authentication flows
- Verify role-based access control
- Test input validation and sanitization
- Verify security headers are properly set

## 🤝 Contributing

### Development Workflow
1. Create feature branch from main
2. Implement changes with proper TypeScript types
3. Update documentation as needed
4. Test thoroughly across different screen sizes
5. Submit pull request with detailed description

### Code Standards
- Follow TypeScript best practices
- Maintain consistent component structure
- Use CSS Modules for styling
- Include proper error handling
- Add loading states for async operations
- Implement proper security measures
- Follow authentication best practices

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)

## 🔒 Security Notes

- **Never commit `.env.local` files** - They contain sensitive information
- **Use strong, unique secrets** - Generate different secrets for each environment
- **Regular security updates** - Keep dependencies updated
- **Database security** - Use strong passwords and limit database access
- **HTTPS in production** - Always use HTTPS for production deployments