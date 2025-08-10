'use client';

import { useState } from 'react';
import styles from '@/styles/pages/login/loginForm.module.css';

interface LoginData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage({
          type: 'success',
          text: 'Login successful! Redirecting...'
        });
        
        // Check if user is admin and set admin token
        if (data.user && data.user.user_type === 'admin') {
          localStorage.setItem('adminToken', 'admin-authenticated');
          // Redirect admin to admin panel
          setTimeout(() => {
            window.location.href = '/admin';
          }, 1000);
        } else {
          // Check for redirect parameter
          const urlParams = new URLSearchParams(window.location.search);
          const redirect = urlParams.get('redirect');
          
          // Redirect to specified page or home
          setTimeout(() => {
            window.location.href = redirect || '/';
          }, 1000);
        }
      } else {
        setSubmitMessage({
          type: 'error',
          text: data.error || 'Login failed'
        });
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: 'Network error. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1>Welcome Back</h1>
          <p>Sign in to your EquiRank account</p>
        </div>

        {submitMessage && (
          <div className={`${styles.message} ${styles[submitMessage.type]}`}>
            {submitMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
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

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.password ? styles.errorInput : ''}`}
              placeholder="Enter your password"
            />
            {errors.password && <span className={styles.error}>{errors.password}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Don't have an account?{' '}
            <a href="/register" className={styles.link}>Register here</a>
          </p>
          <p>
            <a href="/contact-us" className={styles.link}>Forgot your password?</a>
          </p>
        </div>
      </div>
    </div>
  );
}
