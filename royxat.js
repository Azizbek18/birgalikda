document.addEventListener('DOMContentLoaded', () => {
    // --- SUPABASE SOZLAMALARI ---
    const SUPABASE_URL = 'https://doboqtivghcdcoowoxmh.supabase.co'; 
    const SUPABASE_ANON_KEY = 'sb_publishable_VzI36RYaoGx_8MfGne-MhA_KjXo82Lv';
    
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 1. HTML elementlarini chaqirib olish
    const form = document.getElementById('registerForm');
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const terms = document.getElementById('terms');
    const roleOptions = document.querySelectorAll('.role-option');
    
    // Tugmalar
    const googleBtn = document.getElementById('googleBtn');
    const telegramBtn = document.getElementById('telegramBtn');
    const loginLink = document.getElementById('loginLink');
    const togglePwdIcon = document.getElementById('toggle-pwd-icon');
    const toggleConfirmPwdIcon = document.getElementById('toggle-confirm-pwd-icon');

    let currentRole = 'Talaba'; // Standart ro'yxatdan o'tish roli

    // --- TOASTIFY FUNKSIYASI ---
    function showNotification(message, type = 'success') {
        let container = document.getElementById('premium-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'premium-toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 12px;
                perspective: 1000px;
                pointer-events: none;
            `;
            document.body.appendChild(container);

            if (!document.getElementById('premium-toast-styles')) {
                const style = document.createElement('style');
                style.id = 'premium-toast-styles';
                style.innerHTML = `
                    .premium-toast {
                        background: rgba(255, 255, 255, 0.7);
                        backdrop-filter: blur(20px) saturate(180%);
                        -webkit-backdrop-filter: blur(20px) saturate(180%);
                        border: 1px solid rgba(255, 255, 255, 0.4);
                        border-radius: 16px;
                        padding: 16px 24px;
                        font-family: 'Poppins', 'Inter', sans-serif;
                        font-weight: 600;
                        font-size: 14px;
                        color: #1e293b;
                        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08), 
                                    inset 0 1px 1px rgba(255, 255, 255, 0.5);
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        min-width: 320px;
                        max-width: 400px;
                        pointer-events: auto;
                        transform: translateX(120%) rotateY(-30deg) scale(0.9);
                        opacity: 0;
                        transform-origin: right center;
                        transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                    }
                    .premium-toast.active {
                        transform: translateX(0) rotateY(0deg) scale(1);
                        opacity: 1;
                    }
                    .premium-toast.exit {
                        transform: translateX(120%) rotateY(30deg) scale(0.9);
                        opacity: 0;
                    }
                    .premium-toast::before {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 15%;
                        height: 70%;
                        width: 5px;
                        border-radius: 0 4px 4px 0;
                    }
                    .premium-toast.success::before { background: #12b76a; }
                    .premium-toast.error::before { background: #ef4444; }
                    .premium-toast.info::before { background: #3b82f6; }
                    .premium-toast.warning::before { background: #f59e0b; }
                    
                    .premium-toast-icon {
                        font-size: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .premium-toast.success .premium-toast-icon { color: #12b76a; }
                    .premium-toast.error .premium-toast-icon { color: #ef4444; }
                    .premium-toast.info .premium-toast-icon { color: #3b82f6; }
                    .premium-toast.warning .premium-toast-icon { color: #f59e0b; }
                `;
                document.head.appendChild(style);
            }
        }

        const toast = document.createElement('div');
        toast.className = `premium-toast ${type}`;
        
        const icons = {
            success: '✨',
            error: '🚨',
            info: '💡',
            warning: '⚠️'
        };
        
        toast.innerHTML = `
            <div class="premium-toast-icon">${icons[type] || '💡'}</div>
            <div style="flex: 1;">${message}</div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('active');
        }, 50);
        
        setTimeout(() => {
            toast.classList.remove('active');
            toast.classList.add('exit');
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 3500);
    }

    // 2. Rolni almashtirish funksiyasi
    roleOptions.forEach(option => {
        option.addEventListener('click', () => {
            roleOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            currentRole = option.getAttribute('data-role');
        });
    });

    // 2.1 Parollarni ko'rsatish va yashirish
    if (togglePwdIcon) {
        togglePwdIcon.addEventListener('click', () => {
            if (password.type === 'password') {
                password.type = 'text';
                togglePwdIcon.classList.remove('fa-eye');
                togglePwdIcon.classList.add('fa-eye-slash');
            } else {
                password.type = 'password';
                togglePwdIcon.classList.remove('fa-eye-slash');
                togglePwdIcon.classList.add('fa-eye');
            }
        });
    }

    if (toggleConfirmPwdIcon) {
        toggleConfirmPwdIcon.addEventListener('click', () => {
            if (confirmPassword.type === 'password') {
                confirmPassword.type = 'text';
                toggleConfirmPwdIcon.classList.remove('fa-eye');
                toggleConfirmPwdIcon.classList.add('fa-eye-slash');
            } else {
                confirmPassword.type = 'password';
                toggleConfirmPwdIcon.classList.remove('fa-eye-slash');
                toggleConfirmPwdIcon.classList.add('fa-eye');
            }
        });
    }

    // 3. Formani tekshirish va yuborish
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameVal = fullName.value.trim();
        const emailVal = email.value.trim();
        const passVal = password.value;
        const confPassVal = confirmPassword.value;

        // Validatsiya qoidalari
        if (!nameVal) {
            showNotification("Iltimos, to'liq ismingizni kiriting.", "error");
            fullName.focus();
            return;
        }

        if (!emailVal || !validateEmail(emailVal)) {
            showNotification("Iltimos, to'g'ri elektron pochta manzilini kiriting.", "error");
            email.focus();
            return;
        }

        if (passVal.length < 6) {
            showNotification("Parol kamida 6 ta belgidan iborat bo'lishi kerak.", "error");
            password.focus();
            return;
        }

        if (passVal !== confPassVal) {
            showNotification("Xatolik: Parollar bir-biriga mos kelmadi!", "error");
            confirmPassword.focus();
            return;
        }

        if (terms && !terms.checked) {
            showNotification("Foydalanish shartlari va Maxfiylik siyosatiga rozilik bildiring.", "error");
            return;
        }

        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        showNotification("Hisob yaratilmoqda...", "info");

        try {
            // --- 1-QADAM: SUPABASE AUTH ORQALI FOYDALANUVCHI YARATISH ---
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email: emailVal,
                password: passVal,
                options: {
                    data: {
                        full_name: nameVal,
                        role: currentRole
                    }
                }
            });

            if (authError) throw authError;

            // Foydalanuvchining unikal ID sini olamiz
            const userUuid = authData.user?.id;

            if (!userUuid) {
                throw new Error("Xavfsizlik identifikatori (UUID) yaratilmadi.");
            }

            // --- 2-QADAM: SIZNING 'profiles' JADVALINGIZGA MA'LUMOT QO'SHISH ---
            // Trigger avtomatik yaratgan bo'lishi mumkinligi sababli upsert ishlatamiz
            const { error: profileError } = await supabaseClient
                .from('profiles') 
                .upsert([
                    { 
                        id: userUuid, 
                        full_name: nameVal, 
                        email: emailVal, 
                        role: currentRole 
                    }
                ], { onConflict: 'id' });

            // RLS yoki trigger tufayli upsert xatosi bo'lsa ogohlantiramiz, lekin davom etamiz
            if (profileError) {
                console.warn("Profil qo'shishda ogohlantirish (ehtimol trigger allaqachon yaratgan):", profileError.message);
            }

            showNotification("Muvaffaqiyatli! Ro'yxatdan o'tdingiz. Tizimga kirish sahifasiga yo'naltirilmoqdasiz...", "success");
            
            form.reset(); 
            if(roleOptions[0]) roleOptions[0].click(); 

            setTimeout(() => {
                window.location.href = 'kirish.html';
            }, 2000);

        } catch (error) {
            console.error("Xatolik yuz berdi:", error.message);
            showNotification(`Xatolik: ${error.message}`, "error");
        } finally {
            submitBtn.disabled = false;
        }
    });

    // POPUP OYNANI OCHISH
    function openPopup(url, title, w, h) {
        const left = (window.innerWidth - w) / 2;
        const top = (window.innerHeight - h) / 2;
        return window.open(url, title, `width=${w},height=${h},top=${top},left=${left},resizable=yes,scrollbars=yes`);
    }

    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            showNotification("Google orqali ro'yxatdan o'tish tez kunda!", "info");
        });
    }

    if (telegramBtn) {
        telegramBtn.addEventListener('click', () => {
            showNotification("Telegram orqali ro'yxatdan o'tish tez kunda!", "info");
        });
    }

    // Foydalanish shartlari va Maxfiylik siyosati havolalari
    const termsLinks = document.querySelectorAll('.terms-container a');
    termsLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const text = link.textContent.trim();
            showNotification(`${text} tez kunda!`, "info");
        });
    });

    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showNotification("Tizimga kirish sahifasiga yo'naltirilmoqda...", "info");
        setTimeout(() => {
            window.location.href = 'kirish.html';
        }, 1000);
    });

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});