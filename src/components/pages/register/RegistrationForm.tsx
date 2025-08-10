'use client';

import { useState } from 'react';
import styles from '@/styles/pages/register/registrationForm.module.css';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: 'borrower' | 'lender';
  entityType: 'company' | 'individual';
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
    entityType: 'company',
    company: '',
    phone: '',
    address: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
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

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Company required for company entities
    if (formData.entityType === 'company' && !formData.company) {
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

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          userType: formData.userType,
          entityType: formData.entityType,
          company: formData.company,
          phone: formData.phone,
          address: formData.address
        }),
      });

      if (response.ok) {
  setSubmitMessage({
    type: 'success',
    text: 'Registration submitted successfully! Your account is pending admin approval. You will receive an email once approved.'
  });
        
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
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.'
      });
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

  const getEntityTypeDescription = (type: string) => {
    switch (type) {
      case 'company':
        return 'Business entity (Corporation, LLC, Partnership)';
      case 'individual':
        return 'Personal account (Sole Proprietor, Independent)';
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

                 {/* Entity Type Selection */}
                 <div className={styles.entityTypeSection}>
                   <label className={styles.sectionLabel}>Entity Type:</label>
                   <div className={styles.entityTypeOptions}>
                     {(['company', 'individual'] as const).map((type) => (
                       <label key={type} className={styles.entityTypeOption}>
                         <input
                           type="radio"
                           name="entityType"
                           value={type}
                           checked={formData.entityType === type}
                           onChange={handleInputChange}
                           className={styles.radioInput}
                         />
                         <div className={styles.radioContent}>
                           <span className={styles.radioLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                           <span className={styles.radioDescription}>{getEntityTypeDescription(type)}</span>
                         </div>
                       </label>
                     ))}
                   </div>
                   {errors.entityType && <span className={styles.error}>{errors.entityType}</span>}
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
                  placeholder="Enter your first name"
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
                  placeholder="Enter your last name"
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
                {/* Company Information (only for company entities) */}
                 {formData.entityType === 'company' && (
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
                       />
                       {errors.company && <span className={styles.error}>{errors.company}</span>}
                     </div>
                   </div>
                 )}   
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
                className={styles.input}
                placeholder="Enter your phone number"
              />
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
            
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.password ? styles.errorInput : ''}`}
                  placeholder="Create a password"
                />
                <div className={styles.passwordRequirements}>
                  <small>Password must contain:</small>
                  <ul>
                    <li>At least 6 characters</li>
                    <li>Letters and numbers</li>
                    <li>Special characters recommended</li>
                  </ul>
                </div>
                {errors.password && <span className={styles.error}>{errors.password}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.confirmPassword ? styles.errorInput : ''}`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
              </div>
            </div>
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
          <p>Already have an account? <span className={styles.link}>Contact us to sign in</span></p>
        </div>
      </div>
    </div>
  );
}
