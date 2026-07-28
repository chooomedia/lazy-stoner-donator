/**
 * logoMarquee.js
 *
 * Infinite logo marquee for the brand strip on the wishlist landing page.
 * The markup only contains a single `.logo-marquee__group`; this module
 * clones it once so the track can loop seamlessly, then drives the loop via
 * the Web Animations API (pause on hover, drag to scrub, reduced-motion
 * aware).
 */
(() => {
  const init = () => {
    const wrapper = document.querySelector(".logo-marquee__track-wrapper");
    const track = document.querySelector(".logo-marquee__track");
    const group = track ? track.querySelector(".logo-marquee__group") : null;

    if (!wrapper || !track || !group || typeof track.animate !== "function")
      return;

    if (track.querySelectorAll(".logo-marquee__group").length === 1) {
      track.appendChild(group.cloneNode(true));
    }

    track.querySelectorAll("img").forEach((image) => {
      image.draggable = false;
      image.addEventListener("dragstart", (event) => {
        event.preventDefault();
      });
    });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animation = null;
    let pixelsPerMs = 0;
    let activePointerId = null;
    let pressX = 0;
    let pressY = 0;
    let startTime = 0;
    let dragging = false;

    const parseDurationToMs = (value) => {
      const trimmed = value.trim();
      if (trimmed.endsWith("ms")) return Number.parseFloat(trimmed);
      if (trimmed.endsWith("s")) return Number.parseFloat(trimmed) * 1000;
      return 90000;
    };

    const buildAnimation = () => {
      const distance = group.getBoundingClientRect().width;
      if (!distance || reduceMotion.matches) return;

      const durationMs = parseDurationToMs(
        getComputedStyle(wrapper).getPropertyValue("--logo-marquee-duration") ||
          "90s",
      );
      const progress = animation
        ? ((animation.currentTime || 0) %
            animation.effect.getTiming().duration) /
          animation.effect.getTiming().duration
        : 0;

      pixelsPerMs = distance / durationMs;

      if (animation) animation.cancel();
      track.style.animation = "none";
      animation = track.animate(
        [
          { transform: "translate3d(0, 0, 0)" },
          { transform: `translate3d(-${distance}px, 0, 0)` },
        ],
        {
          duration: durationMs,
          iterations: Number.POSITIVE_INFINITY,
          easing: "linear",
        },
      );
      animation.currentTime = progress * durationMs;
      animation.play();
    };

    const pauseAnimation = () => {
      if (!reduceMotion.matches && animation) animation.pause();
    };

    const playAnimation = () => {
      if (!reduceMotion.matches && !dragging && animation) animation.play();
    };

    const finishInteraction = (pointerId) => {
      if (activePointerId !== pointerId) return;
      activePointerId = null;
      dragging = false;
      wrapper.classList.remove("is-dragging");
      playAnimation();
    };

    buildAnimation();

    wrapper.addEventListener("mouseenter", pauseAnimation);
    wrapper.addEventListener("mouseleave", playAnimation);

    wrapper.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      activePointerId = event.pointerId;
      pressX = event.clientX;
      pressY = event.clientY;
      startTime = (animation && animation.currentTime) || 0;
      dragging = false;
      if (wrapper.setPointerCapture) wrapper.setPointerCapture(event.pointerId);
      pauseAnimation();
    });

    wrapper.addEventListener("pointermove", (event) => {
      if (event.pointerId !== activePointerId || !animation) return;

      const deltaX = event.clientX - pressX;
      const deltaY = event.clientY - pressY;

      if (!dragging) {
        if (Math.abs(deltaX) < 6) return;
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          finishInteraction(event.pointerId);
          return;
        }
        dragging = true;
        wrapper.classList.add("is-dragging");
      }

      event.preventDefault();
      const duration = animation.effect.getTiming().duration;
      const nextTime = startTime - deltaX / pixelsPerMs;
      animation.currentTime = ((nextTime % duration) + duration) % duration;
    });

    wrapper.addEventListener("pointerup", (event) => {
      if (wrapper.releasePointerCapture)
        wrapper.releasePointerCapture(event.pointerId);
      finishInteraction(event.pointerId);
    });

    wrapper.addEventListener("pointercancel", (event) => {
      if (wrapper.releasePointerCapture)
        wrapper.releasePointerCapture(event.pointerId);
      finishInteraction(event.pointerId);
    });

    window.addEventListener("resize", buildAnimation);
    if (reduceMotion.addEventListener)
      reduceMotion.addEventListener("change", buildAnimation);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
