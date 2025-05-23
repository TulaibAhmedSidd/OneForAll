'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const CreateGame = () => {
  const [gameName, setGameName] = useState('');
  const [gameAmount, setGameAmount] = useState('');
  const [requiredUsers, setRequiredUsers] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [prizeAmount, setPrizeAmount] = useState('');
  const [error, setError] = useState('');
  const [prizes, setPrizes] = useState([]);
  const [selectedPrize, setSelectedPrize] = useState(""); // Initial state for the selected value
  const router = useRouter();
  const [selectedPrizes, setSelectedPrizes] = useState([{ prizeId: '', quantity: '' }]);

  const fetchPrizes = async () => {
    try {
      const res = await fetch('/api/game-prize/get-all');
      const data = await res.json();
      if (res.ok) {
        setPrizes(data.prizes);
      } else {
        setError(data.error || 'Failed to fetch prizes');
      }
    } catch (err) {
      console.error(err);
      setError('Server error fetching prizes.');
    }
  };

  useEffect(() => {
    fetchPrizes();
  }, []);
  const handleChange = (event) => {
    setSelectedPrize(event.target.value); // Update state when an option is selected
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to create a game');
      return;
    }

    if (!gameName || !gameAmount || !requiredUsers || !startTime || !endTime || !prizeAmount) {
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
      prizeList: selectedPrizes.map(p => ({
        prizeId: p?.prizeId,
        quantity: Number(p?.quantity)
      }))
    };

    // const gameData = {
    //   gameName,
    //   gameAmount: Number(gameAmount),
    //   requiredUsers: Number(requiredUsers),
    //   startTime,
    //   endTime,
    //   prizeAmount: Number(prizeAmount),
    //   prizeId: selectedPrize,
    // };

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
        setSelectedPrize(null);
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
              onChange={(e) => {
                const gameAm = e.target.value;
                setGameAmount(gameAm)
                if (requiredUsers) {
                  setPrizeAmount(requiredUsers * gameAm)
                }
              }}
              className="w-full text-blue-950 mt-2 p-3 border rounded-md"
              placeholder="Amount user pays to join"
            />
          </div>

          <div>
            <label className="block text-lg font-medium">Required Users</label>
            <input
              type="number"
              value={requiredUsers}
              onChange={(e) => {
                const reqUser = e.target.value;
                setRequiredUsers(reqUser)
                if (gameAmount) {
                  setPrizeAmount(gameAmount * reqUser)
                }
              }
              }

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
            <label className="block text-lg font-medium">lottery Amount</label>
            <input
              type="number"
              value={prizeAmount}
              disabled
              onChange={(e) => setPrizeAmount(e.target.value)}
              className="w-full text-blue-950 mt-2 p-3 border rounded-md"
              placeholder="Amount in rupees"
            />
          </div>
          {/* <div>
            <label className="block text-lg font-medium">Select Winning Prize</label>
            <select
              className="p-2 w-full rounded-md border border-gray-300 text-blue-950"
              id="dropdown"
              value={selectedPrize} // Bind the state to the select element
              onChange={handleChange} // Update state on change
            >
              <option value="" disabled>
                -- Select a prize for game --
              </option>
              {prizes?.map((item) => (
                <option key={item?._id} value={item?._id}>
                  {item?.prizeName}
                </option>
              ))}
            </select>
          </div> */}

          {selectedPrizes.map((entry, index) => (
            <div key={index} className="flex gap-2 items-center mb-2">
              <select
                className="p-2 rounded-md border w-1/2 text-blue-950"
                value={entry.prizeId}
                onChange={(e) => {
                  const updated = [...selectedPrizes];
                  updated[index].prizeId = e.target.value;
                  setSelectedPrizes(updated);
                }}
              >
                <option value="">-- Select Prize --</option>
                {prizes.map(p => (
                  <option key={p._id} value={p._id}>{p.prizeName}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantity"
                className="p-2 rounded-md border w-1/2 text-blue-950"
                value={entry.quantity}
                onChange={(e) => {
                  const updated = [...selectedPrizes];
                  updated[index].quantity = e.target.value;
                  setSelectedPrizes(updated);
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const updated = [...selectedPrizes];
                  updated.splice(index, 1);
                  setSelectedPrizes(updated);
                }}
                className="text-red-600 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setSelectedPrizes([...selectedPrizes, { prizeId: '', quantity: '' }])}
            className="mt-2 text-blue-600 underline"
          >
            + Add Another Prize
          </button>

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
