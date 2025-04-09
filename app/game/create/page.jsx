'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const CreateGame = () => {
  const [gameName, setGameName] = useState('');
  const [gameAmount, setGameAmount] = useState('');
  const [requiredUsers, setRequiredUsers] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [prizeAmount, setPrizeAmount] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to create a game');
      return;
    }

    if (!gameName  || !gameAmount || !requiredUsers || !startTime || !endTime || !prizeAmount) {
      setError('All fields are required!');
      return;
    }

    const gameData = {
      gameName,
      gameAmount: Number(gameAmount),
      requiredUsers: Number(requiredUsers),
      startTime,
      endTime,
      prizeAmount: Number(prizeAmount),
    };

    try {
      const res = await fetch('/api/game/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(gameData),
      });

      const result = await res.json();

      if (res.status === 201) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Error creating the game.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to create the game. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-400 dark:bg-gray-900 text-gray-900 dark:text-slate-200 px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-700 dark:text-blue-400 mb-6">
          Create a New Game
        </h1>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-medium">Game Name</label>
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="w-full text-blue-950 mt-2 p-3 border rounded-md"
              placeholder="Enter a name for your game"
            />
          </div>

          <div>
            <label className="block text-lg font-medium">Game Amount (Entry Fee)</label>
            <input
              type="number"
              value={gameAmount}
              onChange={(e) => setGameAmount(e.target.value)}
              className="w-full text-blue-950 mt-2 p-3 border rounded-md"
              placeholder="Amount user pays to join"
            />
          </div>

          <div>
            <label className="block text-lg font-medium">Required Users</label>
            <input
              type="number"
              value={requiredUsers}
              onChange={(e) => setRequiredUsers(e.target.value)}
              className="w-full text-blue-950 mt-2 p-3 border rounded-md"
              placeholder="Number of users required"
            />
          </div>

          <div>
            <label className="block text-lg font-medium">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full text-blue-950 mt-2 p-3 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-lg font-medium">End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full text-blue-950 mt-2 p-3 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-lg font-medium">Prize Amount</label>
            <input
              type="number"
              value={prizeAmount}
              onChange={(e) => setPrizeAmount(e.target.value)}
              className="w-full text-blue-950 mt-2 p-3 border rounded-md"
              placeholder="Amount in rupees"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-700 text-white p-3 rounded-md hover:bg-blue-800 transition duration-300"
          >
            Create Game
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGame;
