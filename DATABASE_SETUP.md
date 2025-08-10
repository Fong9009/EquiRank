# MySQL Database Setup Guide for EquiRank

## Prerequisites

1. **MySQL Server** - Version 8.0 or higher
2. **Node.js** - Version 18 or higher
3. **npm** - Package manager

## Installation Steps

### 1. Install MySQL Server

#### On macOS (using Homebrew):
```bash
brew install mysql
brew services start mysql
```

#### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### On Windows:
Download and install MySQL from the official website: https://dev.mysql.com/downloads/mysql/

### 2. Secure MySQL Installation

```bash
# Set root password and secure installation
mysql_secure_installation
```

### 3. Create Database and User

```bash
# Connect to MySQL as root
mysql -u root -p

# Create database
CREATE DATABASE equirank;

# Create user (replace 'your_password' with a strong password)
CREATE USER 'equirank_user'@'localhost' IDENTIFIED BY 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON equirank.* TO 'equirank_user'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

### 4. Install Node.js Dependencies

```bash
# Install MySQL2 package
npm install mysql2

# Install TypeScript types
npm install --save-dev @types/mysql
```

### 5. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=equirank_user
DB_PASSWORD=your_password
DB_NAME=equirank
DB_PORT=3306
```

**Important**: Never commit `.env.local` to version control!

### 6. Initialize Database Schema

```bash
# Connect to MySQL and run the schema
mysql -u equirank_user -p equirank < src/database/schema.sql
```

Or manually copy and paste the contents of `src/database/schema.sql` into your MySQL client.

## Testing the Connection

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Test Database Connection

Visit: `http://localhost:3000/api/test-db`

You should see a JSON response indicating whether the connection was successful.

### 3. Test User Management

1. Test the users API endpoint
2. Create a new user via POST request
3. Check the database to see if the user was stored

```sql
-- Check users
SELECT id, email, first_name, last_name, user_type, company, is_active, created_at FROM users;
```

## Database Structure

### Tables Created

1. **users** - User accounts and authentication

### Sample Data

The schema includes sample users:
- **Admin**: admin@equirank.com (EquiRank)
- **Borrower**: borrower@example.com (ABC Company)
- **Lender**: lender@example.com (XYZ Bank)

## API Endpoints

### User Management
- **POST** `/api/users` - Create a new user
- **GET** `/api/users` - Get all users (admin only)
- **GET** `/api/users/borrowers` - Get all borrowers
- **GET** `/api/users/lenders` - Get all lenders
- **GET** `/api/users/admins` - Get all admins

### Database Test
- **GET** `/api/test-db` - Test database connection

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure MySQL service is running
   - Check if port 3306 is available
   - Verify firewall settings

2. **Access Denied**
   - Check username and password
   - Verify user privileges
   - Ensure user can connect from localhost

3. **Database Not Found**
   - Create the database: `CREATE DATABASE equirank;`
   - Check database name in environment variables

4. **Table Errors**
   - Run the schema file: `mysql -u equirank_user -p equirank < src/lib/schema.sql`
   - Check for syntax errors in the SQL file

### Debug Commands

```bash
# Check MySQL status
brew services list | grep mysql

# Check MySQL logs
tail -f /usr/local/var/mysql/*.err

# Test MySQL connection
mysql -u equirank_user -p -h localhost

# Show databases
SHOW DATABASES;

# Use equirank database
USE equirank;

# Show tables
SHOW TABLES;
```

## Production Considerations

### Security
- Use strong passwords
- Limit database user privileges
- Enable SSL connections
- Regular security updates

### Performance
- Configure connection pooling
- Optimize database indexes
- Monitor query performance
- Regular database maintenance

### Backup
- Set up automated backups
- Test restore procedures
- Store backups securely
- Document backup/restore process

## Next Steps

1. **User Authentication** - Implement login/registration with password hashing
2. **User Type Management** - Separate dashboards for borrowers, lenders, and admins
3. **Admin Panel** - User management and system administration
4. **Password Security** - Implement proper password hashing (bcrypt)
5. **Session Management** - JWT tokens or secure sessions

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review MySQL error logs
3. Verify environment variables
4. Test database connection manually
5. Check Node.js console for errors

---

*This guide covers the basic setup. For production deployments, additional security and performance considerations apply.*
