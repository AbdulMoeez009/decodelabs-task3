export function createModalA11y() {
  const lastFocused = new WeakMap();

  function trapFocus(event, modal) {
    if (event.key !== 'Tab') return;
    const focusables = [...modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')];
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function open(modal, onEscape) {
    modal.setAttribute('aria-hidden', 'false');
    lastFocused.set(modal, document.activeElement);
    const firstFocusable = modal.querySelector('.modal-card button, .modal-card [href], .modal-card input');
    setTimeout(() => firstFocusable?.focus(), 50);
    const keyHandler = event => {
      if (event.key === 'Escape') onEscape();
      else trapFocus(event, modal);
    };
    modal._keyHandler = keyHandler;
    document.addEventListener('keydown', keyHandler);
  }

  function close(modal) {
    modal.setAttribute('aria-hidden', 'true');
    if (modal._keyHandler) document.removeEventListener('keydown', modal._keyHandler);
    lastFocused.get(modal)?.focus();
  }

  return { open, close };
}