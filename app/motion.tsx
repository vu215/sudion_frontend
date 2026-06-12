"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

function showRevealNodeImmediately(node: HTMLElement) {
  node.classList.add("is-visible", "reveal-complete");
}

export function MotionEffects() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    const previousScrollRestoration = history.scrollRestoration;
    const scrollStorageKey = "studion-scroll-y";
    const navEntry = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming | undefined;
    const shouldRestoreScroll = navEntry?.type === "reload";
    const savedScrollY = shouldRestoreScroll
      ? Number(sessionStorage.getItem(scrollStorageKey) || "0")
      : 0;
    const restoreTimers: number[] = [];

    history.scrollRestoration = "manual";
    root.style.scrollBehavior = "auto";

    const saveScrollPosition = () => {
      sessionStorage.setItem(scrollStorageKey, String(window.scrollY));
      document
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach(showRevealNodeImmediately);
    };

    const restoreScrollPosition = () => {
      if (!shouldRestoreScroll || savedScrollY <= 0) {
        return;
      }

      window.scrollTo({ top: savedScrollY, left: 0, behavior: "auto" });
    };

    restoreScrollPosition();
    requestAnimationFrame(restoreScrollPosition);
    restoreTimers.push(
      window.setTimeout(restoreScrollPosition, 120),
      window.setTimeout(restoreScrollPosition, 360),
      window.setTimeout(() => {
        root.style.scrollBehavior = previousScrollBehavior;
      }, 520),
    );

    window.addEventListener("pagehide", saveScrollPosition);
    window.addEventListener("beforeunload", saveScrollPosition);

    return () => {
      restoreTimers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("pagehide", saveScrollPosition);
      window.removeEventListener("beforeunload", saveScrollPosition);
      history.scrollRestoration = previousScrollRestoration;
      root.style.scrollBehavior = previousScrollBehavior;
    };
  }, []);

  useEffect(() => {
    // --- Scroll Reveal Observer ---
    const fallbackTimers: number[] = [];
    const observedRevealNodes = new Set<HTMLElement>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealNode(entry.target as HTMLElement);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );

    const revealNode = (node: HTMLElement) => {
      requestAnimationFrame(() => {
        node.getBoundingClientRect();
        requestAnimationFrame(() => {
          node.classList.add("is-visible");
        });
      });
      observer.unobserve(node);
    };

    const getRevealNodes = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    const prepareRevealNode = (node: HTMLElement) => {
      if (observedRevealNodes.has(node)) {
        return;
      }

      node.classList.remove("is-visible", "reveal-complete");

      node.addEventListener(
        "transitionend",
        () => {
          node.classList.add("reveal-complete");
        },
        { once: true },
      );
      observer.observe(node);
      observedRevealNodes.add(node);
    };

    const revealVisibleNodes = () => {
      getRevealNodes().forEach((node) => {
        if (node.classList.contains("is-visible")) {
          return;
        }

        const rect = node.getBoundingClientRect();
        const isInViewport =
          rect.top < window.innerHeight * 1.2 && rect.bottom > -120;

        if (isInViewport) {
          revealNode(node);
        }
      });
    };

    const syncRevealNodes = () => {
      getRevealNodes().forEach(prepareRevealNode);
      revealVisibleNodes();
    };

    const onPageShow = () => {
      requestAnimationFrame(syncRevealNodes);
      fallbackTimers.push(window.setTimeout(syncRevealNodes, 80));
    };

    syncRevealNodes();
    requestAnimationFrame(syncRevealNodes);
    fallbackTimers.push(
      window.setTimeout(syncRevealNodes, 80),
      window.setTimeout(syncRevealNodes, 240),
      window.setTimeout(syncRevealNodes, 600),
    );
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("resize", revealVisibleNodes);

    // --- Mouse Tilt / Parallax on [data-tilt] ---
    const tiltNodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-tilt]"),
    );

    const cleanups = tiltNodes.map((node) => {
      const onMove = (event: PointerEvent) => {
        const rect = node.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        node.style.setProperty("--mx", x.toFixed(3));
        node.style.setProperty("--my", y.toFixed(3));
        node.classList.add("is-hovering");
      };

      const onLeave = () => {
        node.style.setProperty("--mx", "0");
        node.style.setProperty("--my", "0");
        node.classList.remove("is-hovering");
      };

      node.addEventListener("pointermove", onMove);
      node.addEventListener("pointerleave", onLeave);

      return () => {
        node.removeEventListener("pointermove", onMove);
        node.removeEventListener("pointerleave", onLeave);
      };
    });

    return () => {
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      fallbackTimers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("resize", revealVisibleNodes);
    };
  }, [pathname]);

  return null;
}
