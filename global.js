function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}
window.escapeHtml = escapeHtml;

(function () {
    const STORAGE_KEY = 'Birgalikda_settings';
    const DEFAULT_SETTINGS = {
        theme: 'light',
        toggles: {},
        profile: {},
        locale: {}
    };

    function readSettings() {
        try {
            return { ...DEFAULT_SETTINGS, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
        } catch (e) {
            return { ...DEFAULT_SETTINGS };
        }
    }

    function writeSettings(patch) {
        const next = { ...readSettings(), ...patch };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        if (patch.theme) localStorage.setItem('theme', patch.theme);
        applySettings(next);
        window.dispatchEvent(new CustomEvent('birgalikda:settings-updated', { detail: next }));
        return next;
    }

    function resolveTheme(theme) {
        if (theme === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme === 'dark' ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        const preference = theme || readSettings().theme || localStorage.getItem('theme') || 'light';
        const resolved = resolveTheme(preference);
        const targets = [document.documentElement, document.body].filter(Boolean);

        targets.forEach((target) => {
            target.classList.toggle('dark-theme', resolved === 'dark');
            target.dataset.theme = resolved;
            target.dataset.themePreference = preference;
        });
    }

    function applySettings(settings = readSettings()) {
        applyTheme(settings.theme);

        if (settings.locale?.language) {
            document.documentElement.lang = settings.locale.language;
        }

        Object.entries(settings.toggles || {}).forEach(([id, value]) => {
            const control = document.getElementById(id);
            if (control && control.type === 'checkbox' && control.checked !== Boolean(value)) {
                control.checked = Boolean(value);
            }
            document.documentElement.dataset[id.replace(/^toggle-/, '').replace(/-/g, '')] = String(Boolean(value));
        });

        const profile = settings.profile || {};
        const name = profile.name || localStorage.getItem('user_name');
        const company = profile.company;
        const avatar = settings.avatar;

        ['user-greeting-name', 'header-name', 'display-name'].forEach((id) => {
            const el = document.getElementById(id);
            if (el && name) el.textContent = name;
        });

        const displayCompany = document.getElementById('display-company');
        if (displayCompany && company) displayCompany.textContent = company;

        const headerAvatar = document.getElementById('header-avatar');
        if (headerAvatar && avatar) {
            headerAvatar.innerHTML = '<img src="' + avatar + '" alt="Avatar">';
        }
    }

    window.BirgalikdaSettings = {
        key: STORAGE_KEY,
        get: readSettings,
        set: writeSettings,
        apply: applySettings,
        applyTheme
    };

    document.addEventListener('DOMContentLoaded', () => {
        applySettings();

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        media.addEventListener('change', () => {
            if (readSettings().theme === 'auto') applySettings();
        });
    });

    window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY || event.key === 'theme') {
            applySettings();
            window.dispatchEvent(new CustomEvent('birgalikda:settings-updated', { detail: readSettings() }));
        }
    });
})();
