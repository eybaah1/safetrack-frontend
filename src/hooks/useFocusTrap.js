import { useEffect } from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isFocusable(element) {
  if (!element) return false;
  if (element.hasAttribute('disabled')) return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;
  const style = window.getComputedStyle(element);
  if (style.visibility === 'hidden' || style.display === 'none') return false;
  if (element.getClientRects().length === 0) return false;
  return true;
}

function getFocusableElements(container) {
  if (!container) return [];
  const elements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS));
  return elements.filter(isFocusable);
}

export default function useFocusTrap({
  enabled,
  containerRef,
  initialFocusRef,
  restoreFocus = true,
}) {
  useEffect(() => {
    if (!enabled) return;
    const container = containerRef?.current;
    if (!container) return;

    const previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusInitial = () => {
      const preferred = initialFocusRef?.current;
      if (preferred instanceof HTMLElement && isFocusable(preferred)) {
        preferred.focus();
        return;
      }

      const focusables = getFocusableElements(container);
      if (focusables.length > 0) focusables[0].focus();
      else container.focus();
    };

    // Ensure container can receive focus if it has no focusable children.
    if (!container.hasAttribute('tabindex')) {
      container.setAttribute('tabindex', '-1');
    }

    // Focus on next frame so DOM is fully painted.
    const raf = window.requestAnimationFrame(focusInitial);

    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return;
      const focusables = getFocusableElements(container);
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown, true);
      if (restoreFocus && previousActive && document.contains(previousActive)) {
        previousActive.focus();
      }
    };
  }, [enabled, containerRef, initialFocusRef, restoreFocus]);
}

