'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from '@/styles/pages/profile/profileCompletionWizard.module.css';

interface ProfileData {
  // Basic user info
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  company: string;
  bio: string;
  website: string;
  linkedin: string;
  
  // Borrower-specific fields
  industry?: string;
  location?: string;
  capabilities?: string;
  years_in_business?: number;
  employee_count?: number;
  revenue_range?: string;
  
  // Lender-specific fields
  institution_type?: string;
  risk_appetite?: string;
  target_industries?: string[];
  target_markets?: string[];
  min_loan_amount?: number;
  max_loan_amount?: number;
}

interface ProfileCompletionWizardProps {
  userType: 'borrower' | 'lender' | 'admin';
  currentProfile: ProfileData;
  onComplete: () => void;
  onCancel: () => void;
}

const ProfileCompletionWizard: React.FC<ProfileCompletionWizardProps> = ({
  userType,
  currentProfile,
  onComplete,
  onCancel
}) => {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>(currentProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = userType === 'borrower' ? 4 : userType === 'lender' ? 4 : 2;

  // Step configurations
  const steps = {
    borrower: [
      { id: 1, title: 'Basic Information', fields: ['first_name', 'last_name', 'phone', 'address', 'company', 'bio'] },
      { id: 2, title: 'Business Details', fields: ['industry', 'location', 'capabilities'] },
      { id: 3, title: 'Company Size', fields: ['years_in_business', 'employee_count', 'revenue_range'] },
      { id: 4, title: 'Online Presence', fields: ['website', 'linkedin', 'preferences'] }
    ],
    lender: [
      { id: 1, title: 'Basic Information', fields: ['first_name', 'last_name', 'phone', 'address', 'company', 'bio'] },
      { id: 2, title: 'Institution Details', fields: ['institution_type', 'risk_appetite'] },
      { id: 3, title: 'Investment Preferences', fields: ['target_industries', 'target_markets', 'min_loan_amount', 'max_loan_amount'] },
      { id: 4, title: 'Online Presence', fields: ['website', 'linkedin', 'preferences'] }
    ],
    admin: [
      { id: 1, title: 'Basic Information', fields: ['first_name', 'last_name', 'phone', 'address', 'company', 'bio'] },
      { id: 2, title: 'Online Presence', fields: ['website', 'linkedin', 'preferences'] }
    ]
  };

  const currentStepConfig = steps[userType].find(step => step.id === currentStep);

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!currentStepConfig) return false;

    currentStepConfig.fields.forEach(field => {
      const value = profileData[field as keyof ProfileData];
      
      if (field === 'first_name' || field === 'last_name') {
        if (!value || (value as string).trim().length < 2) {
          newErrors[field] = `${field.replace('_', ' ')} is required and must be at least 2 characters`;
        }
      } else if (field === 'phone') {
        if (!value || (value as string).trim().length < 10) {
          newErrors[field] = 'Phone number is required and must be at least 10 digits';
        }
      } else if (field === 'address') {
        if (!value || (value as string).trim().length < 10) {
          newErrors[field] = 'Address is required and must be at least 10 characters';
        }
      } else if (field === 'company') {
        if (!value || (value as string).trim().length < 2) {
          newErrors[field] = 'Company name is required and must be at least 2 characters';
        }
      } else if (field === 'industry' || field === 'location') {
        if (!value || (value as string).trim().length < 2) {
          newErrors[field] = `${field} is required and must be at least 2 characters`;
        }
      } else if (field === 'years_in_business' || field === 'employee_count') {
        if (!value || (value as number) < 0) {
          newErrors[field] = `${field.replace('_', ' ')} must be a positive number`;
        }
      } else if (field === 'min_loan_amount' || field === 'max_loan_amount') {
        if (!value || (value as number) <= 0) {
          newErrors[field] = `${field.replace('_', ' ')} must be greater than 0`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        onComplete();
      } else {
        const error = await response.json();
        console.error('Failed to update profile:', error);
        setErrors({ general: 'Failed to update profile. Please try again.' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: string) => {
    const value = profileData[field as keyof ProfileData];
    const error = errors[field];

    switch (field) {
      case 'first_name':
      case 'last_name':
      case 'phone':
      case 'address':
      case 'company':
      case 'bio':
      case 'website':
      case 'linkedin':
      case 'industry':
      case 'location':
      case 'capabilities':
        return (
          <div key={field} className={styles.fieldGroup}>
            <label className={styles.label}>
              {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:
              {['first_name', 'last_name', 'phone', 'address', 'company', 'industry', 'location'].includes(field) && <span className={styles.required}>*</span>}
            </label>
            <input
              type={field === 'phone' ? 'tel' : field.includes('website') || field.includes('linkedin') ? 'url' : 'text'}
              value={value as string || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={`${styles.input} ${error ? styles.error : ''}`}
              placeholder={`Enter your ${field.replace('_', ' ')}`}
            />
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      case 'years_in_business':
      case 'employee_count':
        return (
          <div key={field} className={styles.fieldGroup}>
            <label className={styles.label}>
              {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:
              <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              min="0"
              value={value as number || ''}
              onChange={(e) => handleInputChange(field, parseInt(e.target.value) || 0)}
              className={`${styles.input} ${error ? styles.error : ''}`}
              placeholder={`Enter ${field.replace('_', ' ')}`}
            />
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      case 'revenue_range':
        return (
          <div key={field} className={styles.fieldGroup}>
            <label className={styles.label}>
              Revenue Range:
              <span className={styles.required}>*</span>
            </label>
            <select
              value={value as string || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={`${styles.select} ${error ? styles.error : ''}`}
            >
              <option value="">Select revenue range</option>
              <option value="0-50k">$0 - $50,000</option>
              <option value="50k-100k">$50,000 - $100,000</option>
              <option value="100k-500k">$100,000 - $500,000</option>
              <option value="500k-1m">$500,000 - $1,000,000</option>
              <option value="1m-5m">$1,000,000 - $5,000,000</option>
              <option value="5m-10m">$5,000,000 - $10,000,000</option>
              <option value="10m-50m">$10,000,000 - $50,000,000</option>
              <option value="50m+">$50,000,000+</option>
            </select>
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      case 'institution_type':
        return (
          <div key={field} className={styles.fieldGroup}>
            <label className={styles.label}>
              Institution Type:
              <span className={styles.required}>*</span>
            </label>
            <select
              value={value as string || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={`${styles.select} ${error ? styles.error : ''}`}
            >
              <option value="">Select institution type</option>
              <option value="bank">Bank</option>
              <option value="credit_union">Credit Union</option>
              <option value="investment_firm">Investment Firm</option>
              <option value="private_lender">Private Lender</option>
              <option value="peer_to_peer">Peer-to-Peer</option>
              <option value="other">Other</option>
            </select>
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      case 'risk_appetite':
        return (
          <div key={field} className={styles.fieldGroup}>
            <label className={styles.label}>
              Risk Appetite:
              <span className={styles.required}>*</span>
            </label>
            <select
              value={value as string || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={`${styles.select} ${error ? styles.error : ''}`}
            >
              <option value="">Select risk appetite</option>
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      case 'min_loan_amount':
      case 'max_loan_amount':
        return (
          <div key={field} className={styles.fieldGroup}>
            <label className={styles.label}>
              {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} ($):
              <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={value as number || ''}
              onChange={(e) => handleInputChange(field, parseFloat(e.target.value) || 0)}
              className={`${styles.input} ${error ? styles.error : ''}`}
              placeholder={`Enter ${field.replace('_', ' ')}`}
            />
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      case 'target_industries':
      case 'target_markets':
        return (
          <div key={field} className={styles.fieldGroup}>
            <label className={styles.label}>
              {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:
              <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={(value as string[])?.join(', ') || ''}
              onChange={(e) => handleInputChange(field, e.target.value.split(',').map(s => s.trim()).filter(s => s))}
              className={`${styles.input} ${error ? styles.error : ''}`}
              placeholder={`Enter ${field.replace('_', ' ')} separated by commas`}
            />
            <small className={styles.helpText}>Separate multiple items with commas</small>
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      case 'preferences':
        return (
          <div key={field} className={styles.fieldGroup}>
            <label className={styles.label}>
              Preferences:
            </label>
            <textarea
              value={typeof value === 'string' ? value : JSON.stringify(value || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleInputChange(field, parsed);
                } catch {
                  handleInputChange(field, e.target.value);
                }
              }}
              className={`${styles.input} ${error ? styles.error : ''}`}
              placeholder="Enter your preferences as JSON (optional)"
              rows={4}
            />
            <small className={styles.helpText}>Enter preferences as JSON format (optional)</small>
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.wizard}>
      <div className={styles.header}>
        <h2>Complete Your Profile</h2>
        <p>Step {currentStep} of {totalSteps}: {currentStepConfig?.title}</p>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className={styles.content}>
        {errors.general && (
          <div className={styles.errorBanner}>
            {errors.general}
          </div>
        )}

        <div className={styles.stepContent}>
          {currentStepConfig?.fields.map(field => renderField(field))}
        </div>
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
          disabled={isLoading}
        >
          Cancel
        </button>
        
        <div className={styles.navigation}>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className={styles.previousButton}
              disabled={isLoading}
            >
              Previous
            </button>
          )}
          
          <button
            type="button"
            onClick={handleNext}
            className={styles.nextButton}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : currentStep === totalSteps ? 'Complete Profile' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionWizard;