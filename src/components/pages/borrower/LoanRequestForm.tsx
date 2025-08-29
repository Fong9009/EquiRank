'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import styles from '@/styles/pages/borrower/loanRequestForm.module.css';

interface LoanRequestFormData {
  amount_requested: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF' | 'CNY';
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
    loan_purpose: '',
    loan_type: 'working_capital',
    other_loan_type: '',
    expires_at: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
