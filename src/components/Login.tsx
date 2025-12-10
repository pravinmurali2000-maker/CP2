import React, { useState } from 'react';
import type { User } from '../App';
import { api, setToken } from '../lib/api';
import { toast } from 'sonner';
import { useTournament } from '../context/TournamentContext';

interface LoginProps {
  role: 'admin' | 'manager';
  onLogin: (user: User) => void;
  onBack: () => void;
}

export function Login({ role, onLogin, onBack }: LoginProps) {
  const { tournament } = useTournament(); // Use context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.user.role !== role) {
        throw new Error(`You do not have the required '${role}' permissions.`);
      }

      setToken(response.access_token);
      toast.success(`Welcome back, ${response.user.name}!`);
      onLogin(response.user);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          disabled={loading}
        >
          <span>&lt;</span>
          Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <span>Lock</span>
            </div>
            <h2 className="text-2xl text-gray-900 mb-2">
              {role === 'admin' ? 'Admin Login' : 'Manager Login'}
            </h2>
            <p className="text-gray-600 text-sm">
              {role === 'admin' 
                ? 'Access tournament management dashboard' 
                : 'Manage your team and players'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-start gap-3">
                <span>!</span>
                <div>
                  <p className="font-bold">Login Failed</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span>Mail</span>
              </div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                required
                disabled={loading}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span>Lock</span>
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-green-400 flex items-center justify-center transition-colors"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

           <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
             <div className="text-xs text-blue-900 mb-2">Hint:</div>
             <div className="text-xs text-blue-800 space-y-1">
               <div>Use the user accounts created in your database.</div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}