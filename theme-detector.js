(function () {
    const STORAGE_KEY = 'Birgalikda_settings';

    function readSettings() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function resolveTheme(theme) {
        if (theme === 'auto') {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme === 'dark' ? 'dark' : 'light';
    }

    try {
        const settings = readSettings();
        const storedTheme = localStorage.getItem('theme');
        const theme = settings.theme || storedTheme || 'light';
        const resolvedTheme = resolveTheme(theme);

        document.documentElement.dataset.theme = resolvedTheme;
        document.documentElement.dataset.themePreference = theme;
        document.documentElement.classList.toggle('dark-theme', resolvedTheme === 'dark');
    } catch (e) {
        document.documentElement.dataset.theme = 'light';
    }
})();
