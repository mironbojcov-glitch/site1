import { animate } from "framer-motion";

let stopActiveScroll: (() => void) | null = null;

export function smoothScrollTo(
  el: HTMLElement,
  offset = 80,
  reduceMotion = false,
): Promise<void> {
  stopActiveScroll?.();

  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";

  const from = window.scrollY;
  const to = el.getBoundingClientRect().top + window.scrollY - offset;

  return new Promise((resolve) => {
    let settled = false;
    let listenerTimer: number | undefined;
    let controls: ReturnType<typeof animate>;

    const cleanup = () => {
      if (listenerTimer !== undefined) window.clearTimeout(listenerTimer);
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("keydown", onKeyDown);
      root.style.scrollBehavior = previousScrollBehavior;
      if (stopActiveScroll === stop) stopActiveScroll = null;
    };

    const finish = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };

    const interrupt = () => {
      controls.stop();
      finish();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const interrupts = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", " "].includes(event.key);
      if (interrupts) {
        interrupt();
      } else if (!settled) {
        window.addEventListener("keydown", onKeyDown, { passive: true, once: true });
      }
    };

    const stop = () => {
      controls.stop();
      finish();
    };

    controls = animate(from, to, {
      duration: reduceMotion ? 0.6 : 1.2,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (value) => window.scrollTo(0, value),
      onComplete: finish,
    });

    stopActiveScroll = stop;
    listenerTimer = window.setTimeout(() => {
      if (settled) return;
      window.addEventListener("wheel", interrupt, { passive: true, once: true });
      window.addEventListener("touchstart", interrupt, { passive: true, once: true });
      window.addEventListener("keydown", onKeyDown, { passive: true, once: true });
    }, 100);
  });
}
