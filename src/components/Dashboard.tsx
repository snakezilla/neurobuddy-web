'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store';
import { getAnalyticsSummary, type AnalyticsSummary } from '@/lib/storage';

interface DashboardProps {
    onBack: () => void;
}

export function Dashboard({ onBack }: DashboardProps) {
    const childProfile = useAppStore((s) => s.childProfile);
    const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const summary = await getAnalyticsSummary();
                setAnalytics(summary);
            } catch {
                // If analytics not available, show empty state
                setAnalytics(null);
            } finally {
                setLoading(false);
            }
        };
        loadAnalytics();
    }, []);

    // Calculate completion rate for visual bar
    const completionRate = useMemo(() => {
        if (!analytics) return 0;
        const { completed, started } = analytics.routines;
        if (started === 0) return 0;
        return Math.round((completed / started) * 100);
    }, [analytics]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sky-700 hover:text-sky-800 transition-colors"
                >
                    <span className="text-2xl">←</span>
                    <span className="font-medium">Back</span>
                </button>
                <h1 className="text-2xl font-bold text-sky-800">
                    {childProfile?.name ? `${childProfile.name}'s Progress` : 'Progress Dashboard'}
                </h1>
                <div className="w-20" /> {/* Spacer for centering */}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-12 h-12 border-4 border-sky-300 border-t-sky-600 rounded-full" />
                </div>
            ) : (
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Privacy Badge */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                        <span className="text-2xl">🔒</span>
                        <div>
                            <p className="font-semibold text-green-800">All Data Stored Locally</p>
                            <p className="text-sm text-green-600">
                                Your data never leaves this device. 100% private.
                            </p>
                        </div>
                    </div>

                    {/* Routine Completion Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Routine Progress</h2>

                        {analytics && analytics.routines.started > 0 ? (
                            <>
                                {/* Completion Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Completion Rate</span>
                                        <span className="font-bold text-sky-600">{completionRate}%</span>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all duration-500"
                                            style={{ width: `${completionRate}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="bg-sky-50 rounded-xl p-3">
                                        <p className="text-2xl font-bold text-sky-600">{analytics.routines.completed}</p>
                                        <p className="text-xs text-gray-600">Completed</p>
                                    </div>
                                    <div className="bg-amber-50 rounded-xl p-3">
                                        <p className="text-2xl font-bold text-amber-600">{analytics.routines.started}</p>
                                        <p className="text-xs text-gray-600">Started</p>
                                    </div>
                                    <div className="bg-purple-50 rounded-xl p-3">
                                        <p className="text-2xl font-bold text-purple-600">
                                            {Math.round(analytics.totalEngagementMinutes)}
                                        </p>
                                        <p className="text-xs text-gray-600">Minutes</p>
                                    </div>
                                </div>

                                {/* Last 7 Days Chart */}
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-gray-600 mb-3">Last 7 Days</h3>
                                    <div className="flex items-end justify-between h-20 gap-1">
                                        {analytics.dailyActivity.map((day, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                                <div
                                                    className="w-full bg-sky-400 rounded-t transition-all duration-300"
                                                    style={{
                                                        height: `${Math.max(4, (day.count / Math.max(...analytics.dailyActivity.map(d => d.count), 1)) * 60)}px`,
                                                    }}
                                                />
                                                <span className="text-xs text-gray-500">{day.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <span className="text-4xl block mb-3">🐶</span>
                                <p className="text-gray-600">No routines completed yet!</p>
                                <p className="text-sm text-gray-500">Start a routine to see progress here.</p>
                            </div>
                        )}
                    </div>

                    {/* Speech Summary Card (Placeholder) */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">🗣️ Voice Activity</h2>
                        <div className="text-center py-6">
                            <span className="text-3xl block mb-2">🎤</span>
                            <p className="text-gray-600">Speech analysis coming soon!</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Track speaking rate and vocabulary growth.
                            </p>
                        </div>
                    </div>

                    {/* Favorite Routine */}
                    {analytics?.favoriteRoutine && (
                        <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-amber-800 mb-2">⭐ Favorite Routine</h2>
                            <p className="text-amber-700">
                                <span className="text-2xl mr-2">{analytics.favoriteRoutine.icon}</span>
                                {analytics.favoriteRoutine.name}
                            </p>
                            <p className="text-sm text-amber-600 mt-1">
                                Completed {analytics.favoriteRoutine.completionCount} times!
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
