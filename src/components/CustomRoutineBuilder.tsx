'use client';

interface CustomRoutineBuilderProps {
  onComplete: () => void;
}

export function CustomRoutineBuilder({ onComplete }: CustomRoutineBuilderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8 text-center">
        <span className="text-6xl mb-4 block">🚧</span>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Coming Soon!</h1>
        <p className="text-gray-600 mb-6">
          The custom routine builder is still being developed. Check back soon!
        </p>
        <button
          onClick={onComplete}
          className="px-8 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-full font-bold hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
