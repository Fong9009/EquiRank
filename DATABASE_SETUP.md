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

# Install additional dependencies for enhanced features
npm install --save-dev tsx dotenv
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

# Advanced Database Configuration
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0
DB_ACQUIRE_TIMEOUT=60000
DB_TIMEOUT=60000
DB_MAX_RETRIES=3
DB_RETRY_DELAY=1000
DB_BACKOFF_MULTIPLIER=2
DB_HEALTH_CHECK_INTERVAL=30000

# SSL Configuration (Production)
DB_SSL_ENABLED=false
DB_SSL_REJECT_UNAUTHORIZED=true
DB_SSL_CA=
DB_SSL_CERT=
DB_SSL_KEY=

# Backup Configuration
DB_BACKUP_ENABLED=false
DB_BACKUP_DIR=./backups
DB_MAX_BACKUPS=10
DB_BACKUP_INTERVAL=86400000
DB_COMPRESS_BACKUPS=true
DB_BACKUP_RETENTION_DAYS=30
```

**Important**: Never commit `.env.local` to version control!

### 6. Initialize Database Schema

```bash
# Connect to MySQL and run the schema
mysql -u equirank_user -p equirank < src/database/schema.sql
```

Or manually copy and paste the contents of `src/database/schema.sql` into your MySQL client.

## 🚀 Enhanced Database Features

### 1. 🔒 SSL Configuration for Production
- **Automatic SSL detection** based on `NODE_ENV`
- **Configurable SSL settings** via environment variables
- **Production-ready security** with certificate validation

### 2. 🔄 Connection Retry Logic
- **Exponential backoff** retry strategy
- **Configurable retry limits** and delays
- **Smart error detection** for connection issues
- **Automatic health monitoring** with periodic checks

### 3. 📋 Database Migration System
- **Version-controlled schema changes**
- **Automatic migration tracking**
- **Rollback capabilities**
- **Checksum validation** for migration integrity

### 4. 💾 Automated Backup Strategy
- **Scheduled backups** with configurable intervals
- **Compression support** (gzip)
- **Retention policies** for old backups
- **Restore functionality** from backup files

## 🛠️ Database Management CLI

The enhanced system includes a comprehensive CLI tool for database operations:

### Available Commands

```bash
# Database Management
npm run db:init          # Initialize database system
npm run db:health        # Check database health
npm run db:shutdown      # Gracefully shutdown

# Migration Management  
npm run db:migrate       # Run pending migrations
npm run db:status        # Show migration status

# Backup Operations
npm run db:backup        # Create new backup
npm run db:backup:list   # List all backups
npm run db:backup:restore <file>  # Restore from backup
npm run db:backup:start  # Start automated backups
npm run db:backup:stop   # Stop automated backups
npm run db:backup:config # Show backup configuration
```

### Quick Start with CLI

```bash
# 1. Initialize the enhanced database system
npm run db:init

# 2. Check database health
npm run db:health

# 3. Create a backup
npm run db:backup

# 4. Run migrations
npm run db:migrate
```

## Testing the Connection

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Test Database Connection

Visit `http://localhost:3000/api/test-db` in your browser or use the CLI:

```bash
npm run db:health
```

### 3. Test Enhanced Features

```bash
# Test backup system
npm run db:backup

# Test migration system
npm run db:status

# Test health monitoring
npm run db:health
```

## 🔧 Production Deployment

### 1. Environment Setup
```bash
# Set production environment
NODE_ENV=production

# Enable SSL
DB_SSL_ENABLED=true
DB_SSL_REJECT_UNAUTHORIZED=true

# Configure SSL certificates
DB_SSL_CA=/etc/ssl/certs/ca-certificates.crt
DB_SSL_CERT=/etc/ssl/certs/your-cert.pem
DB_SSL_KEY=/etc/ssl/private/your-key.pem

# Enable automated backups
DB_BACKUP_ENABLED=true
DB_BACKUP_DIR=/var/backups/equirank
DB_BACKUP_INTERVAL=86400000  # 24 hours
```

