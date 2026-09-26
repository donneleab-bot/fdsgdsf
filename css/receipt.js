/* ============================================
   FENBO · ГЕНЕРАЦИЯ ЧЕКА
   ============================================ */

(function receipt() {
    const receiptItems      = document.getElementById('receiptItems');
    if (!receiptItems) return; // нет чека на странице — не запускаем

    const orderSubmit       = document.getElementById('orderSubmit');
    const orderContent      = document.getElementById('orderContent');
    const orderReceipt      = document.getElementById('orderReceipt');
    const orderAuthorEl     = document.getElementById('orderAuthor');
    const contactInput      = document.getElementById('contactInput');
    const tipCustom         = document.getElementById('tipCustom');

    const receiptOrderNum   = document.getElementById('receiptOrderNum');
    const receiptDate       = document.getElementById('receiptDate');
    const receiptTime       = document.getElementById('receiptTime');
    const receiptArtist     = document.getElementById('receiptArtist');
    const receiptContact    = document.getElementById('receiptContact');
    const receiptTotal      = document.getElementById('receiptTotal');
    const receiptTotalUsdt  = document.getElementById('receiptTotalUsdt');
    const receiptBars       = document.getElementById('receiptBars');
    const receiptBarcodeNum = document.getElementById('receiptBarcodeNum');
    const receiptPrint      = document.getElementById('receiptPrint');
    const receiptClose      = document.getElementById('receiptClose');

    /* --- Номер заказа --- */
    function generateOrderNumber() {
        return 'FEN-' + Math.floor(Math.random() * 9000 + 1000);
    }
    function pad(n) { return n < 10 ? '0' + n : n; }

    /* --- Штрих-код (из полосок) --- */
    function buildBarcode(seed) {
        receiptBars.innerHTML = '';
        const types = ['', 'thin', 'wide'];
        for (let i = 0; i < 42; i++) {
            const bar = document.createElement('div');
            bar.className = 'bar ' + (types[(seed + i) % 3] || '');
            receiptBars.appendChild(bar);
        }
    }

    /* --- Сформировать чек при клике на «Оформить заказ» --- */
    orderSubmit.addEventListener('click', () => {
        /* Забираем итог из order.js — он лежит в глобальном selectedTotal
           Но чтобы не зависеть от порядка, посчитаем заново */

        let subtotal = 0;
        document.querySelectorAll('.order-option.checked').forEach(o => {
            subtotal += parseInt(o.dataset.price, 10) || 0;
        });

        const charNumEl = document.getElementById('charNum');
        const charCount = parseInt(charNumEl ? charNumEl.textContent : '1', 10) || 1;

        let charMultiplier = 1;
        if (charCount === 2) charMultiplier = 1.7;
        else if (charCount > 2) charMultiplier = 1.7 + (charCount - 2) * 0.5;

        const totalBase = Math.round(subtotal * charMultiplier);
        const tipVal = parseInt(tipCustom.value, 10) || 0;
        const selectedTotal = totalBase + tipVal;

        if (selectedTotal === 0) return;

        /* Заполняем шапку */
        const orderNum = generateOrderNumber();
        const now = new Date();
        const dateStr = pad(now.getDate()) + '.' + pad(now.getMonth() + 1) + '.' + now.getFullYear();
        const timeStr = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());

        receiptOrderNum.textContent = orderNum;
        receiptDate.textContent = dateStr;
        receiptTime.textContent = timeStr;
        receiptArtist.textContent = orderAuthorEl.textContent;
        receiptContact.textContent = contactInput.value.trim() || '—';

        /* Заполняем позиции */
        receiptItems.innerHTML = '';

        document.querySelectorAll('.order-option.checked').forEach(o => {
            const price = parseInt(o.dataset.price, 10) || 0;
            const name = o.querySelector('.opt-name').textContent;
            const descEl = o.querySelector('.opt-desc');
            const desc = descEl ? descEl.textContent : '';

            const item = document.createElement('div');
            item.className = 'receipt-item';
            item.innerHTML =
                '<div class="item-label">' + name +
                    (desc ? '<span class="item-extra">' + desc + '</span>' : '') +
                '</div>' +
                '<div class="item-price">' + price.toLocaleString('ru-RU') + ' FEN</div>';
            receiptItems.appendChild(item);
        });

        if (charMultiplier !== 1) {
            const multItem = document.createElement('div');
            multItem.className = 'receipt-item';
            multItem.innerHTML =
                '<div class="item-label">Множитель персонажей' +
                    '<span class="item-extra">×' + charMultiplier.toFixed(1) + ' (' + charCount + ' персонажа)</span>' +
                '</div>' +
                '<div class="item-price">+' +
                    Math.round((subtotal * charMultiplier) - subtotal).toLocaleString('ru-RU') +
                ' FEN</div>';
            receiptItems.appendChild(multItem);
        }

        if (tipVal > 0) {
            const tipItem = document.createElement('div');
            tipItem.className = 'receipt-item';
            tipItem.innerHTML =
                '<div class="item-label">Чаевые автору</div>' +
                '<div class="item-price">+' + tipVal.toLocaleString('ru-RU') + ' FEN</div>';
            receiptItems.appendChild(tipItem);
        }

        receiptTotal.textContent = selectedTotal.toLocaleString('ru-RU');
        receiptTotalUsdt.textContent = (selectedTotal / 100).toFixed(2);

        /* Штрих-код */
        const seed = parseInt(orderNum.replace(/\D/g, ''), 10) || 1234;
        buildBarcode(seed);
        receiptBarcodeNum.textContent = String(seed).padStart(16, '0').replace(/(\d{4})(?=\d)/g, '$1 ');

        /* Показываем чек, скрываем форму */
        orderContent.style.display = 'none';
        orderReceipt.classList.add('active');
    });

    /* --- Печать чека --- */
    receiptPrint.addEventListener('click', () => {
        const paper = document.getElementById('receiptPaper');
        const w = window.open('', '', 'width=600,height=900');
        w.document.write(`
            <html><head><title>Чек FENBO</title>
            <style>
                body { margin: 0; padding: 20px; background: #fff; }
                .receipt-edge { display: none; }
                .receipt-paper { max-width: 420px; margin: 0 auto; background: #F4E9D2; color: #2B1A0A; padding: 30px; border-radius: 4px; box-shadow: 0 0 0 1px #ccc; font-family: 'Courier New', monospace; position: relative; }
                .receipt-logo { font-family: serif; font-size: 1.6rem; color: #8B0000; text-align: center; letter-spacing: 8px; font-weight: 900; }
                .receipt-script { text-align: center; font-style: italic; color: #B8860B; font-size: 1.2rem; margin-top: -4px; }
                .receipt-sub { text-align: center; font-size: 0.65rem; letter-spacing: 5px; color: #888; margin-top: 6px; }
                .receipt-order-num { text-align: center; font-size: 0.85rem; color: #8B0000; margin: 10px auto 14px; padding: 6px 12px; border: 1px solid #ddd; display: table; }
                .receipt-rule { height: 1px; background: repeating-linear-gradient(90deg, #999 0 6px, transparent 6px 12px); margin: 14px 0; }
                .receipt-info .row { display: flex; justify-content: space-between; font-size: 0.72rem; margin: 3px 0; }
                .receipt-items { margin: 8px 0; }
                .receipt-item { display: flex; justify-content: space-between; font-size: 0.74rem; padding: 5px 0; border-bottom: 1px dotted #ccc; }
                .item-extra { display: block; font-size: 0.6rem; color: #999; font-style: italic; }
                .item-price { color: #8B0000; font-weight: 700; }
                .receipt-total-block { display: flex; justify-content: space-between; padding: 10px 0; margin: 6px 0; }
                .receipt-total-label { font-weight: 900; letter-spacing: 4px; }
                .receipt-total-value { font-size: 1.3rem; color: #8B0000; font-weight: 900; text-align: right; }
                .usdt-small { font-size: 0.72rem; color: #26A17B; display: block; font-weight: 400; }
                .receipt-payment { display: flex; gap: 6px; justify-content: center; margin: 10px 0; }
                .pay-badge { font-size: 0.6rem; padding: 4px 10px; border: 1px solid #ccc; border-radius: 3px; }
                .pay-badge.active { background: #8B0000; color: #fff; border-color: #8B0000; }
                .pay-badge.paid { background: #1F7A4D; color: #fff; border-color: #1F7A4D; }
                .receipt-barcode { text-align: center; margin: 12px 0; }
                .bars { display: flex; gap: 2px; justify-content: center; height: 38px; }
                .bar { width: 3px; background: #2B1A0A; }
                .bar.thin { width: 1px; }
                .bar.wide { width: 5px; }
                .barcode-num { font-size: 0.6rem; letter-spacing: 4px; color: #888; margin-top: 4px; }
                .receipt-qr-row { display: flex; gap: 14px; justify-content: center; align-items: center; margin: 12px 0; }
                .qr-box { width: 60px; height: 60px; background: #fff; border: 1px solid #999; padding: 5px; }
                .qr-grid { width: 100%; height: 100%; background-image: linear-gradient(90deg, #2B1A0A 25%, transparent 25% 50%, #2B1A0A 50% 75%, transparent 75%), linear-gradient(0deg, #2B1A0A 20%, transparent 20% 40%, #2B1A0A 40% 60%, transparent 60% 80%, #2B1A0A 80%); background-size: 12px 12px; }
                .qr-hint { font-size: 0.65rem; color: #888; font-style: italic; }
                .receipt-footer { text-align: center; font-size: 0.62rem; color: #888; font-style: italic; margin-top: 12px; }
                .hearts { font-size: 0.75rem; letter-spacing: 4px; color: #8B0000; margin-top: 5px; }
                .receipt-stamp { position: absolute; right: 8px; bottom: 40px; width: 120px; height: 120px; transform: rotate(-14deg); opacity: 0.9; }
                .receipt-stamp svg { width: 100%; height: 100%; }
                .stamp-ring-outer { fill: none; stroke: #B01818; stroke-width: 4; }
                .stamp-ring-inner { fill: none; stroke: #B01818; stroke-width: 1.6; }
                .stamp-text { font-family: serif; font-size: 10px; letter-spacing: 2.2px; fill: #B01818; font-weight: 700; }
                .stamp-rabbit ellipse, .stamp-rabbit circle, .stamp-rabbit path { fill: #B01818; }
                .stamp-rabbit .ear-inner, .stamp-rabbit .eye, .stamp-rabbit .nose { fill: #F4E9D2; }
                .stamp-rabbit .whisker { stroke: #F4E9D2; stroke-width: 1.2; fill: none; }
                .stamp-word { font-family: serif; font-size: 13px; font-weight: 900; fill: #B01818; letter-spacing: 3px; text-anchor: middle; }
            </style></head><body>
            ${paper.outerHTML}
            </body></html>
        `);
        w.document.close();
        w.focus();
        setTimeout(() => w.print(), 300);
    });

    /* --- Возврат к галерее --- */
    receiptClose.addEventListener('click', () => {
        orderReceipt.classList.remove('active');
        if (window.closeOrder) window.closeOrder();
    });
})();
