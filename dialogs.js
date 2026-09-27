// ── TaxFly — diálogos propios (reemplazo de alert()/confirm() nativos) ─────
// Usa las variables CSS de la página (--surface, --border, --primary, etc.)
// así hereda el tema de cada pantalla sin configuración extra: azul en la
// app principal, naranja en el onboarding, oscuro en profiles.
(function () {
    let overlay = null;

    function ensureStyles() {
        if (document.getElementById('tf-dialog-style')) return;
        const style = document.createElement('style');
        style.id = 'tf-dialog-style';
        style.textContent = `
            .tf-dialog-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .18s ease;}
            .tf-dialog-overlay.show{opacity:1;}
            .tf-dialog-box{background:var(--surface,#fff);border:1px solid var(--border,#e2e8f0);border-radius:var(--radius,20px);box-shadow:var(--shadow-lg,0 12px 40px rgba(0,0,0,.2));padding:22px 20px;width:100%;max-width:340px;transform:translateY(8px) scale(.98);transition:transform .18s ease;}
            .tf-dialog-overlay.show .tf-dialog-box{transform:translateY(0) scale(1);}
            .tf-dialog-msg{font-size:.88rem;font-weight:600;color:var(--text,#0f172a);line-height:1.45;white-space:pre-line;margin-bottom:18px;}
            .tf-dialog-input{width:100%;padding:12px 14px;background:var(--input-bg,#f8fafc);border:1.5px solid var(--border,#e2e8f0);border-radius:var(--radius-sm,12px);color:var(--text,#0f172a);font-family:inherit;font-size:.9rem;font-weight:600;outline:none;margin:-6px 0 16px;transition:border-color .15s;}
            .tf-dialog-input:focus{border-color:var(--primary,#2563eb);}
            .tf-dialog-actions{display:flex;gap:10px;justify-content:flex-end;}
            .tf-dialog-btn{border:none;border-radius:var(--radius-sm,12px);padding:10px 18px;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit;transition:opacity .15s;}
            .tf-dialog-btn:active{opacity:.75;}
            .tf-dialog-btn-cancel{background:var(--surface-2,#f1f5f9);color:var(--text-sub,#64748b);}
            .tf-dialog-btn-ok{background:var(--primary,#2563eb);color:#fff;}
            .tf-dialog-btn-danger{background:var(--danger,#ef4444);color:#fff;}
        `;
        document.head.appendChild(style);
    }

    function openDialog({ message, okText, cancelText, danger, withInput, inputValue, inputType, inputPlaceholder }) {
        ensureStyles();
        return new Promise((resolve) => {
            overlay = document.createElement('div');
            overlay.className = 'tf-dialog-overlay';
            overlay.innerHTML = `
                <div class="tf-dialog-box" role="alertdialog" aria-modal="true">
                    <div class="tf-dialog-msg"></div>
                    ${withInput ? `<input type="${inputType || 'text'}" class="tf-dialog-input" placeholder="${inputPlaceholder || ''}">` : ''}
                    <div class="tf-dialog-actions">
                        ${cancelText ? `<button type="button" class="tf-dialog-btn tf-dialog-btn-cancel" data-tf="cancel">${cancelText}</button>` : ''}
                        <button type="button" class="tf-dialog-btn ${danger ? 'tf-dialog-btn-danger' : 'tf-dialog-btn-ok'}" data-tf="ok">${okText}</button>
                    </div>
                </div>`;
            overlay.querySelector('.tf-dialog-msg').textContent = message;
            document.body.appendChild(overlay);
            requestAnimationFrame(() => overlay.classList.add('show'));

            const inputEl = withInput ? overlay.querySelector('.tf-dialog-input') : null;
            if (inputEl) {
                inputEl.value = inputValue || '';
                setTimeout(() => { inputEl.focus(); inputEl.select(); }, 180);
            }

            const close = (result) => {
                overlay.classList.remove('show');
                setTimeout(() => overlay.remove(), 160);
                document.removeEventListener('keydown', onKey);
                resolve(withInput ? (result ? inputEl.value : null) : result);
            };
            const onKey = (e) => {
                if (e.key === 'Escape') close(false);
                if (e.key === 'Enter') close(true);
            };
            document.addEventListener('keydown', onKey);
            overlay.querySelector('[data-tf="ok"]').addEventListener('click', () => close(true));
            const cancelBtn = overlay.querySelector('[data-tf="cancel"]');
            if (cancelBtn) cancelBtn.addEventListener('click', () => close(false));
            overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
        });
    }

    // Reemplazo de alert(): mismo uso (showAlert('mensaje')), no bloquea el
    // hilo (a diferencia del alert nativo) pero eso no afecta ningún caso de
    // uso existente en la app, ya que siempre iba seguido de un simple return.
    window.showAlert = function (message) {
        return openDialog({ message, okText: 'OK' });
    };

    // Reemplazo de confirm(): usarlo con await, ej:
    // if (!(await showConfirm('¿Seguro?'))) return;
    window.showConfirm = function (message, opts = {}) {
        return openDialog({
            message,
            okText: opts.okText || 'Confirmar',
            cancelText: opts.cancelText || 'Cancelar',
            danger: !!opts.danger,
        });
    };
    // Reemplazo de prompt(): usarlo con await, ej:
    // const email = await showPrompt('Nuevo correo:'); if (!email) return;
    // Devuelve el texto ingresado, o null si cancelan (igual que prompt()).
    window.showPrompt = function (message, defaultValue = '', opts = {}) {
        return openDialog({
            message,
            okText: opts.okText || 'Aceptar',
            cancelText: opts.cancelText || 'Cancelar',
            withInput: true,
            inputValue: defaultValue,
            inputType: opts.inputType || 'text',
            inputPlaceholder: opts.placeholder || '',
        });
    };
})();
