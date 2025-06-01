'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { useUserStore } from '@/store/userStore';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `mutation Login($username: String!, $password: String!) {
            login(username: $username, password: $password) {
              token
              user {
                id
                username
                email
                name
              }
            }
          }`,
          variables: {
            username: formData.username,
            password: formData.password,
          },
        }),
      });
      const data = await res.json();
      if (data.errors && data.errors.length > 0) {
        setError(data.errors[0].message || 'Login failed');
      } else {
        // 使用 Zustand store 保存用户信息
        setUser({
          token: data.data.login.token,
          userId: data.data.login.user.id,
          username: data.data.login.user.username,
        });
        // 在登录成功后处理跳转
        handleLoginSuccess();
      }
    } catch (err) {
      setError('Login failed, please try again later');
    } finally {
      setIsLoading(false);
    }
  };

  // 在登录成功后处理跳转
  const handleLoginSuccess = () => {
    // 首先检查 URL 参数中的 redirect
    const redirect = searchParams.get('redirect');
    if (redirect) {
      router.push(redirect);
      return;
    }
    
    // 然后检查 sessionStorage 中的 pendingJoinUrl（兼容旧的 join 页面逻辑）
    const pendingUrl = sessionStorage.getItem("pendingJoinUrl");
    if (pendingUrl) {
      sessionStorage.removeItem("pendingJoinUrl");
      router.replace(pendingUrl);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <div className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col justify-center px-4 py-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 mb-4">
            Sign in to your account
          </h2>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 p-4 mb-2">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-base text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label htmlFor="username" className="block text-base font-medium leading-6 text-gray-900">
                Username
              </label>
              <div className="mt-1">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter your username"
                  className="text-base px-4 py-3"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-base font-medium leading-6 text-gray-900">
                  Password
                </label>
                <div className="text-base">
                  <Link href="/forgot-password" className="font-semibold text-primary-600 hover:text-primary-500">
                    Forgot password?
                  </Link>
                </div>
              </div>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="text-base px-4 py-3"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg text-base px-4 py-3 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleLoginButton />
            </div>
          </div>

          <p className="mt-4 text-center text-base text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold leading-6 text-primary-600 hover:text-primary-500">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}