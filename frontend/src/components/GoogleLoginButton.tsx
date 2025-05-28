'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

export default function GoogleLoginButton() {
  const router = useRouter();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.avatar) {
          localStorage.setItem("avatar", data.avatar);
          window.dispatchEvent(new Event("avatar-updated"));
        }
        router.push('/dashboard');
      } else {
        console.error('Login failed');
      }

      console.log('credentialResponse:', credentialResponse);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          console.log('Login Failed');
        }}
        useOneTap
      />
    </div>
  );
} 