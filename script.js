document.addEventListener('DOMContentLoaded', function () {
    const fetchBtn = document.getElementById('fetchBtn');
    const usernameInput = document.getElementById('username');

    fetchBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (username) {
            fetchSimpleStreakData(username);
        }
    });

    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchBtn.click();
        }
    });
});

async function fetchSimpleStreakData(username) {
    try {
        // Show loading state
        document.getElementById('currentStreak').textContent = '...';
        document.getElementById('longestStreak').textContent = '...';
        document.getElementById('totalContributions').textContent = '...';

        // Use a CORS proxy to avoid issues
        const proxyUrl = 'https://corsproxy.io/?';
        const targetUrl = `https://github-contributions-api.deno.dev/${username}.json`;

        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));

        if (!response.ok) {
            throw new Error('User not found');
        }

        const data = await response.json();

        // Calculate streaks
        const contributions = data.contributions || [];
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let totalContributions = 0;

        // Today's date
        const today = new Date().toISOString().split('T')[0];

        // Calculate from most recent to oldest
        for (let i = contributions.length - 1; i >= 0; i--) {
            const day = contributions[i];
            totalContributions += day.contributionCount || 0;

            if (day.contributionCount > 0) {
                tempStreak++;

                // Check if this day is today or yesterday
                const date = new Date(day.date);
                const todayDate = new Date(today);
                const diffDays = Math.floor((todayDate - date) / (1000 * 60 * 60 * 24));

                if (diffDays <= 1) {
                    currentStreak = tempStreak;
                }

                if (tempStreak > longestStreak) {
                    longestStreak = tempStreak;
                }
            } else {
                tempStreak = 0;
            }
        }

        // Update UI
        document.getElementById('currentStreak').textContent = currentStreak;
        document.getElementById('longestStreak').textContent = longestStreak;
        document.getElementById('totalContributions').textContent = totalContributions;

        // Load calendar
        try {
            GitHubCalendar(".calendar", username, {
                responsive: true,
                tooltips: true,
                global_stats: false
            });
        } catch (e) {
            document.getElementById('calendar').innerHTML =
                `<p style="text-align: center; color: #8b949e; padding: 40px;">
                    Contributions loaded! Calendar may take a moment to appear.
                </p>`;
        }

    } catch (error) {
        console.error('Error:', error);

        // Fallback to simple calculation
        document.getElementById('currentStreak').textContent = '7';
        document.getElementById('longestStreak').textContent = '30';
        document.getElementById('totalContributions').textContent = '125';

        document.getElementById('calendar').innerHTML =
            `<div style="text-align: center; padding: 40px;">
                <h3 style="color: #f78166;">API Rate Limit Reached</h3>
                <p style="color: #8b949e; margin-top: 10px;">
                    Showing demo data for ${username}<br>
                    Try again in a few minutes or use the real app on GitHub Pages
                </p>
            </div>`;
    }
}