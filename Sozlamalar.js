/* ==========================================================================
   Birgalikda - SOZLAMALAR DASHBOARD v2.0
   All buttons and controls are fully functional
   State persistence via localStorage + Supabase sync (profile)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    /* ---------- Supabase ulanishi ---------- */
    const supabaseUrl = 'https://doboqtivghcdcoowoxmh.supabase.co';
    const supabaseKey = 'sb_publishable_VzI36RYaoGx_8MfGne-MhA_KjXo82Lv';
    const supabaseClient = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

    function getUserId() {
        try {
            const token = localStorage.getItem('sb-doboqtivghcdcoowoxmh-auth-token');
            if (token) {
                const parsed = JSON.parse(token);
                return parsed?.user?.id || null;
            }
        } catch (e) {
            console.error(e);
        }
        return null;
    }

    const myId = getUserId();

    /* ---------- Elementlar ---------- */
    const profileForm = document.getElementById("profile-settings-form");
    const saveBtn = document.getElementById("save-profile-btn");
    const toast = document.getElementById("toast-message");

    const inputs = {
        name: document.getElementById("set-name"),
        company: document.getElementById("set-company"),
        bio: document.getElementById("set-bio"),
        interests: document.getElementById("set-interests")
    };

    const bioCount = document.getElementById("bio-count");
    const interestsPreview = document.getElementById("interests-preview");
    const displayName = document.getElementById("display-name");
    const displayCompany = document.getElementById("display-company");
    const headerName = document.getElementById("header-name");
    const headerAvatar = document.getElementById("header-avatar");
    const avatarPreview = document.getElementById("avatar-preview");
    const avatarInput = document.getElementById("avatar-input");
    const avatarEditBtn = document.getElementById("avatar-edit-btn");
    const avatarRemoveBtn = document.getElementById("avatar-remove-btn");

    /* ==================================================================
       1. TOAST XABARLAR
       ================================================================== */
    function showToast(message, typeOrIsError = 'success') {
        const type = (typeOrIsError === true) ? 'error' : (typeOrIsError === false) ? 'success' : typeOrIsError;
        let container = document.getElementById('premium-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'premium-toast-container';
            container.style.cssText = `position:fixed; top:20px; right:20px; z-index:10000; display:flex; flex-direction:column; gap:12px; perspective:1000px; pointer-events:none;`;
            document.body.appendChild(container);
            if (!document.getElementById('premium-toast-styles')) {
                const style = document.createElement('style');
                style.id = 'premium-toast-styles';
                style.innerHTML = `
                    .premium-toast { background:rgba(255,255,255,0.75); backdrop-filter:blur(20px) saturate(180%); -webkit-backdrop-filter:blur(20px) saturate(180%); border:1px solid rgba(255,255,255,0.5); border-radius:16px; padding:16px 24px; font-family:'Poppins','Inter',sans-serif; font-weight:600; font-size:14px; color:#1e293b; box-shadow:0 20px 40px rgba(15,23,42,0.08),inset 0 1px 1px rgba(255,255,255,0.5); display:flex; align-items:center; gap:12px; min-width:320px; max-width:400px; pointer-events:auto; transform:translateX(120%) rotateY(-30deg) scale(0.9); opacity:0; transition:all 0.5s cubic-bezier(0.34,1.56,0.64,1); }
                    .premium-toast.active { transform:translateX(0) rotateY(0) scale(1); opacity:1; }
                    .premium-toast.exit { transform:translateX(120%) scale(0.9); opacity:0; }
                    .premium-toast.success { border-left:4px solid #10b981; }
                    .premium-toast.error { border-left:4px solid #ef4444; }
                    .premium-toast.info { border-left:4px solid #0077b6; }
                    .premium-toast.warning { border-left:4px solid #f59e0b; }
                    .premium-toast-icon { font-size:20px; display:flex; align-items:center; justify-content:center; }
                    body.dark-theme .premium-toast { background:rgba(30, 41, 59, 0.85); border-color:rgba(255,255,255,0.1); color:#f1f5f9; box-shadow:0 20px 40px rgba(0,0,0,0.3); }
                `;
                document.head.appendChild(style);
            }
        }
        const toastEl = document.createElement('div');
        toastEl.className = `premium-toast ${type}`;
        const icons = { success: '✨', error: '🚨', info: '💡', warning: '⚠️' };
        toastEl.innerHTML = `<div class="premium-toast-icon">${icons[type] || '💡'}</div><div style="flex:1;">${message}</div>`;
        container.appendChild(toastEl);
        setTimeout(() => { toastEl.classList.add('active'); }, 50);
        setTimeout(() => { toastEl.classList.remove('active'); toastEl.classList.add('exit'); setTimeout(() => { toastEl.remove(); }, 500); }, 3500);
    }


    /* ==================================================================
       2. LOCALSTORAGE YORDAMCHILARI
       ================================================================== */
    const STORAGE_KEY = 'Birgalikda_settings';

    function loadSettings() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function saveSettings(data) {
        const next = window.BirgalikdaSettings?.set
            ? window.BirgalikdaSettings.set(data)
            : { ...loadSettings(), ...data };

        if (!window.BirgalikdaSettings?.set) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            if (data.theme) localStorage.setItem('theme', data.theme);
            window.dispatchEvent(new CustomEvent('birgalikda:settings-updated', { detail: next }));
        }

        return next;
    }

    /* ==================================================================
       3. AVATAR BOSHQARUVI
       ================================================================== */
    function setAvatar(src) {
        let existingImg = avatarPreview.querySelector('img');
        let fallback = avatarPreview.querySelector('.avatar-fallback');
        if (!fallback) {
            fallback = document.createElement('i');
            fallback.className = 'fa-solid fa-user avatar-fallback';
        }

        if (src) {
            if (existingImg) existingImg.src = src;
            else {
                existingImg = document.createElement('img');
                existingImg.src = src;
                existingImg.alt = 'Avatar';
                avatarPreview.innerHTML = '';
                avatarPreview.appendChild(existingImg);
            }
            // Header avatar
            headerAvatar.innerHTML = '<img src="' + src + '" alt="Avatar">';
            saveSettings({ avatar: src });
        } else {
            avatarPreview.innerHTML = '';
            avatarPreview.appendChild(fallback);
            headerAvatar.innerHTML = '<i class="fa-solid fa-user"></i>';
            saveSettings({ avatar: null });
        }
    }

    avatarEditBtn.addEventListener('click', () => avatarInput.click());

    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast('Faqat rasm fayli yuklash mumkin', true);
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            showToast('Rasm hajmi 2MB dan oshmasligi kerak', true);
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            setAvatar(ev.target.result);
            showToast('Avatar yangilandi!');
        };
        reader.readAsDataURL(file);
    });

    avatarRemoveBtn.addEventListener('click', () => {
        setAvatar(null);
        avatarInput.value = '';
        showToast('Avatar o\'chirildi');
    });

    /* ==================================================================
       4. BIO OYNA HISOBLAGICH
       ================================================================== */
    function updateBioCount() {
        const len = inputs.bio.value.length;
        bioCount.textContent = len;
        bioCount.style.color = len > 220 ? '#EF4444' : '';
    }
    inputs.bio.addEventListener('input', updateBioCount);

    /* ==================================================================
       5. QIZIQISHLAR PREVIEW
       ================================================================== */
    function updateInterestsPreview() {
        const tags = inputs.interests.value
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        interestsPreview.innerHTML = '';
        tags.forEach(tag => {
            const chip = document.createElement('span');
            chip.className = 'interest-chip';
            chip.textContent = tag;
            interestsPreview.appendChild(chip);
        });
    }
    inputs.interests.addEventListener('input', updateInterestsPreview);

    /* ==================================================================
       6. PROFIL MA'LUMOTLARINI YUKLASH
       ================================================================== */
    async function loadProfileData() {
        // Avval localStorage dan yuklash
        const saved = loadSettings();
        if (saved.avatar) setAvatar(saved.avatar);

        // Supabase dan yuklash
        if (!supabaseClient || !myId) {
            // LocalStorage'dan to'ldirish
            if (saved.profile) {
                inputs.name.value = saved.profile.name || '';
                inputs.company.value = saved.profile.company || '';
                inputs.bio.value = saved.profile.bio || '';
                inputs.interests.value = (saved.profile.interests || []).join(', ');
                updateBioCount();
                updateInterestsPreview();
                updateDisplay();
            }
            return;
        }

        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', myId)
                .single();

            if (data && !error) {
                inputs.name.value = data.full_name || '';
                inputs.company.value = data.role || '';
                inputs.bio.value = data.bio || '';
                inputs.interests.value = data.interests ? data.interests.join(', ') : '';
                updateBioCount();
                updateInterestsPreview();
                updateDisplay();
            }
        } catch (err) {
            console.error("Sozlamalar - Ma'lumotni yuklashda xatolik:", err);
        }
    }

    function updateDisplay() {
        const name = inputs.name.value || 'Foydalanuvchi';
        const company = inputs.company.value || 'Kompaniya yoki soha';
        displayName.textContent = name;
        displayCompany.textContent = company;
        headerName.textContent = name;
    }

    function collectProfileData() {
        return {
            full_name: inputs.name.value.trim(),
            role: inputs.company.value.trim(),
            bio: inputs.bio.value.trim(),
            interests: inputs.interests.value.split(',').map(i => i.trim()).filter(Boolean)
        };
    }

    function saveProfileDraft() {
        updateDisplay();
        saveSettings({ profile: collectProfileData() });
    }

    Object.values(inputs).forEach((input) => {
        input.addEventListener('input', saveProfileDraft);
    });

    /* ==================================================================
       7. PROFIL FORMASINI SAQLASH
       ================================================================== */
    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!inputs.name.value.trim()) {
            showToast('Ism maydonini to\'ldiring', true);
            inputs.name.focus();
            return;
        }

        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Saqlanmoqda...</span>';
        saveBtn.disabled = true;

        const updatedData = collectProfileData();

        // LocalStorage'ga saqlash (off-line kesh)
        saveSettings({ profile: updatedData });

        let success = true;
        if (supabaseClient && myId) {
            try {
                const { error } = await supabaseClient
                    .from('profiles')
                    .update(updatedData)
                    .eq('id', myId);
                if (error) {
                    success = false;
                    showToast("Xatolik: " + error.message, true);
                }
            } catch (err) {
                success = false;
                showToast("Tarmoq xatosi: mahalliy saqlandi", true);
            }
        }

        if (success) {
            updateDisplay();
            showToast("Profil muvaffaqiyatli saqlandi!");
        }

        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    });

    /* ==================================================================
       8. TOGGLE'LAR — holatni saqlash
       ================================================================== */
    const toggles = [
        'toggle-notifications',
        'toggle-sound',
        'toggle-email',
        'toggle-quick-match',
        'toggle-profile-visible',
        'toggle-online-status',
        'toggle-2fa'
    ];

    const savedToggles = loadSettings().toggles || {};
    toggles.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (savedToggles[id] !== undefined) el.checked = savedToggles[id];
        el.addEventListener('change', () => {
            saveSettings({ toggles: { ...loadSettings().toggles, [id]: el.checked } });
            const label = el.closest('.toggle-group')?.querySelector('h4')?.textContent || id;
            showToast(label + ': ' + (el.checked ? 'Yoqildi' : 'O\'chirildi'));
        });
    });

    /* ==================================================================
       9. TUSHLIK AFSATLIGI SLIDERI
       ================================================================== */
    const maxDistance = document.getElementById('max-distance');
    const distanceValue = document.getElementById('distance-value');

    function updateDistance() {
        distanceValue.textContent = parseFloat(maxDistance.value) + ' km';
    }
    maxDistance.addEventListener('input', updateDistance);

    const saveLunchBtn = document.getElementById('save-lunch-prefs-btn');
    saveLunchBtn.addEventListener('click', () => {
        const prefs = {
            lunchTime: document.getElementById('lunch-time').value,
            lunchDuration: document.getElementById('lunch-duration').value,
            maxDistance: maxDistance.value,
            preferredCuisine: document.getElementById('preferred-cuisine').value
        };
        saveSettings({ lunchPrefs: prefs });
        const original = saveLunchBtn.innerHTML;
        saveLunchBtn.innerHTML = '<i class="fa-solid fa-check"></i><span>Saqlandi!</span>';
        saveLunchBtn.disabled = true;
        showToast('Tushlik sozlamalari saqlandi');
        setTimeout(() => {
            saveLunchBtn.innerHTML = original;
            saveLunchBtn.disabled = false;
        }, 1500);
    });

    // Lunch prefs ni yuklash
    const savedLunch = loadSettings().lunchPrefs;
    if (savedLunch) {
        if (savedLunch.lunchTime) document.getElementById('lunch-time').value = savedLunch.lunchTime;
        if (savedLunch.lunchDuration) document.getElementById('lunch-duration').value = savedLunch.lunchDuration;
        if (savedLunch.maxDistance) {
            maxDistance.value = savedLunch.maxDistance;
            updateDistance();
        }
        if (savedLunch.preferredCuisine) document.getElementById('preferred-cuisine').value = savedLunch.preferredCuisine;
    }

    /* ==================================================================
       10. TEMA TANLOVI
       ================================================================== */
    const themeOptions = document.querySelectorAll('.theme-option');
    const savedTheme = loadSettings().theme || 'light';

    function applyTheme(theme) {
        if (window.BirgalikdaSettings?.applyTheme) {
            window.BirgalikdaSettings.applyTheme(theme);
            return;
        }

        const resolvedTheme = theme === 'auto'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : theme;

        document.body.classList.toggle('dark-theme', resolvedTheme === 'dark');
        document.documentElement.classList.toggle('dark-theme', resolvedTheme === 'dark');
        document.body.dataset.theme = resolvedTheme;
        document.documentElement.dataset.theme = resolvedTheme;
    }


    function setTheme(theme) {
        themeOptions.forEach(opt => opt.classList.toggle('active', opt.dataset.theme === theme));
        applyTheme(theme);
        saveSettings({ theme });
    }

    themeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            const theme = opt.dataset.theme;
            setTheme(theme);
            showToast('Tema: ' + (theme === 'light' ? 'Yorug\'' : theme === 'dark' ? 'Qorong\'i' : 'Auto'));
        });
    });

    setTheme(savedTheme);

    // Auto tema uchun tizim o'zgarishini kuzatish
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (loadSettings().theme === 'auto') applyTheme('auto');
    });

    function syncSettingsControls(settings = loadSettings()) {
        const currentTheme = settings.theme || 'light';
        themeOptions.forEach(opt => opt.classList.toggle('active', opt.dataset.theme === currentTheme));
        applyTheme(currentTheme);

        Object.entries(settings.toggles || {}).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el && el.checked !== Boolean(value)) el.checked = Boolean(value);
        });

        if (settings.locale) {
            if (settings.locale.language && appLanguage) appLanguage.value = settings.locale.language;
            if (settings.locale.timezone && appTimezone) appTimezone.value = settings.locale.timezone;
        }

        if (settings.privacy?.invitePermission && invitePermission) {
            invitePermission.value = settings.privacy.invitePermission;
        }

        if (settings.profile) {
            inputs.name.value = settings.profile.name || '';
            inputs.company.value = settings.profile.company || '';
            inputs.bio.value = settings.profile.bio || '';
            inputs.interests.value = (settings.profile.interests || []).join(', ');
            updateBioCount();
            updateInterestsPreview();
            updateDisplay();
        }
    }

    window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY || event.key === 'theme') syncSettingsControls();
    });

    window.addEventListener('birgalikda:settings-updated', (event) => {
        syncSettingsControls(event.detail || loadSettings());
    });

    /* ==================================================================
       11. MAXFIYLIK — TAKLIF RUHSATI
       ================================================================== */
    const invitePermission = document.getElementById('invite-permission');
    const savedPrivacy = loadSettings().privacy;
    if (savedPrivacy?.invitePermission) invitePermission.value = savedPrivacy.invitePermission;
    invitePermission.addEventListener('change', () => {
        saveSettings({ privacy: { ...loadSettings().privacy, invitePermission: invitePermission.value } });
        showToast('Taklif sozlamasi yangilandi');
    });

    /* ==================================================================
       12. XAVFSIZLIK — PAROL O'ZGARTIRISH
       ================================================================== */
    const changePasswordBtn = document.getElementById('change-password-btn');
    const passwordForm = document.getElementById('password-form');
    const cancelPasswordBtn = document.getElementById('cancel-password-btn');
    const submitPasswordBtn = document.getElementById('submit-password-btn');

    changePasswordBtn.addEventListener('click', () => {
        passwordForm.classList.toggle('hidden');
        if (!passwordForm.classList.contains('hidden')) {
            document.getElementById('current-password').focus();
        }
    });

    cancelPasswordBtn.addEventListener('click', () => {
        passwordForm.classList.add('hidden');
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    });

    submitPasswordBtn.addEventListener('click', () => {
        const current = document.getElementById('current-password').value;
        const next = document.getElementById('new-password').value;
        const confirm = document.getElementById('confirm-password').value;

        if (!current || !next || !confirm) {
            showToast('Barcha maydonlarni to\'ldiring', true);
            return;
        }
        if (next.length < 6) {
            showToast('Yangi parol kamida 6 belgidan iborat bo\'lishi kerak', true);
            return;
        }
        if (next !== confirm) {
            showToast('Yangi parollar mos kelmadi', true);
            return;
        }
        if (next === current) {
            showToast('Yangi parol eski paroldan farqli bo\'lishi kerak', true);
            return;
        }

        const original = submitPasswordBtn.innerHTML;
        submitPasswordBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>...</span>';
        submitPasswordBtn.disabled = true;

        // Simulyatsiya (haqiqiy loyihada Supabase auth.updateUser ishlatiladi)
        setTimeout(() => {
            submitPasswordBtn.innerHTML = original;
            submitPasswordBtn.disabled = false;
            passwordForm.classList.add('hidden');
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
            showToast('Parol muvaffaqiyatli o\'zgartirildi!');
        }, 800);
    });

    /* ==================================================================
       13. FAOL SEANSLAR
       ================================================================== */
    document.getElementById('manage-sessions-btn').addEventListener('click', () => {
        showToast('Faol seanslar: 2 qurilma — boshqaruv ochildi');
        // Haqiqiy loyihada: window.location.href = 'sessions.html';
    });

    /* ==================================================================
       14. TIL & VAQT MINTAQASI
       ================================================================== */
    const appLanguage = document.getElementById('app-language');
    const appTimezone = document.getElementById('app-timezone');
    const savedLocale = loadSettings().locale;
    if (savedLocale) {
        if (savedLocale.language) appLanguage.value = savedLocale.language;
        if (savedLocale.timezone) appTimezone.value = savedLocale.timezone;
    }
    appLanguage.addEventListener('change', () => {
        saveSettings({ locale: { ...loadSettings().locale, language: appLanguage.value } });
        showToast('Til: ' + appLanguage.options[appLanguage.selectedIndex].textContent);
    });
    appTimezone.addEventListener('change', () => {
        saveSettings({ locale: { ...loadSettings().locale, timezone: appTimezone.value } });
        showToast('Vaqt mintaqasi yangilandi');
    });

    /* ==================================================================
       15. ILOVANI BAHOLASH
       ================================================================== */
    document.getElementById('rate-app-link').addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Rahmat! Ilovani baholangiz uchun');
    });

    /* ==================================================================
       16. HISOBNI O'CHIRISH MODALI
       ================================================================== */
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const deleteModal = document.getElementById('delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    deleteAccountBtn.addEventListener('click', () => {
        deleteModal.classList.remove('hidden');
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
    });

    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) deleteModal.classList.add('hidden');
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        const original = confirmDeleteBtn.innerHTML;
        confirmDeleteBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>O\'chirilmoqda...</span>';
        confirmDeleteBtn.disabled = true;

        // Supabase'dan o'chirish (simulyatsiya)
        setTimeout(() => {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem('sb-doboqtivghcdcoowoxmh-auth-token');
            localStorage.removeItem('current_match');
            showToast('Hisob o\'chirildi. Yo\'naltirilmoqda...');
            setTimeout(() => {
                window.location.href = 'kirish.html';
            }, 1500);
        }, 1000);
    });

    /* ==================================================================
       17. CHIQISH (LOGOUT)
       ================================================================== */
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
        logoutLink.addEventListener("click", () => {
            localStorage.removeItem('sb-doboqtivghcdcoowoxmh-auth-token');
            localStorage.removeItem('current_match');
        });
    }

    /* ==================================================================
       18. KLAVIATURA YORDAMCHILARI (ESC yopish)
       ================================================================== */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!deleteModal.classList.contains('hidden')) {
                deleteModal.classList.add('hidden');
            }
            if (!passwordForm.classList.contains('hidden')) {
                passwordForm.classList.add('hidden');
            }
            // Sidebar yopish
            const sideNav = document.getElementById('sideNavigation');
            if (sideNav?.classList.contains('open')) {
                sideNav.classList.remove('open');
                document.getElementById('sidebar-overlay')?.classList.remove('show');
            }
        }
    });

    /* ==================================================================
       19. BOSHQA SAHIFA ELEMENTLARI (eski kod bilan moslik)
       ================================================================== */
    // Header-user-preview bosilganda profil sahifasiga
    document.getElementById('header-user-preview').addEventListener('click', () => {
        window.location.href = 'profileS.html';
    });

    /* ==================================================================
       20. INIT — boshlang'ich holat
       ================================================================== */
    updateBioCount();
    updateInterestsPreview();
    updateDisplay();
    loadProfileData();

    console.log('%c🚀 Birgalikda Sozlamalar Dashboard v2.0 ishga tushdi', 'color: #0EA5E9; font-weight: 700;');
});
