'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/auth/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      // Fetch the games created by the user
      fetchGames();
    }
  }, [user]);

  const fetchGames = async () => {
    try {
      const res = await fetch('/api/game/created', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setGames(data.games);
      } else {
        console.error('Error fetching games:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleJoinGame = async (gameId) => {
    // Check if the user has enough balance
    if (user.walletBalance < 1) {
      alert('You need at least 1 rupee to join a game.');
      return;
    }

    try {
      const res = await fetch('/api/game/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ gameId }),
      });

      const result = await res.json();
      if (res.ok) {
        alert('Successfully joined the game!');
        fetchGames();  // Re-fetch games to reflect the changes
      } else {
        alert(result.error || 'Error joining the game');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to join the game. Please try again.');
    }
  };

  if (!user) {
    return <div className="text-center text-lg py-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-700 dark:text-blue-400 mb-6">
          Welcome, {user.username}!
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard title="Wallet Balance" value={`₨ ${user.walletBalance || 0}`}
            showbtn={true}
            onClick={()=>router.push('/game/addbalance')}
          />
          <StatCard title="Your Games" value={user.gamesPlayed || 0} />
          <StatCard title="Prizes Won" value={user.prizesWon || 0} />
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-400 mb-4">Your Created Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {games.length === 0 ? (
              <p className="text-center text-lg">No games created yet.</p>
            ) : (
              games.map((game) => (
                <GameCard key={game._id} game={game} onJoinGame={handleJoinGame} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, showbtn = false, btnText = '', onClick = () => { } }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-blue-300 dark:from-blue-800 dark:to-blue-900 shadow-lg p-6 text-center">
      <h2 className="text-xl font-semibold text-blue-800 dark:text-white mb-2">{title}</h2>
      <p className="text-2xl font-bold">{value}</p>
      {showbtn &&
        <button
          className="px-4 py-2 bg-blue-700 text-white rounded-xl"
          onClick={onClick}
        >
          {btnText}
        </button>

      }
    </div>
  );
}

function GameCard({ game, onJoinGame }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-blue-300 dark:from-blue-800 dark:to-blue-900 shadow-lg p-6 text-center">
      <h3 className="text-xl font-semibold text-blue-800 dark:text-white mb-2">{game.gameType}</h3>
      <p className="text-lg">Participants: {game.participants.length} / {game.requiredUsers}</p>
      <p className="text-lg mb-4">Prize: ₨ {game.prizeAmount}</p>
      <button
        className="px-4 py-2 bg-blue-700 text-white rounded-xl"
        onClick={() => onJoinGame(game._id)}
      >
        Join Game
      </button>
    </div>
  );
}
