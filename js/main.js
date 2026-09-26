/* ============================================
   FENBO · MAIN (общий скрипт для всех страниц)
   ============================================ */

/* --- Золотая пыль (главная страница) --- */
(function spawnDust() {
    const container = document.getElementById('goldDust');
    if (!container) return;

    const PARTICLE_COUNT = 60;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = document.createElement('div');
        p.className = 'particle';

        const size = Math.random() * 3 + 1.5;
        p.style.width = size + 'px';
        p.style.height = size + 'px';

        p.style.left = (Math.random() * 100) + '%';
        p.style.bottom = (Math.random() * 40) + '%';

        p.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
        p.style.setProperty('--dy', -(Math.random() * 100 + 60) + 'px');
        p.style.setProperty('--dx2', (Math.random() * 120 - 60) + 'px');
        p.style.setProperty('--dy2', -(Math.random() * 200 + 140) + 'px');

        p.style.animationDelay = (Math.random() * 8) + 's';
        p.style.animationDuration = (Math.random() * 6 + 7) + 's';

        container.appendChild(p);
    }
})();

/* --- Фоновая пыль на остальных страницах (мелкие светящиеся точки) --- */
(function dustBg() {
    const c = document.getElementById('dustBg');
    if (!c) return;
    for (let i = 0; i < 25; i++) {
        const m = document.createElement('div');
        m.className = 'mote';
        const s = Math.random() * 2.5 + 1;
        m.style.width = s + 'px';
        m.style.height = s + 'px';
        m.style.left = (Math.random() * 100) + '%';
        m.style.bottom = '-10px';
        m.style.setProperty('--mx', (Math.random() * 80 - 40) + 'px');
        m.style.animationDuration = (Math.random() * 12 + 15) + 's';
        m.style.animationDelay = (Math.random() * 15) + 's';
        c.appendChild(m);
    }
})();

/* --- Переворот боковых карт на главной --- */
(function flipSideCards() {
    document.querySelectorAll('.side-card').forEach(card => {
        let clickTimes = [];

        card.addEventListener('click', () => {
            const now = Date.now();
            clickTimes.push(now);
            clickTimes = clickTimes.filter(t => now - t < 2000);

            card.classList.toggle('flipped');

            if (clickTimes.length > 3) {
                card.classList.add('fast');
                clearTimeout(card._fastTimer);
                card._fastTimer = setTimeout(() => {
                    card.classList.remove('fast');
                }, 1500);
            }
        });
    });
})();

/* --- Кошелёк: открытие/закрытие дропдауна --- */
(function wallet() {
    const walletBtn = document.getElementById('walletBtn');
    const walletDropdown = document.getElementById('walletDropdown');
    if (!walletBtn || !walletDropdown) return;

    walletBtn.addEventListener('click', e => {
        e.stopPropagation();
        walletDropdown.classList.toggle('active');
    });

    document.addEventListener('click', e => {
        if (!walletDropdown.contains(e.target) && !walletBtn.contains(e.target)) {
            walletDropdown.classList.remove('active');
        }
    });

    /* Клик по пакету фишек */
    document.querySelectorAll('.pkg').forEach(pkg => {
        pkg.addEventListener('click', () => {
            alert(`Пакет: ${pkg.dataset.chips} фишек FENBO\nОплата: ${pkg.dataset.usdt} USDT\nКурс: 1 USDT = 100 фишек`);
        });
    });

    /* Выбор сети USDT */
    document.querySelectorAll('.method').forEach(m => {
        m.addEventListener('click', () => {
            document.querySelectorAll('.method').forEach(x => x.classList.remove('active'));
            m.classList.add('active');
        });
    });

    /* Кнопка «Пополнить» */
    const depositBtn = document.getElementById('depositBtn');
    if (depositBtn) {
        depositBtn.addEventListener('click', () => {
            const active = document.querySelector('.method.active');
            const net = active ? active.textContent : 'TRC-20';
            alert(`Пополнение через USDT (${net})\n\nКурс: 1 USDT = 100 фишек FENBO`);
        });
    }
})();
