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
        // Handle specific error messages
        switch (result.error) {
          case 'Email and password are required':
            setError('Please enter both email and password.');
            break;
          case 'Invalid email or password':
            setError('Invalid email or password. Please check your credentials and try again.');
            break;
          case 'Account is deactivated. Please contact support.':
            setError('Your account has been deactivated. Please contact support for assistance.');
            break;
          case 'Account is pending admin approval. Please wait for approval or contact support.':
            setError('Your account is pending approval. You will be notified once approved.');
            break;
          case 'Authentication failed. Please try again.':
            setError('Authentication failed. Please try again or contact support if the problem persists.');
            break;
          default:
            setError(result.error);
        }
      } else if (result?.ok) {
        // Redirect based on user type or specified redirect
        router.push(redirect);
      }
    } catch (error) {
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
  };

  return (
    <div className={styles.loginForm}>
      <div className={styles.formContainer}>
        <h2>Welcome Back</h2>
        <p>Sign in to your account</p>
        
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
