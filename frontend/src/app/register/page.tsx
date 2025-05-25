'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `mutation Register($input: CreateUserInput!) {
            createUser(input: $input) {
              id
              username
              email
              name
            }
          }`,
          variables: {
            input: {
              username: formData.username,
              password: formData.password,
              email: formData.email,
              name: formData.name,
            },
          },
        }),
      });
      const data = await res.json();
      if (data.errors && data.errors.length > 0) {
        setError(data.errors[0].message || 'Registration failed');
      } else {
        setSuccess('Registration successful! Redirecting to sign in...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    } catch (err) {
      setError('Registration failed, please try again later');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
          Create a new account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
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
          {success && (
            <div className="rounded-lg bg-green-50 p-4 mb-2">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.293 9.293a1 1 0 011.414 0L10 10.586l.293-.293a1 1 0 111.414 1.414l-1 1a1 1 0 01-1.414 0l-1-1a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-base text-green-700">{success}</p>
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
            <label htmlFor="name" className="block text-base font-medium leading-6 text-gray-900">
              Name
            </label>
            <div className="mt-1">
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                className="text-base px-4 py-3"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-base font-medium leading-6 text-gray-900">
              Email
            </label>
            <div className="mt-1">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                className="text-base px-4 py-3"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-base font-medium leading-6 text-gray-900">
              Password
            </label>
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
          <div>
            <label htmlFor="confirmPassword" className="block text-base font-medium leading-6 text-gray-900">
              Confirm Password
            </label>
            <div className="mt-1">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter your password"
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
                Registering...
              </span>
            ) : (
              'Register'
            )}
          </Button>
        </form>
        <p className="mt-4 text-center text-base text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold leading-6 text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
} 