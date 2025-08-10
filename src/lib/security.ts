import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Password security
export const SALT_ROUNDS = 12; // Higher = more secure but slower

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// JWT security
export function generateJWT(payload: any, expiresIn: string = '24h'): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not configured');
  }
  
  return jwt.sign(payload, secret, { 
    expiresIn,
    issuer: 'equirank',
    audience: 'equirank-users'
  } as jwt.SignOptions);
}

export function verifyJWT(token: string): any {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not configured');
  }
  
  try {
    return jwt.verify(token, secret, {
      issuer: 'equirank',
      audience: 'equirank-users'
    });
  } catch (error) {
    throw new Error('Invalid JWT token');
  }
}

// Password validation
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Enhanced email validation
export function validateEmail(email: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }
  
  // Length check
  if (email.length > 255) {
    errors.push('Email address is too long (max 255 characters)');
  }
  
  // Local part length check (before @)
  const localPart = email.split('@')[0];
  if (localPart && localPart.length > 64) {
    errors.push('Local part of email is too long (max 64 characters)');
  }
  
  // Domain length check (after @)
  const domain = email.split('@')[1];
  if (domain && domain.length > 253) {
    errors.push('Domain part of email is too long (max 253 characters)');
  }
  
  // Check for common invalid patterns
  if (email.startsWith('.') || email.endsWith('.')) {
    errors.push('Email cannot start or end with a dot');
  }
  
  if (email.includes('..')) {
    errors.push('Email cannot contain consecutive dots');
  }
  
  // Check for common disposable email domains (basic check)
  const disposableDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
  const domainLower = domain?.toLowerCase();
  if (domainLower && disposableDomains.includes(domainLower)) {
    errors.push('Disposable email addresses are not allowed');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Session security
export const SESSION_CONFIG = {
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60, // 24 hours
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax' as const,
};

// CSRF protection
export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken;
}
