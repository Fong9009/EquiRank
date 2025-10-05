'use client';
import {useEffect, useState} from 'react';
import PasswordInput from '@/components/common/PasswordInput';
import styles from '@/styles/pages/admin/addAdmin.module.css';
import clsx from 'clsx';
import {useSession} from "next-auth/react";
import CustomConfirmation from "@/components/common/CustomConfirmation";

export default function AddAdmin() {
  const { data: session } = useSession();
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
  const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  //Colour Mode Editing
  const textColour = theme === "light" ? styles.lightTextColour : styles.darkTextColour;
  const backgroundColour = theme === "light" ? styles.lightBackground : styles.darkBackground;

  // Custom confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    action: 'approve';
    userName: string;
    userId: number;
    message: string;
    title: string;
  } | null>(null);


  useEffect(() => {
    if (!session) return;
    fetch("/api/users/theme")
        .then(res => res.json())
        .then(data => {
          if (data.theme) {
            setTheme(data.theme.theme);
          } else {
            setTheme("auto");
          }
        });
  }, [session]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear message when user starts typing
    if (message) setMessage(null);
    
    // Real-time password validation
    if (name === 'password' || name === 'confirmPassword') {
      validatePasswordMatch();
    }
  };

  // Validate password matching in real-time
  const validatePasswordMatch = () => {
    if (form.password && form.confirmPassword) {
      if (form.password !== form.confirmPassword) {
        // Passwords don't match - this will be handled on form submission
        // We don't show error here to avoid confusion during typing
      }
    }
  };

  const handleConfirmation = async () => {
    if (!confirmationData) return;
    setShowConfirmation(false);
    setConfirmationData(null);
    await createAdmin(); // Call without event parameter
  };

  const showApprovalConfirmation = (e: React.FormEvent) => {
    e.preventDefault();

    setConfirmationData({
      action: 'approve',
      userName: `${form.firstName} ${form.lastName}`,
      userId: 0, // or remove if not needed
      title: 'Create Admin',
      message: `Are you sure you want to create an admin account for ${form.firstName} ${form.lastName}?`
    });
    setShowConfirmation(true);
  };

  const createAdmin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

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
      <div className={clsx(styles.card, backgroundColour)}>
        <div className={styles.header}>
          <h2>Add Admin</h2>
          <p>Create a new admin account. Only Super Admins can perform this action.</p>
        </div>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={showApprovalConfirmation} className={styles.form}>
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
              <input
                  className={styles.input}
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={onChange}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  title="Phone number must be exactly 10 digits"
                  required
              />
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
      {showConfirmation && confirmationData && (
          <CustomConfirmation
              isOpen={showConfirmation}
              onClose={() => setShowConfirmation(false)}
              onConfirm={handleConfirmation}
              title={confirmationData.title}
              message={confirmationData.message}
              userName={confirmationData.userName}
              action={confirmationData.action = 'approve'}
              confirmText={confirmationData.action = 'approve'}
              cancelText="Cancel"
          />
      )}
    </div>
  );
}


