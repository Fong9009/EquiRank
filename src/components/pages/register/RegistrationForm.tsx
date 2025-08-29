'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ReCAPTCHA from 'react-google-recaptcha';
import PasswordInput from '@/components/common/PasswordInput';
import styles from '@/styles/pages/register/registrationForm.module.css';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: 'borrower' | 'lender';
  company: string;
  phone: string;
  address: string;
}

export default function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userType: 'borrower',
    company: '',
    phone: '',
    address: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Generate CSRF token on component mount
  useEffect(() => {
    const generateToken = () => {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    };
    setCsrfToken(generateToken());
  }, []);

  // Validate password confirmation when formData changes
  useEffect(() => {
    if (formData.password || formData.confirmPassword) {
      validatePasswordConfirmation(formData.password, formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation for specific fields
    if (name === 'firstName' || name === 'lastName') {
      validateNameField(name, value);
    } else if (name === 'phone') {
      validatePhoneField(value);
    } else if (name === 'password' || name === 'confirmPassword') {
      // Pass the current values to avoid stale state issues
      const currentPassword = name === 'password' ? value : formData.password;
      const currentConfirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;
      validatePasswordConfirmation(currentPassword, currentConfirmPassword);
    }
  };

  // Validate name fields (alphabetic only)
  const validateNameField = (fieldName: string, value: string) => {
    if (value && value.length < 2) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: 'Name must be at least 2 characters long'
      }));
    } else if (value && value.length > 50) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: 'Name cannot exceed 50 characters'
      }));
    } else if (value && !/^[A-Za-z\s]+$/.test(value)) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: 'Name can only contain letters and spaces (A-Z, a-z, space)'
      }));
    } else if (errors[fieldName]) {
      // Clear error if validation passes
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Validate phone field (numbers only)
  const validatePhoneField = (value: string) => {
    if (value && !/^[0-9]+$/.test(value)) {
      setErrors(prev => ({
        ...prev,
        phone: 'Phone number can only contain numbers (0-9)'
      }));
    } else if (value && value.length < 10) {
      setErrors(prev => ({
        ...prev,
        phone: 'Phone number must contain at least 10 digits'
      }));
    } else if (value && value.length > 15) {
      setErrors(prev => ({
        ...prev,
        phone: 'Phone number cannot exceed 15 digits'
      }));
    } else if (errors.phone) {
      // Clear error if validation passes
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }
  };

  // Validate password confirmation in real-time
  const validatePasswordConfirmation = (password: string, confirmPassword: string) => {
    try {
      console.log('🔍 Password validation:', { password, confirmPassword, match: password === confirmPassword });
      
      // Clear any existing confirmPassword error first
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });

      // Only validate if both fields have values
      if (password && confirmPassword) {
        if (password !== confirmPassword) {
          console.log('❌ Passwords do not match, setting error');
          setErrors(prev => ({
            ...prev,
            confirmPassword: 'Passwords do not match'
          }));
        } else {
          console.log('✅ Passwords match, error should be cleared');
        }
        // If passwords match, error is already cleared above
      } else if (confirmPassword && !password) {
        // Show error if confirm password is filled but password is empty
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Please enter your password first'
        }));
      }
    } catch (error) {
      console.error('Error in password confirmation validation:', error);
    }
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.userType) newErrors.userType = 'User type is required';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // First name validation
    if (formData.firstName) {
      if (!/^[A-Za-z]+$/.test(formData.firstName)) {
        newErrors.firstName = 'First name can only contain letters (A-Z, a-z)';
      } else if (formData.firstName.length < 2) {
        newErrors.firstName = 'First name must be at least 2 characters long';
      } else if (formData.firstName.length > 50) {
        newErrors.firstName = 'First name cannot exceed 50 characters';
      }
    }

    // Last name validation
    if (formData.lastName) {
      if (!/^[A-Za-z]+$/.test(formData.lastName)) {
        newErrors.lastName = 'Last name can only contain letters (A-Z, a-z)';
      } else if (formData.lastName.length < 2) {
        newErrors.lastName = 'Last name must be at least 2 characters long';
      } else if (formData.lastName.length > 50) {
        newErrors.lastName = 'Last name cannot exceed 50 characters';
      }
    }

    // Phone validation (if provided)
    if (formData.phone) {
      if (!/^[0-9]+$/.test(formData.phone)) {
        newErrors.phone = 'Phone number can only contain numbers (0-9)';
      } else if (formData.phone.length < 10) {
        newErrors.phone = 'Phone number must contain at least 10 digits';
      } else if (formData.phone.length > 15) {
        newErrors.phone = 'Phone number cannot exceed 15 digits';
      }
    }

    // Password validation
    if (formData.password) {
      if (formData.password.length < 12) {
        newErrors.password = 'Password must be at least 12 characters long.';
      } else {
        const passwordErrors = [];
        if (!/[a-z]/.test(formData.password)) {
          passwordErrors.push("one lowercase letter");
        }
        if (!/[A-Z]/.test(formData.password)) {
          passwordErrors.push("one uppercase letter");
        }
        if (!/[0-9]/.test(formData.password)) {
          passwordErrors.push("one number");
        }
        if (!/[!@#$%^&*(),.?":{}|<>_]/.test(formData.password)) {
          passwordErrors.push("one special character");
        }
        if (passwordErrors.length > 0) {
          newErrors.password = `Password must contain at least ${passwordErrors.join(", ")}.`;
        }
      }
    } else {
        newErrors.password = 'Password is required';
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Company name is always required
    if (!formData.company) {
      newErrors.company = 'Company name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log('Form submission - captchaToken:', captchaToken);
    if (!captchaToken) {
      setSubmitMessage({
        type: 'error',
        text: 'Please complete the reCAPTCHA verification to prove you\'re human'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

          try {
        const requestBody = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          userType: formData.userType,
          company: formData.company,
          phone: formData.phone,
          address: formData.address,
          csrfToken,
          captchaToken
        };
        
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify(requestBody),
        });

      if (response.ok) {
  setSubmitMessage({
    type: 'success',
    text: 'Registration submitted successfully! Your account is pending admin approval. You will receive an email once approved.'
  });
        scrollToTop();
        
        // Reset form
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          userType: 'borrower',
          entityType: 'company',
          company: '',
          phone: '',
          address: ''
        });
      } else {
        const error = await response.json();
        setSubmitMessage({
          type: 'error',
          text: error.error || 'Registration failed. Please try again.'
        });
        scrollToTop();
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.'
      });
      scrollToTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserTypeDescription = (type: string) => {
    switch (type) {
      case 'borrower':
        return 'Companies seeking funding or investment';
      case 'lender':
        return 'Banks, investors, or financial institutions';
      default:
        return '';
    }
  };



  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerBox}>
        <div className={styles.header}>
          <h1 className={styles.title}>Join EquiRank</h1>
          <p className={styles.subtitle}>Create your account to get started</p>
        </div>

        {submitMessage && (
          <div className={`${styles.message} ${styles[submitMessage.type]}`}>
            {submitMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Honeypot field to catch bots */}
          <div style={{ display: 'none' }}>
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              style={{ position: 'absolute', left: '-9999px' }}
            />
          </div>
          
                 {/* User Type Selection */}
                 <div className={styles.userTypeSection}>
                   <label className={styles.sectionLabel}>I am a:</label>
                   <div className={styles.userTypeOptions}>
                     {(['borrower', 'lender'] as const).map((type) => (
                       <label key={type} className={styles.userTypeOption}>
                         <input
                           type="radio"
                           name="userType"
                           value={type}
                           checked={formData.userType === type}
                           onChange={handleInputChange}
                           className={styles.radioInput}
                         />
                         <div className={styles.radioContent}>
                           <span className={styles.radioLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                           <span className={styles.radioDescription}>{getUserTypeDescription(type)}</span>
                         </div>
                       </label>
                     ))}
                   </div>
                   {errors.userType && <span className={styles.error}>{errors.userType}</span>}
                 </div>



          {/* Personal Information */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Personal Information</h3>
            
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="firstName" className={styles.label}>First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.firstName ? styles.errorInput : ''}`}
                  placeholder="e.g., John (letters only)"
                  maxLength={50}
                  pattern="[A-Za-z]+"
                  title="Only letters (A-Z, a-z) are allowed"
                />
                {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="lastName" className={styles.label}>Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.lastName ? styles.errorInput : ''}`}
                  placeholder="e.g., Smith (letters only)"
                  maxLength={50}
                  pattern="[A-Za-z]+"
                  title="Only letters (A-Z, a-z) are allowed"
                />
                {errors.lastName && <span className={styles.error}>{errors.lastName}</span>}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.email ? styles.errorInput : ''}`}
                placeholder="Enter your email address"
              />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>
          </div>
                {/* Company Information */}
                 <div className={styles.formSection}>
                   <h3 className={styles.sectionTitle}>Company Information</h3>

                   <div className={styles.inputGroup}>
                     <label htmlFor="company" className={styles.label}>Company Name *</label>
                     <input
                       type="text"
                       id="company"
                       name="company"
                       value={formData.company}
                       onChange={handleInputChange}
                       className={`${styles.input} ${errors.company ? styles.errorInput : ''}`}
                       placeholder="Enter your company name"
                       required
                     />
                     {errors.company && <span className={styles.error}>{errors.company}</span>}
                   </div>
                 </div>   
          {/* Contact Information */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Contact Information</h3>
            
            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.phone ? styles.errorInput : ''}`}
                placeholder="e.g., 5551234567 (numbers only)"
                maxLength={15}
                pattern="[0-9]+"
                title="Only numbers (0-9) are allowed"
              />
              {errors.phone && <span className={styles.error}>{errors.phone}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="address" className={styles.label}>Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Enter your address"
                rows={3}
              />
            </div>
          </div>

          {/* Security */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Security</h3>
            
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Password *</label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.password ? styles.errorInput : ''}`}
                placeholder="Create a strong password"
                required
              />
              {errors.password && <span className={styles.error}>{errors.password}</span>}
              <div className={styles.validationHint}>
                <strong>Password Requirements:</strong> At least 12 characters with uppercase, lowercase, number, and special character
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm Password *</label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.confirmPassword ? styles.errorInput : ''}`}
                placeholder="Confirm your password"
                required
              />
              {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
            </div>
          </div>

          {/* Validation Hints */}
          <div className={styles.validationHints}>
            <h4 className={styles.hintsTitle}>Field Requirements:</h4>
            <ul className={styles.hintsList}>
              <li><strong>Names:</strong> Letters and spaces only (A-Z, a-z, space) - no special characters or symbols</li>
              <li><strong>Phone:</strong> Numbers only (0-9) </li>
              <li><strong>Email:</strong> Valid email format (e.g., user@domain.com)</li>
              <li><strong>Password:</strong> Minimum 12 characters with mixed character types</li>
            </ul>
          </div>

          {/* reCAPTCHA */}
          <div className={styles.recaptchaContainer}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
              onChange={(token) => {
                console.log('reCAPTCHA token received:', token);
                setCaptchaToken(token);
              }}
              theme="dark"
            />
          </div>

          {/* Submit Button */}
          <div className={styles.submitSection}>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className={styles.loginLink}>
          <p>Already have an account? <Link href="/login" className={styles.link}>Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
