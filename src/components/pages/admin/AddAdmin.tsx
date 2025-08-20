'use client';
import { useState } from 'react';
import PasswordInput from '@/components/common/PasswordInput';
import styles from '@/styles/pages/admin/addAdmin.module.css';

export default function AddAdmin() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (message) setMessage(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add confirmation dialog before creating admin
    if (!confirm('Are you sure you want to create this admin account?')) {
      return;
    }
    
    setSubmitting(true);
    setMessage(null);
    try {
      if (form.password !== form.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match' });
        setSubmitting(false);
        return;
      }
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to create admin' });
      } else {
        setMessage({ type: 'success', text: 'Admin created successfully' });
        setForm({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Add Admin</h2>
          <p>Create a new admin account. Only Super Admins can perform this action.</p>
        </div>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={onSubmit} className={styles.form}>
          {/* Row 1: First / Last Name */}
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>First Name</label>
              <input className={styles.input} name="firstName" value={form.firstName} onChange={onChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Last Name</label>
              <input className={styles.input} name="lastName" value={form.lastName} onChange={onChange} required />
            </div>
          </div>

          {/* Row 2: Email / Phone */}
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} name="email" type="email" value={form.email} onChange={onChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Phone Number</label>
              <input className={styles.input} name="phone" value={form.phone} onChange={onChange} required />
            </div>
          </div>

          {/* Row 3: Password / Confirm Password */}
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <PasswordInput className={styles.input} name="password" value={form.password} onChange={onChange} required />
              <div className={styles.passwordRequirements}>
                <small>Password must contain:</small>
                <ul>
                  <li>At least 12 characters</li>
                  <li>At least one uppercase letter (A-Z)</li>
                  <li>At least one lowercase letter (a-z)</li>
                  <li>At least one number (0-9)</li>
                  <li>At least one special character (e.g., !@#$%^&*_)</li>
                </ul>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirm Password</label>
              <PasswordInput className={styles.input} name="confirmPassword" value={form.confirmPassword} onChange={onChange} required />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.submitButton} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


