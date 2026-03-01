const STORAGE_KEY = 'xmath_stats_v1';

const initialStats = {
    lifetime: {
        correct: 0,
        incorrect: 0,
        solved: 0,
        bestStreak: 0
    },
    currentStreak: 0,
    daily: {
        date: new Date().toISOString().split('T')[0],
        count: 0
    },
    challenges: []
};

export const getStats = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return initialStats;

        const stats = JSON.parse(saved);

        // Reset daily if date changed
        const today = new Date().toISOString().split('T')[0];
        if (stats.daily.date !== today) {
            stats.daily = { date: today, count: 0 };
        }

        return stats;
    } catch (e) {
        console.error('Error loading stats:', e);
        return initialStats;
    }
};

export const saveStats = (stats) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
        console.error('Error saving stats:', e);
    }
};

export const recordResult = (isCorrect) => {
    const stats = getStats();

    stats.lifetime.solved += 1;
    if (isCorrect) {
        stats.lifetime.correct += 1;
        stats.currentStreak += 1;
        stats.daily.count += 1;
        if (stats.currentStreak > stats.lifetime.bestStreak) {
            stats.lifetime.bestStreak = stats.currentStreak;
        }
    } else {
        stats.lifetime.incorrect += 1;
        stats.currentStreak = 0;
    }

    saveStats(stats);
    return stats;
};

export const saveChallengeResult = (score, config) => {
    const stats = getStats();
    const result = {
        date: new Date().toISOString(),
        score,
        config
    };

    stats.challenges.push(result);
    // Keep only last 50 challenges
    if (stats.challenges.length > 50) {
        stats.challenges.shift();
    }

    saveStats(stats);
    return stats;
};

export const resetCounters = () => {
    const stats = getStats();
    stats.lifetime = {
        correct: 0,
        incorrect: 0,
        solved: 0,
        bestStreak: 0
    };
    stats.currentStreak = 0;
    stats.daily = {
        date: new Date().toISOString().split('T')[0],
        count: 0
    };
    saveStats(stats);
    return stats;
};

export const clearHistory = () => {
    const stats = getStats();
    stats.challenges = [];
    saveStats(stats);
    return stats;
};
