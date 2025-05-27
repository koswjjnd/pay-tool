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
        router.push('/dashboard'); // 登录成功后跳转到仪表板
        console.log('Google login response:', response);
        localStorage.setItem("avatar", credentialResponse.profileObj.imageUrl);
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