### 2. SSL Certificate Management
```bash
# Generate self-signed certificate (development)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# For production, use proper CA-signed certificates
# Contact your certificate authority or use Let's Encrypt
```

### 3. Backup Directory Permissions
```bash
# Create backup directory with proper permissions
sudo mkdir -p /var/backups/equirank
sudo chown equirank:equirank /var/backups/equirank
sudo chmod 750 /var/backups/equirank
```

## 📊 Monitoring and Health Checks

### Health Check Endpoint
```typescript
// GET /api/database/health
export async function GET() {
    const health = getDatabaseHealth();
    return NextResponse.json(health);
}
```

### Health Status Response
```json
{
    "isHealthy": true,
    "lastHealthCheck": "2024-01-01T12:00:00.000Z",
    "uptime": 3600000,
    "config": {
        "host": "localhost",
        "port": 3306,
        "database": "equirank",
        "connectionLimit": 10,
        "sslEnabled": false
    }
}
```

## 🚨 Error Handling

### Connection Errors
The system automatically retries on connection-related errors:
- `ECONNRESET` - Connection reset
- `ECONNREFUSED` - Connection refused
- `ETIMEDOUT` - Connection timeout
- `PROTOCOL_CONNECTION_LOST` - Protocol connection lost

### Query Errors
- **Non-connection errors** are not retried
- **Detailed error logging** for debugging
- **Graceful degradation** when possible

## 🔄 Migration Workflow

### 1. Create Migration File
```sql
-- migrations/002_add_user_preferences.sql
ALTER TABLE users ADD COLUMN preferences JSON;
```

### 2. Execute Migration
```bash
npm run db:migrate
```

### 3. Verify Migration
```bash
npm run db:status
```

### 4. Rollback if Needed
```typescript
import { rollbackMigration } from '@/database/migrations';
await rollbackMigration('002_add_user_preferences');
```

## 💾 Backup Strategy

### Backup Types
- **Full Backup**: Schema + Data (recommended for production)
- **Schema Backup**: Structure only (for development)
- **Data Backup**: Data only (for specific use cases)

### Backup Schedule
- **Development**: Manual backups as needed
- **Staging**: Daily backups
- **Production**: Hourly/daily backups with retention policies

### Backup Retention
- **Recent backups**: Keep last 10 backups
- **Time-based**: Keep backups for 30 days
- **Compression**: Automatic gzip compression

## 🔒 Security Features

### SSL/TLS Encryption
- **Production SSL** with certificate validation
- **Configurable SSL modes** for different environments
- **Secure connection strings** for production

### Connection Security
- **Connection pooling** with limits
- **Query timeouts** to prevent hanging connections
- **Graceful shutdown** for security

### Backup Security
- **Checksum validation** for backup integrity
- **Secure backup storage** with proper permissions
- **Encrypted backups** (future enhancement)

## 📈 Performance Optimizations

### Connection Pooling
- **Configurable pool size** based on server capacity
- **Connection reuse** for better performance
- **Queue management** for high-load scenarios

### Query Optimization
- **Automatic retry** for transient failures
- **Timeout handling** for long-running queries
- **Connection health monitoring**

## 🧪 Testing

### Test Database Connection
```bash
npm run db:health
```

### Test Backup System
```bash
# Create test backup
npm run db:backup

# List backups
npm run db:backup:list

# Test restore (use test database)
npm run db:backup:restore ./backups/test_backup.sql
```

### Test Migration System
```bash
# Check migration status
npm run db:status

# Run migrations
npm run db:migrate
```

## 🎯 Quick Start Checklist

- [ ] Set environment variables in `.env.local`
- [ ] Run `npm run db:init` to initialize database
- [ ] Test connection with `npm run db:health`
- [ ] Create first backup with `npm run db:backup`
- [ ] Configure automated backups if needed
- [ ] Test migration system with `npm run db:status`
- [ ] Verify SSL configuration in production
- [ ] Set up monitoring and alerting
- [ ] Document backup and restore procedures