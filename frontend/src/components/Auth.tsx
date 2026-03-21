'use client';

import { useState } from 'react';
import { useAssignmentStore } from '@/store/useAssignmentStore';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAssignmentStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Fetch registered users from local storage
    const users = JSON.parse(localStorage.getItem('veda_users') || '[]');

    if (isLogin) {
      // Handle Login Logic
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        login(user.name, user.school, false, user.email);
      } else {
        setError('Invalid email or password. Please try again or sign up.');
      }
    } else {
      // Handle Sign Up Logic
      const userExists = users.find((u: any) => u.email === email);
      if (userExists) {
        setError('An account with this email already exists. Please log in.');
      } else {
        const newUser = { email, password, name: name.trim(), school: school.trim() };
        users.push(newUser);
        localStorage.setItem('veda_users', JSON.stringify(users));
        login(newUser.name, newUser.school, false, newUser.email);
      }
    }
  };

  const handleGuestLogin = () => {
    login('Guest User', 'Temporary Session', true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0f2fe] via-[#f8fafc] to-[#ffedd5] p-4">
      
      <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-[420px]">
        
        <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
          VedaAI Assessment Tool
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Log in or sign up to start generating AI assessments.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-6">
            {error}
          </div>
        )}

        <div className="bg-gray-100 p-1 rounded-full flex mb-6">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${
              isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${
              !isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 outline-none text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">School Name</label>
                <input
                  type="text" required value={school} onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g. Delhi Public School"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 outline-none text-sm text-gray-900"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 outline-none text-sm text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 outline-none text-sm text-gray-900"
            />
          </div>

          <button type="submit" className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-semibold py-3.5 rounded-xl transition-colors mt-2">
            {isLogin ? 'Login' : 'Sign up'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 mb-2">Just looking around?</p>
          <button 
            onClick={handleGuestLogin}
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 underline"
          >
            Enter as Guest
          </button>
        </div>

      </div>
    </div>
  );
}
