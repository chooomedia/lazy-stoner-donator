class AdCard extends Card {
    constructor(cardOptions = {}) {
        super({ className: 'wishlist-card' });

        this.adHost = cardOptions.host || 'amazon';
        this.partnerId = cardOptions.partner || 'cann4chris-21';
        this.adId = cardOptions.adId;
        this.title = cardOptions.title || 'Amazon Wunsch';
        this.status = cardOptions.status;
        this.image = cardOptions.image;
        this.imageFallback = cardOptions.imageFallback;
        this.imageAlt = cardOptions.imageAlt;
        this.imageTitle = cardOptions.imageTitle;
        this.price = cardOptions.price;
        this.byline = cardOptions.byline;
        this.audienceLabel = cardOptions.audienceLabel;
        this.ctaLabel = cardOptions.ctaLabel;
        this.displayTier = cardOptions.displayTier;
        this.featureReason = cardOptions.featureReason;
        this.productUrl = cardOptions.url || this.createProductUrl(this.adId);
        this.content = window.birthdayWishlistContent || {};
        const cardContent = this.content.card || {};
        this.statusLabel = cardOptions.statusLabel || cardContent.giftedLabel || 'Schon geschenkt';
        this.statusMeta = cardOptions.statusMeta || cardContent.giftedMeta || 'Danke fürs Möglichmachen';

        this.domElement.id = this.adId;
        this.domElement.setAttribute('data-asin', this.adId);
        if (this.displayTier === 'featured') {
            this.domElement.classList.add('is-featured');
        }
        this.domElement.appendChild(this.createCard());

        AdCard.bindShareMenuEvents();
    }

    static bindShareMenuEvents() {
        if (AdCard.shareMenuEventsBound) {
            return;
        }

        document.addEventListener('click', (event) => {
            if (event.target.closest('.product-share')) {
                return;
            }

            AdCard.closeOpenShareMenus();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                AdCard.closeOpenShareMenus();
            }
        });

        AdCard.shareMenuEventsBound = true;
    }

    static closeOpenShareMenus() {
        document.querySelectorAll('.product-share.is-open').forEach((wrapper) => {
            wrapper.classList.remove('is-open');
            const button = wrapper.querySelector('button[aria-expanded]');
            if (button) {
                button.setAttribute('aria-expanded', 'false');
            }
            AdCard.setShareMenuAccessibility(wrapper, false);
        });
    }

    static setShareMenuAccessibility(wrapper, isOpen) {
        const menu = wrapper.querySelector('.product-share-menu');
        if (!menu) {
            return;
        }

        menu.setAttribute('aria-hidden', String(!isOpen));
        menu.querySelectorAll('a, button').forEach((item) => {
            item.tabIndex = isOpen ? 0 : -1;
        });
    }

    createProductUrl(adId) {
        return 'https://www.amazon.de/dp/' + adId + '/ref=nosim?tag=' + this.partnerId;
    }

    createCardShareUrl() {
        const shareUrl = new URL(window.location.href);
        shareUrl.hash = this.adId || '';
        return shareUrl.toString();
    }

    getBrandName() {
        if (!this.byline) {
            return '';
        }

        return this.byline
            .replace(/^Visit the\s+/i, '')
            .replace(/^Besuche den\s+/i, '')
            .replace(/-Store$/i, '')
            .replace(/\s+Store$/i, '')
            .trim();
    }

    getStableVariantIndex(length) {
        const source = String(this.adId || this.title);
        let hash = 0;

        for (let index = 0; index < source.length; index += 1) {
            hash = ((hash << 5) - hash) + source.charCodeAt(index);
            hash |= 0;
        }

        return Math.abs(hash) % length;
    }

    getPrimaryActionLabel() {
        const cardContent = this.content.card || {};

        if (this.ctaLabel) {
            return this.ctaLabel;
        }

        if (this.status === 'gifted') {
            return cardContent.giftedAction || 'Details ansehen';
        }

        const variants = cardContent.primaryActionVariants || [
            'Für Chris checken',
            'Zum Wunsch',
            'Direkt ansehen',
            'Setup-Upgrade ansehen',
            'Bei {brand} ansehen',
            'Gute Idee öffnen',
            'Wunsch öffnen'
        ];
        const brandName = this.getBrandName();
        const usableVariants = brandName ? variants : variants.filter((variant) => !variant.includes('{brand}'));
        const chosenVariant = usableVariants[this.getStableVariantIndex(usableVariants.length)] || cardContent.primaryAction || 'Direkt ansehen';

        return chosenVariant.replace('{brand}', brandName);
    }

    getAudienceLabel() {
        if (this.audienceLabel) {
            return this.audienceLabel;
        }

        const isEnglish = this.content && this.content.locale === 'en';
        const label = (deLabel, enLabel) => (isEnglish ? enLabel : deLabel);
        const title = this.title.toLowerCase();
        const matches = (terms) => terms.some((term) => title.includes(term));

        if (matches(['smallrig', 'cage', 'rig', 'anamorphotisch', 'objektiv', 'stabilisator', 'quick release'])) {
            return label('Für mobiles Creator-Setup', 'For a mobile creator setup');
        }

        if (matches(['prompter', 'stream deck', 'capture card', 'key light', 'softbox', 'elgato'])) {
            return label('Für Stream, Video & Workflow', 'For stream, video & workflow');
        }

        if (matches(['ssd', 'speicher', 'festplatte', 'usb-c', 'hub', 'dock', 'monitor'])) {
            return label('Für ein schnelleres Setup', 'For a faster setup');
        }

        if (matches(['kamera', 'video', 'creator', 'vlog', 'foto', 'fotodrucker', 'sony alpha', 'osmo pocket', 'dji'])) {
            return label('Für bessere Aufnahmen', 'For better recordings');
        }

        if (matches(['mikro', 'micro', 'rode', 'røde', 'shure', 'focusrite', 'zoom', 'audio'])) {
            return label('Für sauberen Content-Sound', 'For clean content audio');
        }

        if (matches(['3d', 'laser', 'schrauber', 'tool', 'werkzeug', 'leatherman', 'lego', 'stickmaschine', 'scan', 'maker', 'solar'])) {
            return label('Für Maker-Projekte', 'For maker projects');
        }

        if (matches(['grow', 'pflanz', 'boveda', 'hygrometer', 'sensor', 'ventilator', 'vaporizer', 'volcano', 'venty', 'ph-messgerät'])) {
            return label('Für Grow, Genuss & Pflege', 'For grow, enjoyment & care');
        }

        if (matches(['buch', 'geschichte', 'kunst des krieges', 'homo deus', 'arousal'])) {
            return label('Für neue Perspektiven', 'For new perspectives');
        }

        if (matches(['rucksack', 'filter', 'katadyn', 'schnorchel', 'pavillon', 'outdoor', 'vaude', 'iridium'])) {
            return label('Für unterwegs & draußen', 'For travel & outdoors');
        }

        if (matches(['synth', 'stylophone', 'ukulele', 'pa-system'])) {
            return label('Für Studio & Soundideen', 'For studio & sound ideas');
        }

        if (matches(['kaffee', 'cold brew', 'becher', 'flasche', 'uhr', 'licht', 'lampe'])) {
            return label('Für Alltag mit Mehrwert', 'For better everyday life');
        }

        return label('Passt gut zu Chris', 'A good fit for Chris');
    }

    hasAiAssistedImage() {
        return ['social-wish', 'campaign-wish', 'donation-wish'].includes(this.adHost);
    }

    resolveAssetPath(path) {
        if (!path) {
            return path;
        }

        if (/^(?:[a-z]+:)?\/\//i.test(path) || /^(?:data|blob):/i.test(path)) {
            return path;
        }

        const normalizedPath = String(path).replace(/^\.\/+/, '').replace(/^\/+/, '');
        return window.WishlistUi.resolveLocalPath(normalizedPath);
    }

    createCard() {
        const article = document.createElement('article');
        article.className = 'product-card';
        if (this.status === 'gifted') {
            article.classList.add('is-gifted');
        }
        if (this.displayTier === 'featured') {
            article.classList.add('is-featured');
        }
        if (this.hasAiAssistedImage()) {
            article.classList.add('is-social-wish');
        }

        const mediaLink = document.createElement('a');
        mediaLink.className = 'product-media';
        mediaLink.href = this.productUrl;
        mediaLink.target = '_blank';
        mediaLink.rel = 'noopener noreferrer sponsored';
        const cardContent = this.content.card || {};
        const mediaAriaTemplate = cardContent.mediaAria || '{action}: {title}';
        const mediaAction = this.ctaLabel || this.getPrimaryActionLabel();
        mediaLink.setAttribute(
            'aria-label',
            mediaAriaTemplate
                .replace('{action}', mediaAction)
                .replace('{title}', this.title)
        );
        mediaLink.setAttribute('title', cardContent.primaryActionTitle || mediaAction);

        const setMediaBackgroundImage = (url) => {
            if (!url) {
                return;
            }
            const absoluteUrl = new URL(String(url), window.location.href).href;
            mediaLink.style.setProperty('--product-image', `url("${absoluteUrl.replace(/"/g, '\\"')}")`);
        };

        const image = document.createElement('img');
        const resolvedImage = this.resolveAssetPath(this.image) || window.WishlistUi.resolveLocalPath('assets/images/gridAdCardLoader.gif');
        image.src = resolvedImage;
        setMediaBackgroundImage(resolvedImage);
        image.alt = this.imageAlt || this.title;
        if (this.imageTitle) {
            image.title = this.imageTitle;
        }
        image.loading = 'lazy';
        image.decoding = 'async';
        image.onerror = () => {
            const fallbackImage = this.resolveAssetPath(this.imageFallback);
            if (fallbackImage && image.src !== fallbackImage) {
                image.src = fallbackImage;
                setMediaBackgroundImage(fallbackImage);
                article.classList.add('has-image-fallback');
                return;
            }

            image.onerror = null;
            image.src = window.WishlistUi.resolveLocalPath('assets/images/gridAdCardLoader.gif');
            setMediaBackgroundImage(image.src);
            article.classList.add('has-image-fallback');
        };
        mediaLink.appendChild(image);

        const content = document.createElement('div');
        content.className = 'product-content';

        const title = document.createElement('h3');
        title.textContent = this.title;

        const meta = document.createElement('p');
        meta.className = 'product-meta';
        meta.textContent = this.status === 'gifted' ? this.statusMeta : this.getAudienceLabel();

        const actions = document.createElement('div');
        actions.className = 'product-actions';

        const amazonLink = document.createElement('a');
        amazonLink.className = 'button button-primary product-action';
        amazonLink.href = this.productUrl;
        amazonLink.target = '_blank';
        amazonLink.rel = 'noopener noreferrer sponsored';
        const amazonLinkText = document.createElement('span');
        amazonLinkText.textContent = this.getPrimaryActionLabel();
        const amazonLinkIcon = document.createElement('i');
        amazonLinkIcon.className = 'fas fa-external-link-alt';
        amazonLinkIcon.setAttribute('aria-hidden', 'true');
        amazonLink.appendChild(amazonLinkText);
        amazonLink.appendChild(amazonLinkIcon);
        amazonLink.setAttribute(
            'title',
            this.status === 'gifted'
                ? (cardContent.giftedActionTitle || amazonLinkText.textContent)
                : (cardContent.primaryActionTitle || amazonLinkText.textContent)
        );

        const copyButton = document.createElement('button');
        copyButton.className = 'button button-secondary product-action';
        copyButton.type = 'button';
        copyButton.setAttribute('aria-expanded', 'false');
        copyButton.setAttribute('aria-haspopup', 'menu');
        copyButton.setAttribute('title', cardContent.shareActionTitle || cardContent.shareAction || 'Teilen');
        const copyIcon = document.createElement('i');
        copyIcon.className = 'fas fa-share-from-square';
        copyIcon.setAttribute('aria-hidden', 'true');

        const copyText = document.createElement('span');
        copyText.textContent = cardContent.shareAction || 'Teilen';

        copyButton.appendChild(copyIcon);
        copyButton.appendChild(copyText);

        const shareWrapper = document.createElement('div');
        shareWrapper.className = 'product-share';
        const shareMenu = this.createShareMenu(copyButton, shareWrapper);
        copyButton.addEventListener('click', () => this.toggleShareMenu(shareWrapper, copyButton));
        shareWrapper.appendChild(copyButton);
        shareWrapper.appendChild(shareMenu);

        if (this.status === 'gifted') {
            const overlay = document.createElement('div');
            overlay.className = 'gifted-overlay';
            const overlayIcon = document.createElement('i');
            overlayIcon.className = 'fas fa-check';
            overlayIcon.setAttribute('aria-hidden', 'true');

            const overlayText = document.createElement('span');
            const cardContentGifted = this.content.card || {};
            let giftedLabel = this.statusLabel.replace(/^🎁\s*/, '') || cardContentGifted.giftedLabel || 'Schon geschenkt';
            if (cardContentGifted.giftedLabel && /schon geschenkt/i.test(giftedLabel)) {
                giftedLabel = cardContentGifted.giftedLabel;
            }
            overlayText.textContent = giftedLabel;

            overlay.appendChild(overlayIcon);
            overlay.appendChild(overlayText);
            article.appendChild(overlay);
        }

        if (this.status === 'gifted' && this.content.card && this.content.card.giftedMeta) {
            const germanDefaultMeta = /danke fürs möglichmachen/i.test(this.statusMeta || '');
            if (!this.statusMeta || germanDefaultMeta) {
                // Keep product-specific meta; only replace German defaults for locale UI.
                meta.textContent = this.content.card.giftedMeta;
            }
        }

        if (this.status !== 'gifted') {
            const badge = document.createElement(this.hasAiAssistedImage() ? 'a' : 'span');
            badge.className = 'product-badge';
            if (this.hasAiAssistedImage()) {
                badge.classList.add('has-ai-content');
                badge.href = cardContent.aiContentUrl || 'https://cannachris.de/ki-content/';
                badge.target = '_blank';
                badge.rel = 'noopener noreferrer';
                badge.setAttribute('aria-label', cardContent.aiContentAria || 'Wunsch - Hinweis zu KI-Content auf Cannachris öffnen');
                badge.setAttribute('title', cardContent.aiContentTitle || cardContent.aiContentAria || 'KI-Content');
            } else {
                badge.setAttribute('title', cardContent.badgeTitle || cardContent.badge || 'Wunsch');
            }
            const badgeIcon = document.createElement('i');
            badgeIcon.className = 'fas fa-gift';
            badgeIcon.setAttribute('aria-hidden', 'true');

            const badgeText = document.createElement('span');
            badgeText.textContent = cardContent.badge || 'Wunsch';

            badge.appendChild(badgeIcon);
            badge.appendChild(badgeText);
            if (this.hasAiAssistedImage()) {
                const aiIcon = document.createElement('img');
                aiIcon.className = 'product-badge-ai-icon';
                aiIcon.src = window.WishlistUi.resolveLocalPath('assets/icons/cannachris-icon-okai.svg');
                aiIcon.alt = '';
                aiIcon.width = 16;
                aiIcon.height = 16;
                aiIcon.decoding = 'async';
                aiIcon.setAttribute('aria-hidden', 'true');
                badge.appendChild(aiIcon);
            }
            article.appendChild(badge);
        }

        actions.appendChild(amazonLink);
        actions.appendChild(shareWrapper);
        content.appendChild(title);
        content.appendChild(meta);
        content.appendChild(actions);
        article.appendChild(mediaLink);
        article.appendChild(content);

        return article;
    }

    createShareMenu(button, wrapper) {
        const menu = document.createElement('div');
        menu.className = 'product-share-menu';
        menu.setAttribute('role', 'menu');
        const cardContent = this.content.card || {};
        menu.setAttribute('aria-label', (cardContent.shareMenuLabel || '{title} teilen').replace('{title}', this.title));
        menu.setAttribute('title', (cardContent.shareActionTitle || cardContent.shareAction || 'Teilen'));
        menu.setAttribute('aria-hidden', 'true');

        const shareText = (cardContent.shareTextPrefix || 'Geschenkidee für Chris:') + ' ' + this.title;
        const shareUrl = this.createCardShareUrl();
        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedText = encodeURIComponent(shareText);
        const encodedTitle = encodeURIComponent(this.title);
        const shareTargets = [
            {
                label: 'WhatsApp',
                icon: 'fab fa-whatsapp',
                url: 'https://wa.me/?text=' + encodedText + '%20' + encodedUrl
            },
            {
                label: 'Telegram',
                icon: 'fab fa-telegram-plane',
                url: 'https://t.me/share/url?url=' + encodedUrl + '&text=' + encodedText
            },
            {
                label: 'Facebook',
                icon: 'fab fa-facebook-f',
                url: 'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl
            },
            {
                label: 'X',
                icon: 'fab fa-twitter',
                url: 'https://twitter.com/intent/tweet?text=' + encodedText + '&url=' + encodedUrl
            },
            {
                label: 'E-Mail',
                icon: 'fas fa-envelope',
                url: 'mailto:?subject=' + encodedTitle + '&body=' + encodedText + '%0A%0A' + encodedUrl
            }
        ];

        shareTargets.forEach((target) => {
            const link = document.createElement('a');
            link.href = target.url;
            link.target = target.url.startsWith('mailto:') ? '_self' : '_blank';
            link.rel = target.url.startsWith('mailto:') ? '' : 'noopener noreferrer sponsored';
            link.setAttribute('role', 'menuitem');
            link.setAttribute('aria-label', (cardContent.shareViaAria || 'Über {service} teilen').replace('{service}', target.label));
            link.tabIndex = -1;

            const icon = document.createElement('i');
            icon.className = target.icon;
            icon.setAttribute('aria-hidden', 'true');

            link.appendChild(icon);
            menu.appendChild(link);
        });

        const copyLink = document.createElement('button');
        copyLink.type = 'button';
        copyLink.setAttribute('role', 'menuitem');
        copyLink.setAttribute('aria-label', cardContent.copyLinkAria || 'Affiliate-Link kopieren');
        copyLink.tabIndex = -1;

        const copyIcon = document.createElement('i');
        copyIcon.className = 'fas fa-link';
        copyIcon.setAttribute('aria-hidden', 'true');
        copyLink.appendChild(copyIcon);
        copyLink.addEventListener('click', () => this.copyProductLink(button, wrapper));
        menu.appendChild(copyLink);

        return menu;
    }

    toggleShareMenu(wrapper, button) {
        const nextState = !wrapper.classList.contains('is-open');

        document.querySelectorAll('.product-share.is-open').forEach((openWrapper) => {
            if (openWrapper !== wrapper) {
                openWrapper.classList.remove('is-open');
                const openButton = openWrapper.querySelector('button[aria-expanded]');
                if (openButton) {
                    openButton.setAttribute('aria-expanded', 'false');
                }
                AdCard.setShareMenuAccessibility(openWrapper, false);
            }
        });

        wrapper.classList.toggle('is-open', nextState);
        button.setAttribute('aria-expanded', String(nextState));
        AdCard.setShareMenuAccessibility(wrapper, nextState);
    }

    async copyProductLink(button, wrapper) {
        const setButtonLabel = (label, iconClass = 'fas fa-share-from-square') => {
            button.replaceChildren();

            const icon = document.createElement('i');
            icon.className = iconClass;
            icon.setAttribute('aria-hidden', 'true');

            const text = document.createElement('span');
            text.textContent = label;

            button.appendChild(icon);
            button.appendChild(text);
        };

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(this.createCardShareUrl());
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = this.createCardShareUrl();
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'absolute';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            setButtonLabel((this.content.card && this.content.card.copySuccess) || 'Kopiert', 'fas fa-check');
            button.classList.add('is-confirmed');
            if (wrapper) {
                wrapper.classList.remove('is-open');
                button.setAttribute('aria-expanded', 'false');
                AdCard.setShareMenuAccessibility(wrapper, false);
            }
        } catch (error) {
            setButtonLabel((this.content.card && this.content.card.copyError) || 'Fehler', 'fas fa-exclamation-triangle');
            console.error(error);
        }

        window.setTimeout(() => {
            setButtonLabel((this.content.card && this.content.card.shareAction) || 'Teilen');
            button.classList.remove('is-confirmed');
        }, 1800);
    }
}
