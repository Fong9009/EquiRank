import { Suspense } from 'react';
import LoginForm from '@/components/pages/login/LoginForm';

export default function LoginPage() {
  return (
    <div className="loginPage">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
