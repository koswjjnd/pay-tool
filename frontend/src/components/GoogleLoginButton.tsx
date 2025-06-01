'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

export default function GoogleLoginButton() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const setAvatar = useUserStore((state) => state.setAvatar);

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
          setAvatar(data.avatar);
        }
        if (data.token && data.userId && data.username) {
          setUser({
            token: data.token,
            userId: data.userId,
            username: data.username,
            avatar: data.avatar
          });
        }
        router.push('/dashboard');
      } else {
        console.error('Login failed');
      }
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