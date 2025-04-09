// app/home/page.jsx

import GameCard from "../components/GameCard";

export default function HomePage() {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-blue-600 dark:text-blue-400 text-center">
            🎯 Welcome to OneForAll!
          </h1>
          <p className="text-lg mb-4 text-center">
            Participate in daily low-cost games like <strong>1, 10, or 50 rupees</strong> for a chance to win big rewards!
          </p>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
            <GameCard title="1 Rupee Game" entries={89232} prize="iPhone 14" />
            <GameCard title="10 Rupee Game" entries={12844} prize="Smart Watch" />
            <GameCard title="50 Rupee Game" entries={4322} prize="Samsung Galaxy S22" />
          </div>
        </div>
      </div>
    );
  }

  