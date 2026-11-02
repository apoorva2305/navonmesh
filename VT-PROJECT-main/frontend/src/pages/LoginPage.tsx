import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
        alert('Login successful!');
      } else {
        // Signup
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Save user profile to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          name: email.split('@')[0],
          email: email,
          createdAt: new Date(),
        });

        alert('Account created successfully!');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-pink-50'>
      <div className='w-full max-w-md bg-white p-8 rounded-2xl shadow-lg'>
        <h1 className='text-3xl font-bold text-center text-pink-600 mb-2'>
          SheRoute AI
        </h1>

        <p className='text-center text-gray-500 mb-6'>
          {isLogin ? 'Login to continue' : 'Create a new account'}
        </p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400'
            required
          />

          <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400'
            required
          />

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition'
          >
            {loading
              ? 'Please wait...'
              : isLogin
              ? 'Login'
              : 'Sign Up'}
          </button>
        </form>

        <p className='text-center mt-6 text-gray-600'>
          {isLogin
            ? "Don't have an account?"
            : 'Already have an account?'}

          <button
            type='button'
            onClick={() => setIsLogin(!isLogin)}
            className='text-pink-600 font-semibold ml-1 hover:underline'
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}