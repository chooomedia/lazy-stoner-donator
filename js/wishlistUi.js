(function (window, document) {
    'use strict';

    const LOCALE_STORAGE_KEY = 'lsd-locale';

    function currentPath() {
        return window.location.pathname || '/';
    }

    function normalizedPath() {
        return currentPath().replace(/\/+$/, '') || '/';
    }

    function isFileProtocol() {
        return window.location.protocol === 'file:';
    }

    function isEnglishPath(path) {
        return path === '/en' || path.startsWith('/en/') || /\/en\/index\.html$/i.test(path);
    }

    function detectLocale() {
        const path = normalizedPath();
        if (isEnglishPath(path)) {
            return 'en';
        }
        return 'de';
    }

    function getStoredLocale() {
        try {
            const locale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
            return locale === 'de' || locale === 'en' ? locale : null;
        } catch (error) {
            return null;
        }
    }

    function setStoredLocale(locale) {
        if (locale !== 'de' && locale !== 'en') {
            return;
        }
        try {
            window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
        } catch (error) {
            // Ignore storage failures in private mode or restricted contexts.
        }
    }

    function isDefaultEntryPath(path) {
        return path === '/' || path === '/index.html' || /\/index\.html$/i.test(path);
    }

    function localePath(locale) {
        if (isFileProtocol()) {
            return locale === 'en' ? 'en/index.html' : '../index.html';
        }
        return locale === 'en' ? '/en/' : '/';
    }

    function resolveLocaleHref(locale) {
        if (isFileProtocol()) {
            return detectLocale() === 'en'
                ? (locale === 'en' ? 'index.html' : '../index.html')
                : (locale === 'en' ? 'en/index.html' : 'index.html');
        }
        return locale === 'en' ? '/en/' : '/';
    }

    function resolveInitialLocale() {
        const activeLocale = detectLocale();
        const storedLocale = getStoredLocale();

        if (activeLocale === 'de' && storedLocale === 'en' && isDefaultEntryPath(normalizedPath())) {
            const target = resolveLocaleHref('en') + window.location.search + window.location.hash;
            window.location.replace(target);
        }

        return activeLocale;
    }

    function localPrefix() {
        return detectLocale() === 'en' ? '../' : '';
    }

    function resolveLocalPath(relativePath) {
        return localPrefix() + String(relativePath || '').replace(/^\/+/, '');
    }

    function setMetaBySelector(selector, attribute, value) {
        if (!value) {
            return;
        }
        const node = document.querySelector(selector);
        if (node) {
            node.setAttribute(attribute, value);
        }
    }

    function setMetaName(name, value) {
        setMetaBySelector('meta[name="' + name + '"]', 'content', value);
    }

    function setMetaProperty(property, value) {
        setMetaBySelector('meta[property="' + property + '"]', 'content', value);
    }

    function applySeo(content) {
        const seo = content.seo || {};
        if (seo.documentTitle) {
            document.title = seo.documentTitle;
        }
        setMetaName('description', seo.metaDescription);
        setMetaName('keywords', seo.keywords);
        setMetaProperty('og:title', seo.ogTitle || seo.documentTitle);
        setMetaProperty('og:description', seo.ogDescription || seo.metaDescription);
        setMetaProperty('og:url', seo.canonical);
        setMetaProperty('og:locale', seo.ogLocale);
        setMetaProperty('og:site_name', seo.siteName);
        setMetaProperty('og:image:alt', seo.ogImageAlt);
        setMetaName('twitter:title', seo.twitterTitle || seo.documentTitle);
        setMetaName('twitter:description', seo.twitterDescription || seo.metaDescription);
        setMetaName('twitter:image:alt', seo.twitterImageAlt || seo.ogImageAlt);

        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical && seo.canonical) {
            canonical.setAttribute('href', seo.canonical);
        }

        const schema = document.getElementById('wishlist-schema');
        if (schema) {
            try {
                const data = JSON.parse(schema.textContent);
                if (seo.jsonLdWebPageName) {
                    data.name = seo.jsonLdWebPageName;
                }
                if (seo.jsonLdWebPageDescription) {
                    data.description = seo.jsonLdWebPageDescription;
                }
                if (seo.canonical) {
                    data['@id'] = seo.canonical.replace(/\/?$/, '/') + '#webpage';
                }
                if (content.language) {
                    data.inLanguage = content.language;
                }
                schema.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                console.error(error);
            }
        }
    }

    function applyWishlistContent(content) {
        window.birthdayWishlistContent = content || window.birthdayWishlistContent || {};
        const data = window.birthdayWishlistContent;
        const hero = data.hero || {};
        const wishlist = data.wishlist || {};
        const footer = data.footer || {};
        const a11y = data.a11y || {};
        const i18n = data.i18n || {};
        const filters = wishlist.filters || [];
        const filterTitles = wishlist.filterTitles || [];

        document.documentElement.lang = (data.language || 'de-DE').split('-')[0];
        document.documentElement.dir = data.dir || 'ltr';
        document.documentElement.dataset.locale = data.locale || detectLocale();

        applySeo(data);

        const skipLink = document.querySelector('.skip-link');
        if (skipLink && a11y.skipLink) {
            skipLink.textContent = a11y.skipLink;
        }

        const mainNav = document.querySelector('.site-nav');
        if (mainNav && a11y.mainNav) {
            mainNav.setAttribute('aria-label', a11y.mainNav);
        }

        const brand = document.querySelector('.brand');
        if (brand) {
            if (a11y.brandAria) {
                brand.setAttribute('aria-label', a11y.brandAria);
            }
            if (a11y.brandTitle) {
                brand.setAttribute('title', a11y.brandTitle);
            }
        }

        const navCta = document.querySelector('.nav-cta');
        if (navCta) {
            navCta.textContent = hero.navCta || hero.primaryCta || navCta.textContent;
            navCta.setAttribute('title', hero.navCtaTitle || hero.primaryCtaTitle || navCta.textContent);
        }

        const heroEyebrow = document.querySelector('.hero .eyebrow');
        if (heroEyebrow) {
            heroEyebrow.textContent = hero.eyebrow || heroEyebrow.textContent;
        }

        const heroTitle = document.getElementById('hero-title');
        if (heroTitle && hero.title) {
            heroTitle.textContent = hero.title;
        }

        const heroText = document.querySelector('.hero-copy > p:not(.eyebrow)');
        if (heroText && hero.text) {
            heroText.textContent = hero.text;
        }

        const heroActions = document.querySelector('.hero-actions');
        if (heroActions && a11y.heroActions) {
            heroActions.setAttribute('aria-label', a11y.heroActions);
        }

        const primaryHero = document.querySelector('.hero-actions .button-primary');
        if (primaryHero) {
            primaryHero.textContent = hero.primaryCta || primaryHero.textContent;
            primaryHero.setAttribute('title', hero.primaryCtaTitle || hero.primaryCta || primaryHero.textContent);
        }

        const secondaryHeroLabel = document.querySelector('.hero-actions .button-secondary span');
        const secondaryHero = document.querySelector('.hero-actions .button-secondary');
        if (secondaryHeroLabel) {
            secondaryHeroLabel.textContent = hero.secondaryCta || secondaryHeroLabel.textContent;
        }
        if (secondaryHero) {
            secondaryHero.setAttribute('title', hero.secondaryCtaTitle || hero.secondaryCta || secondaryHero.getAttribute('title') || '');
        }

        const wishlistEyebrow = document.querySelector('.wishlist-section .eyebrow');
        if (wishlistEyebrow) {
            wishlistEyebrow.textContent = wishlist.eyebrow || wishlistEyebrow.textContent;
        }

        const wishlistTitle = document.getElementById('wishlist-title');
        if (wishlistTitle && wishlist.title) {
            wishlistTitle.textContent = wishlist.title;
        }

        const status = document.getElementById('wishlist-status');
        if (status) {
            status.textContent = wishlist.loading || status.textContent;
        }

        const toolbar = document.querySelector('.wishlist-toolbar');
        if (toolbar && a11y.wishlistToolbar) {
            toolbar.setAttribute('aria-label', a11y.wishlistToolbar);
        }

        const filterGroup = document.querySelector('.wishlist-filters');
        if (filterGroup && a11y.wishlistFilters) {
            filterGroup.setAttribute('aria-label', a11y.wishlistFilters);
        }

        document.querySelectorAll('[data-filter]').forEach((button, index) => {
            const label = filters[index];
            const labelElement = button.querySelector('span');
            if (label && labelElement) {
                labelElement.textContent = label;
            }
            if (filterTitles[index]) {
                button.setAttribute('title', filterTitles[index]);
                button.setAttribute('aria-label', filterTitles[index]);
            }
        });

        const footerRoot = document.querySelector('.site-footer');
        if (footerRoot && a11y.footer) {
            footerRoot.setAttribute('aria-label', a11y.footer);
        }

        const footerLinksWrap = document.querySelector('.footer-links');
        if (footerLinksWrap && a11y.footerLinks) {
            footerLinksWrap.setAttribute('aria-label', a11y.footerLinks);
        }

        document.querySelectorAll('.footer-links a').forEach((link, index) => {
            if (footer.links && footer.links[index]) {
                link.textContent = footer.links[index];
            }
            if (footer.linkTitles && footer.linkTitles[index]) {
                link.setAttribute('title', footer.linkTitles[index]);
            }
            if (footer.linkUrls && footer.linkUrls[index]) {
                link.setAttribute('href', footer.linkUrls[index]);
            }
        });

        const footerSocial = document.querySelector('.footer-social');
        if (footerSocial && a11y.footerSocial) {
            footerSocial.setAttribute('aria-label', a11y.footerSocial);
        }

        document.querySelectorAll('.footer-social a').forEach((link, index) => {
            if (footer.socialTitles && footer.socialTitles[index]) {
                link.setAttribute('title', footer.socialTitles[index]);
            }
            if (footer.socialArias && footer.socialArias[index]) {
                link.setAttribute('aria-label', footer.socialArias[index]);
            }
        });

        const footerAi = document.querySelector('.footer-ai-link');
        if (footerAi && footer.aiContentTitle) {
            footerAi.setAttribute('title', footer.aiContentTitle);
        }

        const credit = document.querySelector('.footer-credit');
        const creditImage = credit ? credit.querySelector('img') : null;
        if (credit && creditImage) {
            credit.textContent = (footer.creditText || 'Realized with 🥦 and 💚 by') + ' ';
            creditImage.alt = footer.creditAlt || 'Matt Interfaces';
            creditImage.title = footer.creditTitle || 'Matt Interfaces - Web Development & Automation';
            credit.appendChild(creditImage);
        }

        const switcher = document.querySelector('.language-switcher');
        if (switcher) {
            if (a11y.languageNav) {
                switcher.setAttribute('aria-label', a11y.languageNav);
            }
            const current = switcher.querySelector('[data-i18n-current]');
            const alternate = switcher.querySelector('[data-i18n-alternate]');
            const currentCode = String(i18n.hreflangSelf || data.locale || 'de').toUpperCase();
            const alternateCode = String(i18n.hreflangAlternate || (currentCode === 'DE' ? 'en' : 'de')).toUpperCase();
            if (current) {
                current.textContent = currentCode;
                current.setAttribute('aria-current', 'page');
                current.setAttribute('title', i18n.currentLabel || currentCode);
                current.setAttribute('aria-label', i18n.currentLabel || currentCode);
                current.setAttribute('lang', i18n.hreflangSelf || data.locale || 'de');
            }
            if (alternate) {
                alternate.textContent = alternateCode;
                alternate.setAttribute('href', resolveLocaleHref(i18n.hreflangAlternate || 'en'));
                alternate.setAttribute('hreflang', i18n.hreflangAlternate || alternate.getAttribute('hreflang'));
                alternate.setAttribute('title', i18n.alternateLabel || alternateCode);
                alternate.setAttribute('aria-label', i18n.alternateLabel || alternateCode);
                alternate.setAttribute('lang', i18n.hreflangAlternate || 'en');
                if (!alternate.dataset.localeBound) {
                    alternate.addEventListener('click', () => {
                        setStoredLocale(i18n.hreflangAlternate || 'en');
                    });
                    alternate.dataset.localeBound = 'true';
                }
            }
        }

        return data;
    }

    function contentPathForLocale(locale) {
        return resolveLocalPath(locale === 'en' ? 'wishlist-content.en.json' : 'wishlist-content.json');
    }

    function productPathForLocale(locale) {
        return resolveLocalPath(locale === 'en' ? 'wishlist-products.en.json' : 'wishlist-products.json');
    }

    function fallbackForLocale(locale) {
        if (locale === 'en') {
            return window.birthdayWishlistContentEn || window.birthdayWishlistContent || {};
        }
        return window.birthdayWishlistContent || {};
    }

    function productFallbackForLocale(locale) {
        if (locale === 'en') {
            return window.birthdayWishlistProductsEn || window.birthdayWishlistProducts || [];
        }
        return window.birthdayWishlistProducts || [];
    }

    window.WishlistUi = {
        detectLocale: detectLocale,
        resolveInitialLocale: resolveInitialLocale,
        applyWishlistContent: applyWishlistContent,
        contentPathForLocale: contentPathForLocale,
        fallbackForLocale: fallbackForLocale,
        productPathForLocale: productPathForLocale,
        productFallbackForLocale: productFallbackForLocale,
        localePath: localePath,
        resolveLocalPath: resolveLocalPath
    };
}(window, document));
