(function (window, document) {
    'use strict';

    const MOBILE_BREAKPOINT = '(max-width: 768px)';

    function setupMobileFeed() {
        const mobileQuery = window.matchMedia(MOBILE_BREAKPOINT);
        const hero = document.querySelector('.hero');
        const grid = document.getElementById('wishlist-grid');
        const status = document.getElementById('wishlist-status');
        const body = document.body;
        let initialResetPending = mobileQuery.matches && !window.location.hash;

        if (!body) {
            return;
        }

        let heroObserver = null;
        let cardObserver = null;
        let gridObserver = null;

        const resetToHeroStart = () => {
            if (!mobileQuery.matches || window.location.hash) {
                return;
            }

            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'manual';
            }

            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        };

        const getCards = () => {
            if (!grid) {
                return [];
            }

            return Array.from(grid.querySelectorAll('.wishlist-card'));
        };

        const updateCounter = (activeCard) => {
            if (!mobileQuery.matches || !status) {
                return;
            }

            const cards = getCards();
            if (!cards.length) {
                return;
            }

            const activeIndex = Math.max(0, cards.indexOf(activeCard));
            status.textContent = `${activeIndex + 1} / ${cards.length}`;
            status.classList.remove('is-success', 'is-error');
        };

        const observeCards = () => {
            if (cardObserver) {
                cardObserver.disconnect();
                cardObserver = null;
            }

            if (!mobileQuery.matches || !grid || !status || !('IntersectionObserver' in window)) {
                return;
            }

            const cards = getCards();
            if (!cards.length) {
                return;
            }

            cardObserver = new IntersectionObserver((entries) => {
                const visibleEntries = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio);

                if (!visibleEntries.length) {
                    return;
                }

                updateCounter(visibleEntries[0].target);
            }, {
                threshold: [0.55, 0.72, 0.9]
            });

            cards.forEach((card) => {
                cardObserver.observe(card);
            });

            updateCounter(cards[0]);
        };

        const cleanup = () => {
            if (heroObserver) {
                heroObserver.disconnect();
                heroObserver = null;
            }
            if (cardObserver) {
                cardObserver.disconnect();
                cardObserver = null;
            }
            if (gridObserver) {
                gridObserver.disconnect();
                gridObserver = null;
            }
            body.classList.remove('is-mobile-feed-scrolled');
            body.classList.toggle('has-mobile-feed', mobileQuery.matches);
        };

        const bind = () => {
            cleanup();

            if (mobileQuery.matches && initialResetPending) {
                window.requestAnimationFrame(resetToHeroStart);
                initialResetPending = false;
            }

            if (!mobileQuery.matches || !hero || !('IntersectionObserver' in window)) {
                return;
            }

            heroObserver = new IntersectionObserver((entries) => {
                const [entry] = entries;
                const heroMostlyVisible = entry.isIntersecting && entry.intersectionRatio >= 0.55;
                body.classList.toggle('is-mobile-feed-scrolled', !heroMostlyVisible);
            }, {
                threshold: [0, 0.25, 0.55, 0.8, 1]
            });

            heroObserver.observe(hero);

            if (grid && 'MutationObserver' in window) {
                gridObserver = new MutationObserver(() => {
                    observeCards();
                });
                gridObserver.observe(grid, { childList: true });
            }

            observeCards();
        };

        bind();
        window.addEventListener('load', resetToHeroStart);
        window.addEventListener('pageshow', resetToHeroStart);
        if (typeof mobileQuery.addEventListener === 'function') {
            mobileQuery.addEventListener('change', bind);
        } else if (typeof mobileQuery.addListener === 'function') {
            mobileQuery.addListener(bind);
        }
    }

    document.addEventListener('DOMContentLoaded', setupMobileFeed);
}(window, document));
