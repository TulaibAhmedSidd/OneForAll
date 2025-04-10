'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/auth/login');
    } else {
      const token = localStorage.getItem('token');
      fetchUserData(token);
    }
  }, [router]);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch('/api/user/latest', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        console.error(data.error);
        // router.push('/auth/login');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      alert('You need at least 1 rupee to join a game?.');
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
        fetchUserData()
      } else {
        alert(result.error || 'Error joining the game');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to join the game?. Please try again.');
    }
  };

  if (!user) {
    return <div className="text-center text-lg py-10">Loading...</div>;
  }
  const checkAlready = (game) => {
    if (game?.participants?.some((participant) => participant?._id == user?._id)) {
      return true
    }
    return false
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
            onClick={() => router.push('/game/addbalance')}
            btnText="Add balance"
          />
          <StatCard title="Your Games" value={user.gamesPlayed || 0} />
          <StatCard title="Prizes Won" value={user.prizesWon || 0} />
        </div>
        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4">Created Games</h2>
        <div className="space-y-4">
          {games?.length === 0 ? (
            <p>No games created yet.</p>
          ) : (
            games?.map((game) => (
              <div
                key={game?._id}
                className="p-4 border rounded-lg bg-gray-100 dark:bg-gray-800 shadow-md"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  {/* Game Info */}
                  <div className="flex-1">
                    <p className="text-xl font-semibold text-blue-700 mb-2">{game?.gameName}</p>
                    <p><strong>Entry Fee:</strong> ₨ {game?.gameAmount}</p>
                    <p><strong>Status:</strong> {game?.status}</p>
                    <p><strong>Participants:</strong> {game?.participants.length}/{game?.requiredUsers}</p>

                    <button
                      disabled={checkAlready(game)}
                      className={`mt-4 px-4 py-2 rounded transition duration-300 
                ${checkAlready(game)
                          ? 'bg-zinc-600 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'}
              `}
                      onClick={() => handleJoinGame(game?._id)}
                    >
                      {checkAlready(game) ? "Already Joined" : "Join Game"}
                    </button>
                  </div>

                  {/* Prizes Display */}
                  <div className="grid grid-cols-2 gap-4 md:w-1/2">
                    {game?.gamePrize?.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white dark:bg-gray-700 border rounded-lg p-2 flex flex-col items-center text-center shadow"
                      >
                        <img
                          src={item?.prize?.prizeImage}
                          alt={item?.prize?.prizeName}
                          className="w-20 h-20 object-contain rounded mb-2"
                        />
                        <p className="text-sm font-semibold text-blue-600">{item?.prize?.prizeName}</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          Qty: {item?.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="space-y-4">
          {games?.length === 0 ? (
            <p>No games created yet.</p>
          ) : (
            games?.map((game) => (
              <div key={game?._id} className="flex justify-between p-4 border rounded-lg bg-gray-100 dark:bg-gray-800">
                <div>
                  <p><strong>Game Name:</strong> {game?.gameName}</p>
                  <p><strong>Entry Fee:</strong> ₨ {game?.gameAmount}</p>
                  <p><strong>Status:</strong> {game?.status}</p>
                  <p><strong>Participants:</strong> {game?.participants.length}/{game?.requiredUsers}</p>
                  <button
                    disabled={game?.status === 'completed'}
                    className="disabled:bg-zinc-600 mt-4 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => handleJoinGame(game?._id)}
                  >
                    {game?.status === 'completed' ? "Game Completed" : 'Join Game'}
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Prizes:</h3>
                  {game?.gamePrize?.map((prize) => (
                    <div key={prize?._id} className="mb-2">
                      <p><strong>{prize?.prize?.prizeName}:</strong> {prize?.quantity} prizes</p>
                      {prize?.winners?.length > 0 && (
                        <ul>
                          {prize?.winners?.map((winner) => (
                            <li key={winner?._id}>{winner}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
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
          className="px-4 py-2 mt-2 bg-blue-100 text-blue-950 rounded-xl"
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
      <h3 className="text-xl font-semibold text-blue-800 dark:text-white mb-2">{game?.gameType}</h3>
      <p className="text-lg">Participants: {game?.participants.length} / {game?.requiredUsers}</p>
      <p className="text-lg mb-4">Prize: ₨ {game?.prizeAmount}</p>
      <button
        className="px-4 py-2 bg-blue-700 text-white rounded-xl"
        onClick={() => onJoinGame(game?._id)}
      >
        Join Game
      </button>
    </div>
  );
}
