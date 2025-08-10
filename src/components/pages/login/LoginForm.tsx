'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import styles from '@/styles/pages/login/loginForm.module.css';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        // Handle NextAuth specific errors
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (result?.ok) {
        // Redirect based on user type or specified redirect
        router.push(redirect);
      } else {
        // This means authentication failed (result is null or undefined)
        // Provide a helpful error message
        if (!formData.email || !formData.password) {
          setError('Please enter both email and password.');
        } else {
          setError('Invalid email or password. Please check your credentials and try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  return (
    <div className={styles.loginForm}>
      <div className={styles.formContainer}>
        <h2>Welcome to EquiRank</h2>
        <p>Access your investment dashboard</p>
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.formFooter}>
          <p>Don't have an account? <a href="/register">Sign up</a></p>
          <p style={{ marginTop: '10px', fontSize: '0.8rem', opacity: 0.7 }}>
            Demo accounts available - check the documentation
          </p>
        </div>
      </div>
    </div>
  );
}
