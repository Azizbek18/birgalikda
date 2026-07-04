document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;

    const stepData = {
        step1: {
            title: "Sohangizni tanlang",
            desc: "Birgalikda sizga o'xshash qiziqishlarga ega mutaxassislarni topishga yordam beradi.",
            storageKey: "Birgalikda_fields",
            items: ["Frontend", "Backend", "Mobile Developer", "UI/UX Designer", "Project Manager", "Data Science", "Marketing", "HR Specialist", "DevOps", "QA Engineer", "Business Analyst", "Fintech"]
        },
        step2: {
            title: "Tushlikdagi maqsadingiz?",
            desc: "Tushlik vaqtida hamrohingiz bilan nima haqida suhbatlashishni xohlaysiz?",
            storageKey: "Birgalikda_goals",
            items: ["Tajriba almashish", "Karyera maslahatlari", "Startup & Biznes", "Texnologiya & Trendlar", "Mentorlik izlash", "Shunchaki suhbat", "Hamkorlik (Co-working)", "Yangi do'stlar orttirish", "G'oyalar muhokamasi"]
        },
        step3: {
            title: "Qulay vaqt va muhit",
            desc: "Tushlik qilish uchun sizga eng ma'qul vaqt oralig'i va joy turi.",
            storageKey: "Birgalikda_preferences",
            items: ["Vaqt: 12:00 - 13:00", "Vaqt: 13:00 - 14:00", "Vaqt: 14:00 - 15:00", "Muhit: Tinch kafe", "Muhit: Sho'x & Faol", "Joy: IT Park atrofida", "Joy: GroundZero yaqinida", "Joy: Kafe / Restoran", "Joy: Istalgan joy"]
        }
    };

    const stepText = document.querySelector('.step');
    const progressFill = document.querySelector('.progress-fill');
    const titleH2 = document.querySelector('.title-box h2');
    const titleP = document.querySelector('.title-box p');
    const grid = document.querySelector('.grid');
    const nextBtn = document.querySelector('.btn');
    const backBtn = document.getElementById('back-btn');
    const footer = document.querySelector('.footer');

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

    function renderGrid(items, storageKey) {
        grid.innerHTML = '';
        const savedData = JSON.parse(localStorage.getItem(storageKey) || '[]');

        items.forEach(itemText => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.textContent = itemText;

            if (savedData.includes(itemText)) {
                itemDiv.classList.add('active');
            }

            itemDiv.addEventListener('click', () => {
                itemDiv.classList.toggle('active');
            });

            grid.appendChild(itemDiv);
        });
    }

    function renderStep() {
        const data = stepData[`step${currentStep}`];
        if (!data) return;

        // Update progress bar & headers
        stepText.textContent = `Bosqich ${currentStep} / 3`;
        progressFill.style.width = `${(currentStep / 3) * 100}%`;
        titleH2.textContent = data.title;
        titleP.textContent = data.desc;

        // Back button visibility
        if (backBtn && footer) {
            if (currentStep > 1) {
                backBtn.style.display = 'flex';
                footer.style.justifyContent = 'space-between';
            } else {
                backBtn.style.display = 'none';
                footer.style.justifyContent = 'flex-end';
            }
        }

        // Change button text on last step
        if (currentStep === 3) {
            nextBtn.innerHTML = `Boshlash <i class="fa-solid fa-arrow-right"></i>`;
        } else {
            nextBtn.innerHTML = `Keyingi <i class="fa-solid fa-arrow-right"></i>`;
        }

        // Render grid items
        const userId = getUserId() || 'guest';
        renderGrid(data.items, `${data.storageKey}_${userId}`);
    }

    // "Keyingi" / "Boshlash" button click
    nextBtn.addEventListener('click', () => {
        const activeItems = document.querySelectorAll('.item.active');

        if (activeItems.length === 0) {
            showToast('Iltimos, kamida bitta variantni tanlang!', 'warning');
            return;
        }

        // Save selected items
        const selected = [];
        activeItems.forEach(item => {
            selected.push(item.textContent.trim());
        });
        
        const data = stepData[`step${currentStep}`];
        const userId = getUserId() || 'guest';
        localStorage.setItem(`${data.storageKey}_${userId}`, JSON.stringify(selected));

        if (currentStep < 3) {
            currentStep++;
            renderStep();
        } else {
            // End of onboarding -> Save completion state and redirect to dashboard
            localStorage.setItem(`onboarding_completed_${userId}`, 'true');
            window.location.href = 'Asosiy.html';
        }
    });

    // "Orqaga" button click
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                renderStep();
            }
        });
    }

    // Initialize step 1
    renderStep();

    // ===== Toast notification function =====
    function showToast(message, type = 'success') {
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
                        transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                    }
                    .premium-toast.active {
                        transform: translateX(0) rotateY(0) scale(1);
                        opacity: 1;
                    }
                    .premium-toast.exit {
                        transform: translateX(120%) scale(0.9);
                        opacity: 0;
                    }
                    .premium-toast.success { border-left: 5px solid #12b76a; }
                    .premium-toast.error { border-left: 5px solid #ef4444; }
                    .premium-toast.info { border-left: 5px solid #3b82f6; }
                    .premium-toast.warning { border-left: 5px solid #f59e0b; }
                    .premium-toast-icon {
                        font-size: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
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
});
