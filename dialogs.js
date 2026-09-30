(function() {
  let overlay = null;
  function ensureStyles() {
    if (document.getElementById("tf-dialog-style")) return;
    const style = document.createElement("style");
    style.id = "tf-dialog-style";
    style.textContent = `\n            .tf-dialog-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .18s ease;}\n            .tf-dialog-overlay.show{opacity:1;}\n            .tf-dialog-box{background:var(--surface,#fff);border:1px solid var(--border,#e2e8f0);border-radius:var(--radius,20px);box-shadow:var(--shadow-lg,0 12px 40px rgba(0,0,0,.2));padding:22px 20px;width:100%;max-width:340px;max-height:calc(100vh - 40px);overflow-y:auto;-webkit-overflow-scrolling:touch;transform:translateY(8px) scale(.98);transition:transform .18s ease;}\n            .tf-dialog-overlay.show .tf-dialog-box{transform:translateY(0) scale(1);}\n            .tf-dialog-msg{font-size:.88rem;font-weight:600;color:var(--text,#0f172a);line-height:1.45;white-space:pre-line;margin-bottom:18px;}\n            .tf-dialog-actions{display:flex;gap:10px;justify-content:flex-end;}\n            .tf-dialog-btn{border:none;border-radius:var(--radius-sm,12px);padding:10px 18px;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit;transition:opacity .15s;}\n            .tf-dialog-btn:active{opacity:.75;}\n            .tf-dialog-btn-cancel{background:var(--surface-2,#f1f5f9);color:var(--text-sub,#64748b);}\n            .tf-dialog-btn-ok{background:var(--primary,#2563eb);color:#fff;}\n            .tf-dialog-btn-danger{background:var(--danger,#ef4444);color:#fff;}\n        `;
    document.head.appendChild(style);
  }
  window.tfEnsureDialogStyles = ensureStyles;
  function openDialog({message: message, okText: okText, cancelText: cancelText, danger: danger}) {
    ensureStyles();
    return new Promise(resolve => {
      overlay = document.createElement("div");
      overlay.className = "tf-dialog-overlay";
      overlay.innerHTML = `\n                <div class="tf-dialog-box" role="alertdialog" aria-modal="true">\n                    <div class="tf-dialog-msg"></div>\n                    <div class="tf-dialog-actions">\n                        ${cancelText ? `<button type="button" class="tf-dialog-btn tf-dialog-btn-cancel" data-tf="cancel">${cancelText}</button>` : ""}\n                        <button type="button" class="tf-dialog-btn ${danger ? "tf-dialog-btn-danger" : "tf-dialog-btn-ok"}" data-tf="ok">${okText}</button>\n                    </div>\n                </div>`;
      overlay.querySelector(".tf-dialog-msg").textContent = message;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add("show"));
      const close = result => {
        overlay.classList.remove("show");
        setTimeout(() => overlay.remove(), 160);
        document.removeEventListener("keydown", onKey);
        resolve(result);
      };
      const onKey = e => {
        if (e.key === "Escape") close(false);
        if (e.key === "Enter") close(true);
      };
      document.addEventListener("keydown", onKey);
      overlay.querySelector('[data-tf="ok"]').addEventListener("click", () => close(true));
      const cancelBtn = overlay.querySelector('[data-tf="cancel"]');
      if (cancelBtn) cancelBtn.addEventListener("click", () => close(false));
      overlay.addEventListener("click", e => {
        if (e.target === overlay) close(false);
      });
    });
  }
  window.showAlert = function(message) {
    return openDialog({
      message: message,
      okText: "OK"
    });
  };
  window.showConfirm = function(message, opts = {}) {
    return openDialog({
      message: message,
      okText: opts.okText || "Confirmar",
      cancelText: opts.cancelText || "Cancelar",
      danger: !!opts.danger
    });
  };
})();