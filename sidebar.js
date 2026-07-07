/**
 * sidebar.js — Global sidebar drawer controller
 * Works on all pages that have .side-navigation
 */
(function () {
    'use strict';

    // ── Get page title from <title> tag ──
    function getPageTitle() {
        const titleMap = {
            'asosiy': 'Asosiy',
            'xarita': 'Xarita',
            'chat': 'Muloqotlar',
            'statistika': 'Statistika',
            'sozlamalar': 'Sozlamalar',
            'takliflar': 'Takliflar',
            'yordam': 'Yordam',
            'profils': 'Profil',
            'matching': 'Matching',
            'tushlik': 'Tushlik',
        };
        const path = window.location.pathname.toLowerCase();
        for (const [key, label] of Object.entries(titleMap)) {
            if (path.includes(key)) return label;
        }
        return document.title.replace('Birgalikda - ', '') || 'Birgalikda';
    }

    function init() {
        const sidebar = document.querySelector('.side-navigation');
        // xarita.html uses its own enterprise header — skip sidebar injection
        if (!sidebar || document.body.classList.contains('enterprise-app-mode')) return;

        // 1. Create hamburger button
        const hamburger = document.createElement('button');
        hamburger.className = 'hamburger-btn';
        hamburger.id = 'hamburger-btn';
        hamburger.setAttribute('aria-label', 'Menyuni ochish');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        document.body.prepend(hamburger);

        // 2. Create overlay backdrop
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.id = 'sidebar-overlay';
        document.body.appendChild(overlay);

        // 3. Create mobile top bar
        const topbar = document.createElement('div');
        topbar.className = 'mobile-topbar';
        topbar.id = 'mobile-topbar';
        topbar.innerHTML = `
            <span class="mobile-topbar-title">${getPageTitle()}</span>
        `;
        document.body.appendChild(topbar);

        // 4. Create mobile sidebar header
        const mobileHeader = document.createElement('div');
        mobileHeader.className = 'sidebar-mobile-header';
        mobileHeader.innerHTML = `
            <div class="sidebar-mobile-logo-text">🍽️ Birgalikda</div>
            <button type="button" class="sidebar-close-btn" aria-label="Yopish">
                <span aria-hidden="true">&times;</span>
            </button>
        `;
        sidebar.prepend(mobileHeader);

        const sidebarCloseBtn = mobileHeader.querySelector('.sidebar-close-btn');

        // 5. Open/close functions
        function openSidebar() {
            sidebar.classList.add('is-open');
            hamburger.classList.add('is-open');
            document.body.classList.add('sidebar-open');
            overlay.classList.add('is-visible');
            hamburger.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            sidebar.classList.remove('is-open');
            hamburger.classList.remove('is-open');
            document.body.classList.remove('sidebar-open');
            overlay.classList.remove('is-visible');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        function toggleSidebar() {
            if (sidebar.classList.contains('is-open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        }

        // 5. Event listeners
        hamburger.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', closeSidebar);
        sidebarCloseBtn.addEventListener('click', closeSidebar);

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && sidebar.classList.contains('is-open')) {
                closeSidebar();
            }
        });

        // Close when a nav link is clicked (on mobile)
        sidebar.querySelectorAll('nav a, .container-0 a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 1024) {
                    closeSidebar();
                }
            });
        });

        // Handle "E'lon qo'shish" sidebar button navigation globally
        const btnAnnounceLunch = document.getElementById('btn-announce-lunch');
        if (btnAnnounceLunch) {
            btnAnnounceLunch.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'tushlik.html';
            });
        }

        // --- Custom Premium Logout Modal ---
        const oldLogoutLink = document.getElementById("logout-link");
        if (oldLogoutLink) {
            const newLogoutLink = oldLogoutLink.cloneNode(true);
            oldLogoutLink.parentNode.replaceChild(newLogoutLink, oldLogoutLink);
            newLogoutLink.addEventListener("click", function (e) {
                e.preventDefault();
                showLogoutConfirmModal();
            });
        }

        function showLogoutConfirmModal() {
            if (document.getElementById('logout-confirm-modal')) return;

            if (!document.getElementById('logout-modal-style')) {
                const style = document.createElement('style');
                style.id = 'logout-modal-style';
                style.innerHTML = `
                    .logout-modal-backdrop {
                        position: fixed;
                        inset: 0;
                        background: rgba(15, 23, 42, 0.45);
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 99999;
                        opacity: 0;
                        transition: opacity 0.3s ease;
                    }
                    .logout-modal-backdrop.is-visible {
                        opacity: 1;
                    }
                    .logout-modal-card {
                        background: #ffffff;
                        border-radius: 20px;
                        padding: 30px 24px;
                        width: 90%;
                        max-width: 380px;
                        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.05);
                        text-align: center;
                        transform: scale(0.9) translateY(20px);
                        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    }
                    .logout-modal-backdrop.is-visible .logout-modal-card {
                        transform: scale(1) translateY(0);
                    }
                    .logout-modal-icon {
                        font-size: 40px;
                        color: #ef4444;
                        margin-bottom: 16px;
                        display: inline-block;
                        animation: logoutHeartbeat 1.5s infinite;
                    }
                    @keyframes logoutHeartbeat {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.08); }
                    }
                    .logout-modal-card h3 {
                        font-size: 19px;
                        font-weight: 700;
                        color: #0f172a;
                        margin-bottom: 10px;
                        letter-spacing: -0.3px;
                    }
                    .logout-modal-card p {
                        font-size: 14.5px;
                        color: #64748b;
                        margin-bottom: 24px;
                        line-height: 1.5;
                    }
                    .logout-modal-actions {
                        display: flex;
                        gap: 12px;
                        justify-content: center;
                    }
                    .logout-modal-btn {
                        flex: 1;
                        padding: 12px 20px;
                        border-radius: 12px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        border: none;
                    }
                    .logout-modal-btn--cancel {
                        background: #f1f5f9;
                        color: #334155;
                    }
                    .logout-modal-btn--cancel:hover {
                        background: #e2e8f0;
                    }
                    .logout-modal-btn--confirm {
                        background: #ef4444;
                        color: #ffffff;
                        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
                    }
                    .logout-modal-btn--confirm:hover {
                        background: #dc2626;
                        box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
                    }
                    body.dark-theme .logout-modal-card {
                        background: #1e293b;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
                    }
                    body.dark-theme .logout-modal-card h3 {
                        color: #f8fafc;
                    }
                    body.dark-theme .logout-modal-card p {
                        color: #94a3b8;
                    }
                    body.dark-theme .logout-modal-btn--cancel {
                        background: #334155;
                        color: #cbd5e1;
                    }
                    body.dark-theme .logout-modal-btn--cancel:hover {
                        background: #475569;
                    }
                `;
                document.head.appendChild(style);
            }

            const backdrop = document.createElement('div');
            backdrop.className = 'logout-modal-backdrop';
            backdrop.id = 'logout-confirm-modal';
            backdrop.innerHTML = `
                <div class="logout-modal-card">
                    <div class="logout-modal-icon">🚪</div>
                    <h3>Tizimdan chiqish</h3>
                    <p>Rostdan ham tizimdan chiqmoqchimisiz?</p>
                    <div class="logout-modal-actions">
                        <button class="logout-modal-btn logout-modal-btn--cancel" id="logout-cancel">Yo'q</button>
                        <button class="logout-modal-btn logout-modal-btn--confirm" id="logout-confirm">Ha, chiqish</button>
                    </div>
                </div>
            `;
            document.body.appendChild(backdrop);

            backdrop.offsetHeight; // force reflow
            backdrop.classList.add('is-visible');

            const close = () => {
                backdrop.classList.remove('is-visible');
                setTimeout(() => {
                    backdrop.remove();
                }, 300);
            };

            backdrop.addEventListener('click', function (e) {
                if (e.target === backdrop) close();
            });

            document.getElementById('logout-cancel').addEventListener('click', close);
            document.getElementById('logout-confirm').addEventListener('click', function () {
                localStorage.removeItem('sb-doboqtivghcdcoowoxmh-auth-token');
                localStorage.removeItem('user_name');
                localStorage.removeItem('user_role');
                localStorage.removeItem('current_match');
                window.location.href = 'kirish.html';
            });
        }

        // Handle resize — reset sidebar state on desktop
        window.addEventListener('resize', function () {
            if (window.innerWidth > 1024) {
                sidebar.classList.remove('is-open');
                hamburger.classList.remove('is-open');
                document.body.classList.remove('sidebar-open');
                overlay.classList.remove('is-visible');
                document.body.style.overflow = '';
            }
        });

        // 6. Enable transition after initial layout to prevent FOUC load transition flash
        setTimeout(() => {
            sidebar.classList.add('has-transition');
        }, 150);
    }

    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
