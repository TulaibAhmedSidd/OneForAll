
export default function GameCard({ title, entries, prize }) {
    return (
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-200 dark:from-blue-800 dark:to-blue-900 shadow-md p-5 transition hover:scale-105">
            <h2 className="text-xl font-semibold mb-2 text-blue-700 dark:text-white">{title}</h2>
            <p className="text-sm mb-1">Participants: {entries.toLocaleString()}</p>
            <p className="text-sm mb-3">Prize: <strong>{prize}</strong></p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl">
                Join Now
            </button>
        </div>
    );
}
