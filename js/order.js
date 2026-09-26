/* ============================================
   FENBO · КОНСТРУКТОР ЗАКАЗА
   ============================================ */

(function order() {
    const orderModal = document.getElementById('orderModal');
    if (!orderModal) return;

    /* --- Элементы --- */
    const orderClose    = document.getElementById('orderClose');
    const orderSubmit   = document.getElementById('orderSubmit');
    const orderTotalEl  = document.getElementById('orderTotal');
    const orderTotalUsdtEl = document.getElementById('orderTotalUsdt');
    const orderDescEl   = document.getElementById('orderDesc');
    const charCountEl   = document.getElementById('charCount');
    const orderContent  = document.getElementById('orderContent');
    const orderReceipt  = document.getElementById('orderReceipt');
    const orderAuthorEl = document.getElementById('orderAuthor');
    const refAdd        = document.getElementById('refAdd');
    const orderRefsEl   = document.getElementById('orderRefs');
    const charNumEl     = document.getElementById('charNum');
    const charMultEl    = document.getElementById('charMult');
    const charMinus     = document.getElementById('charMinus');
    const charPlus      = document.getElementById('charPlus');
    const tipCustom     = document.getElementById('tipCustom');
    const contactInput  = document.getElementById('contactInput');

    /* --- Состояние --- */
    let selectedTotal   = 0;
    let charCount       = 1;
    let charMultiplier  = 1;
    let tipValue        = 0;
    let refCount        = 0;

    /* Текущий автор — забираем из lightbox.js */
    /* window.currentAuthor уже объявлен там */

    /* --- Пересчёт итога --- */
    function recalcTotal() {
        let base = 0;
        document.querySelectorAll('.order-option.checked').forEach(o => {
            base += parseInt(o.dataset.price, 10) || 0;
        });

        const totalBase = Math.round(base * charMultiplier);
        const tip = parseInt(tipCustom.value, 10) || tipValue || 0;

        selectedTotal = totalBase + tip;
        orderTotalEl.textContent = selectedTotal.toLocaleString('ru-RU');
        orderTotalUsdtEl.textContent = (selectedTotal / 100).toFixed(2);

        /* Кнопка активна, если выбрана хотя бы одна опция */
        const hasAny = document.querySelectorAll('.order-option.checked').length > 0;
        orderSubmit.disabled = !hasAny;
    }

    /* --- Клики по опциям --- */
    document.querySelectorAll('.order-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const group = opt.parentElement.dataset.group;
            /* В группах стиль/формат/детализация — только один активный */
            if (group === 'style' || group === 'format' || group === 'detail') {
                opt.parentElement.querySelectorAll('.order-option').forEach(o => o.classList.remove('checked'));
                opt.classList.add('checked');
            } else {
                /* В группе "extra" — можно много */
                opt.classList.toggle('checked');
            }
            recalcTotal();
        });
    });

    /* --- Счётчик персонажей --- */
    function updateCharMult() {
        charNumEl.textContent = charCount;
        if (charCount === 1) {
            charMultiplier = 1;
            charMultEl.textContent = 'Базовая цена';
            charMultEl.style.color = 'rgba(197, 160, 89, 0.85)';
        } else if (charCount === 2) {
            charMultiplier = 1.7;
            charMultEl.textContent = '+70% к стоимости';
            charMultEl.style.color = '#FF4444';
        } else {
            charMultiplier = 1.7 + (charCount - 2) * 0.5;
            charMultEl.textContent = '+' + Math.round((charMultiplier - 1) * 100) + '% к стоимости';
            charMultEl.style.color = '#FF4444';
        }
        charMinus.disabled = charCount <= 1;
        recalcTotal();
    }

    charPlus.addEventListener('click', () => {
        if (charCount < 10) { charCount++; updateCharMult(); }
    });
    charMinus.addEventListener('click', () => {
        if (charCount > 1) { charCount--; updateCharMult(); }
    });

    /* --- Чаевые --- */
    document.querySelectorAll('.tip-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.tip-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            tipValue = parseInt(opt.dataset.tip, 10) || 0;
            tipCustom.value = '';
            recalcTotal();
        });
    });
    tipCustom.addEventListener('input', () => {
        const val = parseInt(tipCustom.value, 10);
        if (!isNaN(val) && val > 0) {
            document.querySelectorAll('.tip-option').forEach(o => o.classList.remove('active'));
            tipValue = val;
        } else {
            tipValue = 0;
        }
        recalcTotal();
    });

    /* --- Платформа связи --- */
    document.querySelectorAll('.platform-opt').forEach(p => {
        p.addEventListener('click', () => {
            document.querySelectorAll('.platform-opt').forEach(x => x.classList.remove('active'));
            p.classList.add('active');
        });
    });

    /* --- Счётчик символов --- */
    orderDescEl.addEventListener('input', () => {
        charCountEl.textContent = orderDescEl.value.length;
    });

    /* --- Референсы --- */
    refAdd.addEventListener('click', () => {
        if (refCount >= 5) { alert('Максимум 5 референсов'); return; }
        refCount++;
        const ref = document.createElement('div');
        ref.className = 'order-ref';
        ref.innerHTML = '❦<span class="ref-num">' + refCount + '/5</span>';
        orderRefsEl.insertBefore(ref, refAdd);
    });

    /* --- Открытие окна заказа --- */
    const lbOrder = document.getElementById('lbOrder');
    if (lbOrder) {
        lbOrder.addEventListener('click', e => {
            e.stopPropagation();
            orderAuthorEl.textContent = window.currentAuthor || 'Velvet_Rose';

            /* Сброс формы */
            document.querySelectorAll('.order-option').forEach(o => o.classList.remove('checked'));
            document.querySelectorAll('.tip-option').forEach(o => o.classList.remove('active'));
            const firstTip = document.querySelector('.tip-option[data-tip="0"]');
            if (firstTip) firstTip.classList.add('active');
            tipValue = 0;
            tipCustom.value = '';
            charCount = 1;
            updateCharMult();
            orderDescEl.value = '';
            charCountEl.textContent = '0';
            refCount = 0;
            document.querySelectorAll('.order-ref').forEach(r => r.remove());
            contactInput.value = '';

            /* Показываем форму, скрываем чек */
            orderContent.style.display = 'flex';
            if (orderReceipt) orderReceipt.classList.remove('active');

            /* Закрываем лайтбокс, открываем модалку */
            if (window.closeLightbox) window.closeLightbox();
            orderModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    /* --- Закрытие --- */
    function closeOrder() {
        orderModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    window.closeOrder = closeOrder;

    orderClose.addEventListener('click', closeOrder);
    orderModal.addEventListener('click', e => {
        if (e.target === orderModal) closeOrder();
    });

    /* --- Универсальный Esc --- */
    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        if (orderModal.classList.contains('active')) {
            closeOrder();
        } else if (window.closeLightbox && document.getElementById('lightbox') &&
                   document.getElementById('lightbox').classList.contains('active')) {
            window.closeLightbox();
        }
    });

    /* --- Инициализация --- */
    updateCharMult();
})();
