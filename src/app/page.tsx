'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { Padlock } from '@/components/Padlock';
import type { Lock, Challenge } from '@/lib/types';

const defaultLocks: Lock[] = [
  { id: 1, name: 'Lock 1', question: 'What is 2 + 2?', code: '04', digits: 2, unlocked: false },
  { id: 2, name: 'Lock 2', question: 'What is 5 + 6?', code: '11', digits: 2, unlocked: false },
  { id: 3, name: 'Lock 3', question: 'What is 1 + 2?', code: '03', digits: 2, unlocked: false },
  { id: 4, name: 'Lock 4', question: 'What is 2 × 2?', code: '04', digits: 2, unlocked: false }
];

export default function MathPadlockGame() {
  const [mode, setMode] = useState<'play' | 'setup'>('play');
  const [locks, setLocks] = useState<Lock[]>([]);
  const [attempts, setAttempts] = useState<Record<number, string>>({});
  const [wrongAttempts, setWrongAttempts] = useState<Record<number, boolean>>({});
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load challenge from API on mount
  useEffect(() => {
    const loadChallenge = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/challenge');
        if (response.ok) {
          const apiResponse = await response.json();
          // API returns { success: true, data: Challenge }
          const challenge: Challenge = apiResponse.data;
          if (challenge && challenge.locks && challenge.locks.length > 0) {
            setLocks(challenge.locks);
          } else {
            // No challenge data, use defaults
            setLocks(defaultLocks);
          }
        } else {
          // API error, use defaults
          setLocks(defaultLocks);
          setError('Failed to load challenge from cloud. Using defaults.');
        }
      } catch (err) {
        console.error('Error loading challenge:', err);
        // Fallback to defaults if API call fails
        setLocks(defaultLocks);
        setError('Failed to load challenge. Using defaults.');
      } finally {
        setLoading(false);
      }
    };

    loadChallenge();
  }, []);

  const addLock = () => {
    const newId = Math.max(...locks.map(l => l.id), 0) + 1;
    const lockNumber = locks.length + 1;
    setLocks([...locks, {
      id: newId,
      name: `Lock ${lockNumber}`,
      question: 'Enter question here',
      code: '00',
      digits: 2,
      unlocked: false
    }]);
  };

  const updateLock = (id: number, field: string, value: any) => {
    setLocks(locks.map(lock =>
      lock.id === id ? { ...lock, [field]: value } : lock
    ));
  };

  const deleteLock = (id: number) => {
    setLocks(locks.filter(lock => lock.id !== id));
  };

  const tryUnlock = (id: number, attempt: string) => {
    const lock = locks.find(l => l.id === id);
    if (lock && attempt === lock.code) {
      setLocks(locks.map(l =>
        l.id === id ? { ...l, unlocked: true } : l
      ));
      setAttempts({ ...attempts, [id]: '' });
    } else {
      setWrongAttempts({ ...wrongAttempts, [id]: true });
      setTimeout(() => {
        setWrongAttempts(prev => ({ ...prev, [id]: false }));
      }, 500);
    }
  };

  const resetGame = () => {
    setLocks(locks.map(lock => ({ ...lock, unlocked: false })));
    setAttempts({});
    setWrongAttempts({});
  };

  const handleSetupClick = () => {
    setShowPasswordPrompt(true);
    setPasswordInput('');
  };

  const handlePasswordSubmit = async () => {
    if (passwordInput.toLowerCase() === 'swordfish') {
      setMode('setup');
      setShowPasswordPrompt(false);
      setPasswordInput('');
    } else {
      alert('Incorrect password');
      setPasswordInput('');
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordPrompt(false);
    setPasswordInput('');
  };

  const saveChallenge = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': 'swordfish'
        },
        body: JSON.stringify({ locks })
      });

      if (!response.ok) {
        throw new Error('Failed to save challenge');
      }

      alert('Challenge saved successfully!');
    } catch (err) {
      setError('Failed to save challenge. Try again.');
      console.error('Error saving challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Setup Padlocks</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('play')}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  Start Challenge
                </button>
                <button
                  onClick={saveChallenge}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  {loading ? 'Saving...' : 'Save to Cloud'}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {locks.map((lock) => (
                <div key={lock.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lock Name
                      </label>
                      <input
                        type="text"
                        value={lock.name}
                        onChange={(e) => updateLock(lock.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Digits
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={lock.digits}
                        onChange={(e) => {
                          const newDigits = Math.max(1, Math.min(6, parseInt(e.target.value) || 1));
                          const currentCode = lock.code || '';
                          let newCode = currentCode;

                          if (newDigits > currentCode.length) {
                            newCode = currentCode.padEnd(newDigits, '0');
                          } else {
                            newCode = currentCode.slice(0, newDigits);
                          }

                          setLocks(locks.map(l =>
                            l.id === lock.id ? { ...l, digits: newDigits, code: newCode } : l
                          ));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Math Question
                      </label>
                      <input
                        type="text"
                        value={lock.question}
                        onChange={(e) => updateLock(lock.id, 'question', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correct Code
                      </label>
                      <input
                        type="text"
                        value={lock.code}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, lock.digits);
                          updateLock(lock.id, 'code', value);
                        }}
                        placeholder={'0'.repeat(lock.digits)}
                        maxLength={lock.digits}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => deleteLock(lock.id)}
                        className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition"
                      >
                        <Trash2 size={18} />
                        Delete Lock
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addLock}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition"
            >
              <Plus size={20} />
              Add New Lock
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Math Padlock Challenge</h1>
              <div className="flex gap-2">
                <button
                  onClick={resetGame}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                  disabled={loading || locks.length === 0}
                >
                  Reset
                </button>
                <button
                  onClick={handleSetupClick}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition"
                >
                  <Settings size={18} />
                  Setup
                </button>
              </div>
            </div>

            {loading && (
              <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                Loading challenge...
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {loading && locks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-xl text-gray-600 font-semibold">Loading your challenge...</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {locks.map((lock) => (
                    <div
                      key={lock.id}
                      className={`border-2 rounded-lg p-6 transition-all duration-300 ${
                        lock.unlocked
                          ? 'bg-green-50 border-green-400'
                          : wrongAttempts[lock.id]
                            ? 'bg-red-50 border-red-400 animate-shake'
                            : 'bg-white border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <Padlock unlocked={lock.unlocked} />

                        <h3 className="text-xl font-bold text-gray-800 mb-2">{lock.name}</h3>

                        {lock.unlocked ? (
                          <div className="text-center">
                            <p className="text-green-600 font-semibold text-lg">Unlocked!</p>
                          </div>
                        ) : (
                          <div className="w-full">
                            <p className="text-gray-700 mb-4 text-center">{lock.question}</p>
                            <div className="relative">
                              <input
                                type="text"
                                value={attempts[lock.id] || ''}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, lock.digits);
                                  setAttempts({ ...attempts, [lock.id]: value });
                                }}
                                maxLength={lock.digits}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center font-mono text-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent opacity-0 absolute top-0 left-0"
                              />
                              <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center font-mono text-2xl pointer-events-none text-gray-600">
                                {attempts[lock.id] && attempts[lock.id].length > 0
                                  ? '*'.repeat(attempts[lock.id].length) + 'X'.repeat(lock.digits - attempts[lock.id].length)
                                  : 'X'.repeat(lock.digits)}
                              </div>
                            </div>
                            <button
                              onClick={() => tryUnlock(lock.id, attempts[lock.id] || '')}
                              disabled={!attempts[lock.id] || attempts[lock.id].length !== lock.digits}
                              className="w-full mt-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition"
                            >
                              Try Code
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {locks.every(lock => lock.unlocked) && locks.length > 0 && (
                  <div className="mt-6 bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-400 rounded-lg p-8 text-center animate-slideIn">
                    <div className="flex flex-col items-center">
                      <div className="animate-bounce mb-4">
                        <svg width="120" height="120" viewBox="0 0 120 120" className="drop-shadow-lg">
                          {/* Body */}
                          <ellipse cx="60" cy="70" rx="35" ry="30" fill="#8B6F47" />

                          {/* Head */}
                          <ellipse cx="60" cy="40" rx="28" ry="25" fill="#A0826D" />

                          {/* Ears */}
                          <ellipse cx="45" cy="25" rx="8" ry="12" fill="#8B6F47" />
                          <ellipse cx="75" cy="25" rx="8" ry="12" fill="#8B6F47" />

                          {/* Eyes */}
                          <circle cx="50" cy="38" r="4" fill="#000" />
                          <circle cx="70" cy="38" r="4" fill="#000" />
                          <circle cx="51" cy="37" r="2" fill="#fff" />
                          <circle cx="71" cy="37" r="2" fill="#fff" />

                          {/* Nose */}
                          <ellipse cx="60" cy="48" rx="6" ry="4" fill="#654321" />

                          {/* Mouth */}
                          <path d="M 54 50 Q 60 54 66 50" stroke="#654321" strokeWidth="2" fill="none" />

                          {/* Legs */}
                          <rect x="40" y="90" width="12" height="18" rx="6" fill="#8B6F47" />
                          <rect x="68" y="90" width="12" height="18" rx="6" fill="#8B6F47" />

                          {/* Arms */}
                          <ellipse cx="35" cy="75" rx="8" ry="15" fill="#8B6F47" transform="rotate(-20 35 75)" />
                          <ellipse cx="85" cy="75" rx="8" ry="15" fill="#8B6F47" transform="rotate(20 85 75)" />
                        </svg>
                      </div>

                      <h2 className="text-4xl font-bold text-green-700 mb-2">🎉 Congratulations! 🎉</h2>
                      <p className="text-2xl text-green-600 font-semibold mb-2">All Locks Unlocked!</p>
                      <p className="text-lg text-gray-600">The capybara is proud of you!</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {showPasswordPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Enter Setup Password</h2>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordSubmit();
                  }
                }}
                placeholder="Enter password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handlePasswordCancel}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
