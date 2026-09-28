/* Avoid browser-saved personal information suggestions in TaxFly's app fields.
   Login is deliberately excluded so password managers keep working. */
(() => {
  if (/\/login\.html$/i.test(location.pathname)) return;

  const fields = 'input:not([type="password"]):not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea';

  function disableAutofill(root) {
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    if (root.matches("form")) root.autocomplete = "off";
    if (root.matches(fields) && !root.hasAttribute("autocomplete")) root.autocomplete = "off";
    root.querySelectorAll("form").forEach(element => { element.autocomplete = "off"; });
    root.querySelectorAll(fields).forEach(element => {
      if (!element.hasAttribute("autocomplete")) element.autocomplete = "off";
    });
  }

  function init() {
    disableAutofill(document.body);
    new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(disableAutofill));
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
