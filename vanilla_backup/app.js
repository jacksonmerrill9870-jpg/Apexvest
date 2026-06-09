/* ==========================================================================
   Apexvest Investment Platform JS Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Clone Market Ticker Items for Infinite Loop
    const tickerTrack = document.getElementById('market-ticker');
    if (tickerTrack) {
        const items = Array.from(tickerTrack.children);
        // Duplicate items twice to ensure track width is sufficient for continuous animation
        items.forEach(item => {
            const clone = item.cloneNode(true);
            tickerTrack.appendChild(clone);
        });
        items.forEach(item => {
            const clone = item.cloneNode(true);
            tickerTrack.appendChild(clone);
        });
    }

    // 3. Live Price Fluctuation Simulation
    const simulateMarketMovements = () => {
        const tickerItems = document.querySelectorAll('.ticker-item');
        if (tickerItems.length === 0) return;

        // Choose a random item to change
        const randomIndex = Math.floor(Math.random() * tickerItems.length);
        const item = tickerItems[randomIndex];
        const valEl = item.querySelector('.ticker-val');
        const changeEl = item.querySelector('.ticker-change');
        if (!valEl || !changeEl) return;

        const originalValStr = valEl.textContent.replace(/,/g, '');
        let val = parseFloat(originalValStr);
        if (isNaN(val)) return;

        // Small random change
        const isBitcoin = item.getAttribute('data-symbol') === 'BTCUSD';
        const isEthereum = item.getAttribute('data-symbol') === 'ETHUSD';
        const percentChange = (Math.random() * 0.15 - 0.075); // -0.075% to +0.075%
        
        let delta = val * (percentChange / 100);
        let newVal = val + delta;
        
        // Formatting decimal places
        let formattedVal;
        if (isBitcoin) {
            formattedVal = newVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (isEthereum) {
            formattedVal = newVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (newVal > 100) {
            formattedVal = newVal.toFixed(2);
        } else {
            formattedVal = newVal.toFixed(4);
        }

        // Apply new value
        valEl.textContent = formattedVal;

        // Visual feedback flash
        const isUp = percentChange >= 0;
        valEl.style.color = isUp ? 'var(--color-green)' : 'var(--color-red)';
        
        // Reset color transition
        setTimeout(() => {
            valEl.style.color = 'var(--color-text-secondary)';
        }, 1000);

        // Update change label text slightly
        const currentChangePercent = parseFloat(changeEl.textContent);
        const newChangePercent = currentChangePercent + percentChange;
        const newChangeSign = newChangePercent >= 0 ? '+' : '';
        changeEl.textContent = `${newChangeSign}${newChangePercent.toFixed(2)}%`;

        // Update change classes
        if (newChangePercent >= 0) {
            changeEl.className = 'ticker-change up';
        } else {
            changeEl.className = 'ticker-change down';
        }
    };

    // Run fluctuations every 800ms
    setInterval(simulateMarketMovements, 800);


    // 4. Interactive Investment Return Calculator
    const calcAmount = document.getElementById('calc-amount');
    const calcDuration = document.getElementById('calc-duration');
    const calcAmountText = document.getElementById('calc-amount-text');
    const calcDurationText = document.getElementById('calc-duration-text');
    const calcReturns = document.getElementById('calc-returns');
    const calcTotal = document.getElementById('calc-total');
    const calcRoi = document.getElementById('calc-roi');
    const assetBtns = document.querySelectorAll('.asset-btn');

    let currentRate = 0.18; // Default to Forex rate

    const formatCurrency = (val) => {
        return '$' + Math.round(val).toLocaleString();
    };

    const updateCalculatorValues = () => {
        if (!calcAmount || !calcDuration) return;

        const amount = parseFloat(calcAmount.value);
        const durationMonths = parseInt(calcDuration.value);

        // Update sliders text headers
        calcAmountText.textContent = formatCurrency(amount);
        
        if (durationMonths === 12) {
            calcDurationText.textContent = '12 Months (1 Year)';
        } else if (durationMonths === 24) {
            calcDurationText.textContent = '24 Months (2 Years)';
        } else if (durationMonths === 36) {
            calcDurationText.textContent = '36 Months (3 Years)';
        } else {
            calcDurationText.textContent = `${durationMonths} Months`;
        }

        // Simple Returns Calculation based on rate per annum
        // compounding monthly: A = P * (1 + r/12)^n
        // Since we state "Up to 18% Returns" (annual rate), let's calculate simple or compounded returns
        // Let's do simple rate model: Returns = Amount * (Rate * Duration/12)
        const rateFactor = currentRate * (durationMonths / 12);
        const returns = amount * rateFactor;
        const total = amount + returns;
        const roi = rateFactor * 100;

        calcReturns.textContent = formatCurrency(returns);
        calcTotal.textContent = formatCurrency(total);
        calcRoi.textContent = `${roi.toFixed(2)}%`;
    };

    // Listeners for calculator inputs
    if (calcAmount && calcDuration) {
        calcAmount.addEventListener('input', updateCalculatorValues);
        calcDuration.addEventListener('input', updateCalculatorValues);
    }

    // Asset switcher handler
    assetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            assetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRate = parseFloat(btn.getAttribute('data-rate'));
            updateCalculatorValues();
        });
    });

    // Run initial calculator update
    updateCalculatorValues();


    // 5. Auth Modal System (Log In & Sign Up Panels)
    const authModal = document.getElementById('auth-modal');
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabSignupBtn = document.getElementById('tab-signup-btn');
    const formLogin = document.getElementById('form-login');
    const formSignup = document.getElementById('form-signup');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // Trigger buttons
    const btnLogin = document.getElementById('btn-login');
    const btnSignup = document.getElementById('btn-signup');
    const drawerLogin = document.getElementById('drawer-login');
    const drawerSignup = document.getElementById('drawer-signup');
    const heroCta = document.getElementById('hero-cta');
    const calcCta = document.getElementById('calc-cta');

    const openModal = (tab = 'login') => {
        if (!authModal) return;
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scrolling
        
        switchTab(tab);
    };

    const closeModal = () => {
        if (!authModal) return;
        authModal.classList.remove('active');
        document.body.style.overflow = ''; // Unlock scrolling
    };

    const switchTab = (tab) => {
        if (tab === 'login') {
            tabLoginBtn.classList.add('active');
            tabSignupBtn.classList.remove('active');
            formLogin.classList.add('active');
            formSignup.classList.remove('active');
        } else {
            tabSignupBtn.classList.add('active');
            tabLoginBtn.classList.remove('active');
            formSignup.classList.add('active');
            formLogin.classList.remove('active');
        }
    };

    // Bind triggers to modals opening
    if (btnLogin) btnLogin.addEventListener('click', () => openModal('login'));
    if (btnSignup) btnSignup.addEventListener('click', () => openModal('signup'));
    if (drawerLogin) drawerLogin.addEventListener('click', () => { closeMobileDrawer(); openModal('login'); });
    if (drawerSignup) drawerSignup.addEventListener('click', () => { closeMobileDrawer(); openModal('signup'); });
    if (heroCta) heroCta.addEventListener('click', () => openModal('signup'));
    if (calcCta) calcCta.addEventListener('click', () => openModal('signup'));

    // Bind modal controls
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) closeModal();
        });
    }

    // Bind Tab switching
    if (tabLoginBtn) tabLoginBtn.addEventListener('click', () => switchTab('login'));
    if (tabSignupBtn) tabSignupBtn.addEventListener('click', () => switchTab('signup'));

    // Mock Form Submissions
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            alert(`Welcome back! Logged in successfully as: ${email}`);
            closeModal();
        });
    }
    if (formSignup) {
        formSignup.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            alert(`Account created successfully! Welcome to Apexvest, ${name}.`);
            closeModal();
        });
    }


    // 6. Mobile Drawer Navigation System
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileClose = document.getElementById('mobile-close');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const drawerTriggers = document.querySelectorAll('.drawer-trigger');

    const openMobileDrawer = () => {
        if (!mobileDrawer || !drawerOverlay) return;
        mobileDrawer.classList.add('active');
        drawerOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeMobileDrawer = () => {
        if (!mobileDrawer || !drawerOverlay) return;
        mobileDrawer.classList.remove('active');
        drawerOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (mobileToggle) mobileToggle.addEventListener('click', openMobileDrawer);
    if (mobileClose) mobileClose.addEventListener('click', closeMobileDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeMobileDrawer);

    // Accordion functionality for drawer submenus
    drawerTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const submenu = trigger.nextElementSibling;
            const isOpen = trigger.classList.contains('active');
            
            // Close other items
            drawerTriggers.forEach(otherTrigger => {
                otherTrigger.classList.remove('active');
                if (otherTrigger.nextElementSibling) {
                    otherTrigger.nextElementSibling.classList.remove('active');
                }
            });

            // Toggle current item
            if (!isOpen && submenu) {
                trigger.classList.add('active');
                submenu.classList.add('active');
            }
        });
    });
});
