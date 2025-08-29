'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import styles from '@/styles/pages/borrower/loanRequestForm.module.css';

interface LoanRequestFormData {
  amount_requested: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF' | 'CNY';
  company_description: string;
  social_media_links: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
    website: string;
  };
  loan_purpose: string;
  loan_type: 'equipment' | 'expansion' | 'working_capital' | 'inventory' | 'real_estate' | 'startup' | 'other';
  other_loan_type: string;
  expires_at: string;
}

export default function LoanRequestForm() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<LoanRequestFormData>({
    amount_requested: '',
    currency: 'USD',
    company_description: '',
    social_media_links: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: '',
      website: ''
    },
    loan_purpose: '',
    loan_type: 'working_capital',
    other_loan_type: '',
    expires_at: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const socialField = name.replace('social_', '');
      setFormData(prev => ({
        ...prev,
        social_media_links: {
          ...prev.social_media_links,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear message when user starts typing
    if (message) setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // Frontend validation for other loan type
    if (formData.loan_type === 'other' && !formData.other_loan_type.trim()) {
      setMessage({ type: 'error', text: 'Please specify the loan type when selecting "other"' });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/loan-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount_requested: parseFloat(formData.amount_requested),
          // For individual users, don't send company-related fields
          company_description: session?.user?.entityType === 'company' ? formData.company_description : null,
          expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Loan request submitted successfully!' });
        // Reset form
        setFormData({
          amount_requested: '',
          currency: 'USD',
          company_description: '',
          social_media_links: {
            linkedin: '',
            twitter: '',
            facebook: '',
            instagram: '',
            website: ''
          },
          loan_purpose: '',
          loan_type: 'working_capital',
          other_loan_type: '',
          expires_at: ''
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to submit loan request' });
      }
    } catch (error) {
      console.error('Error submitting loan request:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session?.user) {
    return <div>Please log in to submit a loan request.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Submit Loan Request</h2>
        <p className={styles.subtitle}>Tell us about your funding needs</p>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="amount_requested" className={styles.label}>
                Amount Requested *
              </label>
              <input
                type="number"
                id="amount_requested"
                name="amount_requested"
                value={formData.amount_requested}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className={styles.input}
                placeholder="Enter amount"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="currency" className={styles.label}>
                Currency *
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                required
                className={styles.select}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
                <option value="JPY">JPY</option>
                <option value="CHF">CHF</option>
                <option value="CNY">CNY</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="loan_type" className={styles.label}>
              Loan Type *
            </label>
            <select
              id="loan_type"
              name="loan_type"
              value={formData.loan_type}
              onChange={handleInputChange}
              required
              className={styles.select}
            >
              <option value="working_capital">Working Capital</option>
              <option value="equipment">Equipment</option>
              <option value="expansion">Expansion</option>
              <option value="inventory">Inventory</option>
              <option value="real_estate">Real Estate</option>
              <option value="startup">Startup</option>
              <option value="other">Other</option>
            </select>
          </div>

          {formData.loan_type === 'other' && (
            <div className={styles.formGroup}>
              <label htmlFor="other_loan_type" className={styles.label}>
                Please Specify *
              </label>
              <div className={styles.inputWithCounter}>
                <input
                  type="text"
                  id="other_loan_type"
                  name="other_loan_type"
                  value={formData.other_loan_type}
                  onChange={handleInputChange}
                  required
                  maxLength={50}
                  className={styles.input}
                  placeholder="Describe the loan type..."
                  aria-describedby="other-loan-type-hint"
                />
                <span className={`${styles.characterCount} ${
                  formData.other_loan_type.length >= 45 ? styles.danger :
                  formData.other_loan_type.length >= 40 ? styles.warning : ''
                }`}>
                  {formData.other_loan_type.length}/50
                </span>
              </div>
              <small id="other-loan-type-hint" className={styles.hintText}>
                Please provide a brief description of your loan type (max 50 characters)
              </small>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="loan_purpose" className={styles.label}>
              Loan Purpose *
            </label>
            <textarea
              id="loan_purpose"
              name="loan_purpose"
              value={formData.loan_purpose}
              onChange={handleInputChange}
              required
              rows={4}
              className={styles.textarea}
              placeholder="Describe how you plan to use the loan funds..."
            />
          </div>

          {session?.user?.entityType === 'company' && (
            <>
              <div className={styles.companySection}>
                <h3 className={styles.sectionTitle}>Company Information</h3>
                <p className={styles.sectionSubtitle}>Tell us about your business</p>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="company_description" className={styles.label}>
                  Company Description
                </label>
                <textarea
                  id="company_description"
                  name="company_description"
                  value={formData.company_description}
                  onChange={handleInputChange}
                  rows={3}
                  className={styles.textarea}
                  placeholder="Tell us about your company..."
                />
              </div>


            </>
          )}

          {session?.user?.entityType === 'individual' && (
            <div className={styles.individualNote}>
              <p>Note: Company information fields are not available for individual borrowers.</p>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Social Media Links</label>
            <div className={styles.socialGrid}>
              <input
                type="url"
                name="social_linkedin"
                value={formData.social_media_links.linkedin}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="LinkedIn URL"
              />
              <input
                type="url"
                name="social_twitter"
                value={formData.social_media_links.twitter}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Twitter URL"
              />
              <input
                type="url"
                name="social_facebook"
                value={formData.social_media_links.facebook}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Facebook URL"
              />
              <input
                type="url"
                name="social_instagram"
                value={formData.social_media_links.instagram}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Instagram URL"
              />
              <input
                type="url"
                name="social_website"
                value={formData.social_media_links.website}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Website URL"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="expires_at" className={styles.label}>
              Request Expiry Date
            </label>
            <input
              type="date"
              id="expires_at"
              name="expires_at"
              value={formData.expires_at}
              onChange={handleInputChange}
              className={styles.input}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className={styles.submitSection}>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Loan Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
