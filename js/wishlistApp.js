/**
 * wishlistApp.js
 *
 * Bootstrap for the wishlist landing page: loads content + product JSON
 * (with file:// fallbacks via the wishlist*Data.js globals), applies the
 * localized copy, renders cards progressively, wires the status filters,
 * the featured-card mosaic, hash-scrolling and the footer docking offset.
 *
 * Extracted from index.html - application logic lives in js/, markup in HTML.
 * Hardcoded strings are last-resort fallbacks only; visible copy comes from
 * wishlist-content(.en).json via window.WishlistUi.
 */

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('wishlist-grid');
    const status = document.getElementById('wishlist-status');
    const cardStack = new CardStack(grid, {
        itemClassName: 'wishlist-card'
    });

    async function loadJson(path, fallback) {
        if (window.location.protocol === 'file:' && typeof fallback !== 'undefined') {
            return fallback;
        }

        try {
            const response = await fetch(path, {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(path + (locale === 'en' ? ' could not be loaded.' : ' konnte nicht geladen werden.'));
            }

            return await response.json();
        } catch (error) {
            if (fallback) {
                return fallback;
            }
            throw error;
        }
    }

    const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
    let activeFilter = 'all';
    let visibleProducts = [];
    let activeObserver = null;
    const locale = window.WishlistUi.resolveInitialLocale();
    let wishlistContent = window.WishlistUi.fallbackForLocale(locale);

    function currentHashId() {
        return decodeURIComponent((window.location.hash || '').replace(/^#/, '').trim());
    }

    function hasCardHashTarget() {
        return Boolean(currentHashId());
    }

    function scrollToHashTarget(behavior = 'auto') {
        const targetId = currentHashId();
        if (!targetId) {
            return false;
        }

        const targetCard = document.getElementById(targetId);
        if (!targetCard) {
            return false;
        }

        window.requestAnimationFrame(() => {
            targetCard.scrollIntoView({
                behavior,
                block: 'start'
            });
        });

        return true;
    }

    async function loadWishlistContent() {
        return loadJson(
            window.WishlistUi.contentPathForLocale(locale),
            window.WishlistUi.fallbackForLocale(locale)
        );
    }

    async function loadWishlistProducts() {
        return loadJson(
            window.WishlistUi.productPathForLocale(locale),
            window.WishlistUi.productFallbackForLocale(locale)
        );
    }

    function applyWishlistContent(content) {
        wishlistContent = window.WishlistUi.applyWishlistContent(content || wishlistContent);
        return wishlistContent;
    }

    const footer = document.querySelector('.site-footer');
    let footerFrame = null;
    const updateFooterVisibility = () => {
        if (!footer) {
            return;
        }

        const footerTop = footer.getBoundingClientRect().top;
        const footerOverlap = Math.max(0, window.innerHeight - footerTop);

        document.documentElement.style.setProperty('--wishlist-toolbar-footer-offset', `${footerOverlap}px`);
        document.body.classList.toggle('is-footer-visible', footerOverlap > 0);
    };

    const requestFooterVisibilityUpdate = () => {
        if (footerFrame) {
            return;
        }

        footerFrame = window.requestAnimationFrame(() => {
            footerFrame = null;
            updateFooterVisibility();
        });
    };

    if (footer && 'IntersectionObserver' in window) {
        const footerObserver = new IntersectionObserver(() => {
            requestFooterVisibilityUpdate();
        }, {
            threshold: 0.08
        });
        footerObserver.observe(footer);
    }
    window.addEventListener('scroll', requestFooterVisibilityUpdate, { passive: true });
    window.addEventListener('resize', requestFooterVisibilityUpdate);
    updateFooterVisibility();

    function arrangeProductsForMosaic(products) {
        if (activeFilter === 'gifted') {
            return products;
        }

        const featuredProducts = products.filter((product) => product.displayTier === 'featured');
        const standardProducts = products.filter((product) => product.displayTier !== 'featured');
        const arrangedProducts = [];
        let standardIndex = 0;

        const getStandardGap = (featuredIndex) => {
            if (featuredIndex === 0) {
                return 2;
            }

            if (featuredIndex === 1) {
                return 4;
            }

            return Math.min(6 + ((featuredIndex - 2) * 2), 10);
        };

        featuredProducts.forEach((featuredProduct, featuredIndex) => {
            const standardGap = getStandardGap(featuredIndex);
            const nextStandards = standardProducts.slice(standardIndex, standardIndex + standardGap);
            standardIndex += nextStandards.length;

            if (featuredIndex % 2 === 0) {
                arrangedProducts.push(featuredProduct);
                arrangedProducts.push(...nextStandards);
                return;
            }

            arrangedProducts.push(...nextStandards.slice(0, 1));
            arrangedProducts.push(featuredProduct);
            arrangedProducts.push(...nextStandards.slice(1));
        });

        return arrangedProducts.concat(standardProducts.slice(standardIndex));
    }

    function getFilteredProducts() {
        if (activeFilter === 'gifted') {
            return visibleProducts.filter((product) => product.status === 'gifted');
        }

        if (activeFilter === 'wishlist') {
            return arrangeProductsForMosaic(visibleProducts.filter((product) => product.status !== 'gifted'));
        }

        return arrangeProductsForMosaic(visibleProducts);
    }

    function getStatusText(rendered, total) {
        if (total === 0) {
            return (wishlistContent.wishlist && wishlistContent.wishlist.empty) || (locale === 'en' ? 'No matching wishes found.' : 'Keine passenden Wünsche gefunden.');
        }

        if (rendered < total) {
            const template = (wishlistContent.wishlist && wishlistContent.wishlist.statusProgress) || (locale === 'en' ? '{rendered} of {total}' : '{rendered} von {total}');
            return template.replace('{rendered}', rendered).replace('{total}', total);
        }

        if (activeFilter === 'gifted') {
            const template = (wishlistContent.wishlist && wishlistContent.wishlist.statusGifted) || (locale === 'en' ? '{count} gifted' : '{count} gekauft');
            return template.replace('{count}', total);
        }

        if (activeFilter === 'wishlist') {
            const template = (wishlistContent.wishlist && wishlistContent.wishlist.statusOpen) || (locale === 'en' ? '{count} open' : '{count} offen');
            return template.replace('{count}', total);
        }

        const template = (wishlistContent.wishlist && wishlistContent.wishlist.statusAll) || (locale === 'en' ? '{count} wishes' : '{count} Wünsche');
        return template.replace('{count}', total);
    }

    function updateFilterCounts() {
        const counts = {
            all: visibleProducts.length,
            wishlist: visibleProducts.filter((product) => product.status !== 'gifted').length,
            gifted: visibleProducts.filter((product) => product.status === 'gifted').length
        };

        filterButtons.forEach((button, index) => {
            const count = counts[button.dataset.filter];
            const titleBase = ((wishlistContent.wishlist && wishlistContent.wishlist.filterTitles) || [])[index]
                || button.dataset.titleBase
                || button.getAttribute('title')
                || '';

            button.dataset.count = typeof count === 'number' ? String(count) : '';
            button.dataset.titleBase = titleBase;

            if (titleBase && typeof count === 'number') {
                const labelWithCount = `${titleBase} (${count})`;
                button.setAttribute('title', labelWithCount);
                button.setAttribute('aria-label', labelWithCount);
            }
        });
    }

    function resetGrid() {
        if (activeObserver) {
            activeObserver.disconnect();
            activeObserver = null;
        }

        cardStack.cards = [];
        grid.textContent = '';

        let sentinel = document.getElementById('wishlist-sentinel');
        if (!sentinel) {
            sentinel = document.createElement('div');
            sentinel.id = 'wishlist-sentinel';
            sentinel.className = 'wishlist-sentinel';
            sentinel.setAttribute('aria-hidden', 'true');
            grid.insertAdjacentElement('afterend', sentinel);
        }

        return sentinel;
    }

    function renderProductsProgressively(products) {
        const sentinel = resetGrid();
        const batchSize = (window.matchMedia('(max-width: 768px)').matches || hasCardHashTarget()) ? 999 : 12;
        let rendered = 0;

        function renderNextBatch() {
            const nextProducts = products.slice(rendered, rendered + batchSize);

            nextProducts.forEach((product) => {
                cardStack.addCard(new AdCard(product));
            });

            rendered += nextProducts.length;
            status.textContent = getStatusText(rendered, products.length);

            if (rendered >= products.length && sentinel) {
                sentinel.remove();
            }

            requestFooterVisibilityUpdate();

            if (hasCardHashTarget()) {
                scrollToHashTarget(rendered > batchSize ? 'smooth' : 'auto');
            }
        }

        renderNextBatch();

        if (!sentinel || !('IntersectionObserver' in window)) {
            while (rendered < products.length) {
                renderNextBatch();
            }
            return;
        }

        activeObserver = new IntersectionObserver((entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) {
                return;
            }

            renderNextBatch();

            if (rendered >= products.length) {
                activeObserver.disconnect();
                activeObserver = null;
            }
        }, {
            rootMargin: '720px 0px'
        });

        activeObserver.observe(sentinel);
    }

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            activeFilter = button.dataset.filter;
            filterButtons.forEach((filterButton) => {
                const isActive = filterButton === button;
                filterButton.classList.toggle('is-active', isActive);
                filterButton.setAttribute('aria-pressed', String(isActive));
            });
            renderProductsProgressively(getFilteredProducts());
        });
    });

    window.addEventListener('hashchange', () => {
        if (!scrollToHashTarget('smooth')) {
            renderProductsProgressively(getFilteredProducts());
            window.setTimeout(() => {
                scrollToHashTarget('smooth');
            }, 60);
        }
    });

    async function getProducts() {
        try {
            applyWishlistContent(await loadWishlistContent());
            const products = await loadWishlistProducts();
            const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
            visibleProducts = products.filter((product) => {
                if (!product.title || !product.image || !product.url) {
                    return false;
                }
                if (product.mobileOnly && !isMobileViewport) {
                    return false;
                }
                return true;
            });
            updateFilterCounts();

            renderProductsProgressively(getFilteredProducts());

            status.classList.add('is-success');
        } catch (error) {
            status.textContent = (wishlistContent.wishlist && wishlistContent.wishlist.error) || (locale === 'en' ? 'The wishlist is unavailable right now. Please try again later.' : 'Die Wunschliste ist gerade nicht erreichbar. Probier es bitte später noch einmal.');
            status.classList.add('is-error');
            console.error(error);
        }
    }

    getProducts();
});
