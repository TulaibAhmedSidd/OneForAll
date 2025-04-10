// app/games/page.jsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ToastPosition } from '../utils/consts';

export default function GameManagementPage() {
  const [games, setGames] = useState([]);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token')
  const router = useRouter();

  const fetchGames = async () => {
    await fetch('/api/game/created', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setGames(data.games || []))
      .catch((err) => console.error('Failed to fetch games:', err));
  }
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/auth/login');
    } else {
      setUser(JSON.parse(storedUser));
      fetchGames()
    }
  }, [router]);

  const handleStatusChange = async (gameId, newStatus) => {
    try {
      const res = await fetch(`/api/game/update-status/${gameId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = await res.json();
      if (res.ok) {
        setGames((prev) =>
          prev.map((game) => (game?._id === gameId ? { ...game, status: newStatus } : game))
        );
      } else {
        alert(updated.message || 'Error updating game status');
      }
    } catch (error) {
      console.error('Error updating game:', error);
    }
  };
  const handlePauseResume = async (id) => {
    try {
      await fetch(`/api/game/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGames(); // refetch state
    } catch (err) {
      console.log('erro' + err)
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/game/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGames(); // refetch state
    } catch (err) {
      console.log('erro' + err)
    }
  };

  const handleForceEnd = async (id) => {
    try {
      await fetch(`/api/game/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGames(); // refetch state

    } catch (err) {
      toast.error(ResponseError.FetchError + err.message, {
        position: ToastPosition.BottomCenter,
      });
      console.log('erro' + err)
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-6">All Games</h1>
        {games?.length === 0 ? (
          <p>No games available.</p>
        ) : (
          <div className="space-y-4">
            {games?.map((game) => (
              <div key={game?._id} className="p-4 border rounded-lg bg-gray-100 dark:bg-gray-800">
                <p><strong>Game Type:</strong> {game?.gameType}</p>
                <p><strong>Status:</strong> {game?.status}</p>
                <p><strong>Participants:</strong> {game?.participants.length}/{game?.requiredUsers}</p>
                <p><strong>Prize Amount:</strong> ₨ {game?.prizeAmount}</p>
                <p><strong>Prize:</strong> ₨ {game?.gamePrize?.prizeName}</p>
                <p><strong>Start:</strong> {new Date(game?.startTime).toLocaleString()}</p>
                <p><strong>End:</strong> {new Date(game?.endTime).toLocaleString()}</p>

                <div className="flex gap-2 mt-3">
                  <button onClick={() => handlePauseResume(game?._id)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                    {game?.paused ? 'Resume' : 'Pause'}
                  </button>
                  <button onClick={() => handleDelete(game?._id)} className="bg-red-600 text-white px-3 py-1 rounded">
                    Delete
                  </button>
                  <button onClick={() => handleForceEnd(game?._id)} className="bg-green-600 text-white px-3 py-1 rounded">
                    Close & Pick Winner
                  </button>
                </div>

                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => handleStatusChange(game?._id, 'completed')}
                    className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => handleStatusChange(game?._id, 'cancelled')}
                    className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => router.push(`/game/edit/${game?._id}`)}
                    className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit Game
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
