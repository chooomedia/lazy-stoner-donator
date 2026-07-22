class AdCard extends Card {
    constructor(cardOptions = {}) {
        super({ className: 'wishlist-card' });

        this.adHost = cardOptions.host || 'amazon';
        this.partnerId = cardOptions.partner || 'cann4chris-21';
        this.adId = cardOptions.adId;
        this.title = cardOptions.title || 'Amazon Wunsch';
        this.status = cardOptions.status;
        this.statusLabel = cardOptions.statusLabel || 'Schon geschenkt';
        this.statusMeta = cardOptions.statusMeta || 'Danke fürs Möglichmachen';
        this.image = cardOptions.image;
        this.imageFallback = cardOptions.imageFallback;
        this.price = cardOptions.price;
        this.byline = cardOptions.byline;
        this.audienceLabel = cardOptions.audienceLabel;
        this.displayTier = cardOptions.displayTier;
        this.featureReason = cardOptions.featureReason;
        this.productUrl = cardOptions.url || this.createProductUrl(this.adId);
        this.content = window.birthdayWishlistContent || {};

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

        const title = this.title.toLowerCase();
        const matches = (terms) => terms.some((term) => title.includes(term));

        if (matches(['smallrig', 'cage', 'rig', 'anamorphotisch', 'objektiv', 'stabilisator', 'quick release'])) {
            return 'Für mobiles Creator-Setup';
        }

        if (matches(['prompter', 'stream deck', 'capture card', 'key light', 'softbox', 'elgato'])) {
            return 'Für Stream, Video & Workflow';
        }

        if (matches(['ssd', 'speicher', 'festplatte', 'usb-c', 'hub', 'dock', 'monitor'])) {
            return 'Für ein schnelleres Setup';
        }

        if (matches(['kamera', 'video', 'creator', 'vlog', 'foto', 'fotodrucker', 'sony alpha', 'osmo pocket', 'dji'])) {
            return 'Für bessere Aufnahmen';
        }

        if (matches(['mikro', 'micro', 'rode', 'røde', 'shure', 'focusrite', 'zoom', 'audio'])) {
            return 'Für sauberen Content-Sound';
        }

        if (matches(['3d', 'laser', 'schrauber', 'tool', 'werkzeug', 'leatherman', 'lego', 'stickmaschine', 'scan', 'maker', 'solar'])) {
            return 'Für Maker-Projekte';
        }

        if (matches(['grow', 'pflanz', 'boveda', 'hygrometer', 'sensor', 'ventilator', 'vaporizer', 'volcano', 'venty', 'ph-messgerät'])) {
            return 'Für Grow, Genuss & Pflege';
        }

        if (matches(['buch', 'geschichte', 'kunst des krieges', 'homo deus', 'arousal'])) {
            return 'Für neue Perspektiven';
        }

        if (matches(['rucksack', 'filter', 'katadyn', 'schnorchel', 'pavillon', 'outdoor', 'vaude', 'iridium'])) {
            return 'Für unterwegs & draußen';
        }

        if (matches(['synth', 'stylophone', 'ukulele', 'pa-system'])) {
            return 'Für Studio & Soundideen';
        }

        if (matches(['kaffee', 'cold brew', 'becher', 'flasche', 'uhr', 'licht', 'lampe'])) {
            return 'Für Alltag mit Mehrwert';
        }

        return 'Passt gut zu Chris';
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

        const mediaLink = document.createElement('a');
        mediaLink.className = 'product-media';
        mediaLink.href = this.productUrl;
        mediaLink.target = '_blank';
        mediaLink.rel = 'noopener sponsored';
        mediaLink.setAttribute('aria-label', this.title + ' ansehen');

        const image = document.createElement('img');
        image.src = this.image || './assets/images/gridAdCardLoader.gif';
        image.alt = this.title;
        image.loading = 'lazy';
        image.decoding = 'async';
        image.onerror = () => {
            if (this.imageFallback && image.src !== this.imageFallback) {
                image.src = this.imageFallback;
                article.classList.add('has-image-fallback');
                return;
            }

            image.onerror = null;
            image.src = './assets/images/gridAdCardLoader.gif';
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
        amazonLink.rel = 'noopener sponsored';
        amazonLink.textContent = this.getPrimaryActionLabel();

        const copyButton = document.createElement('button');
        copyButton.className = 'button button-secondary product-action';
        copyButton.type = 'button';
        copyButton.setAttribute('aria-expanded', 'false');
        copyButton.setAttribute('aria-haspopup', 'menu');
        const copyIcon = document.createElement('i');
        copyIcon.className = 'fas fa-share-alt';
        copyIcon.setAttribute('aria-hidden', 'true');

        const copyText = document.createElement('span');
        copyText.textContent = (this.content.card && this.content.card.shareAction) || 'Teilen';

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
            overlayText.textContent = this.statusLabel.replace(/^🎁\s*/, '') || 'Schon geschenkt';

            overlay.appendChild(overlayIcon);
            overlay.appendChild(overlayText);
            article.appendChild(overlay);
        }

        if (this.status !== 'gifted') {
            const badge = document.createElement('span');
            badge.className = 'product-badge';
            const badgeIcon = document.createElement('i');
            badgeIcon.className = 'fas fa-gift';
            badgeIcon.setAttribute('aria-hidden', 'true');

            const badgeText = document.createElement('span');
            badgeText.textContent = 'Wunsch';

            badge.appendChild(badgeIcon);
            badge.appendChild(badgeText);
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
        menu.setAttribute('aria-label', this.title + ' teilen');
        menu.setAttribute('aria-hidden', 'true');

        const shareText = 'Geschenkidee für Chris: ' + this.title;
        const encodedUrl = encodeURIComponent(this.productUrl);
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
            link.rel = target.url.startsWith('mailto:') ? '' : 'noopener sponsored';
            link.setAttribute('role', 'menuitem');
            link.setAttribute('aria-label', 'Über ' + target.label + ' teilen');
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
        copyLink.setAttribute('aria-label', 'Affiliate-Link kopieren');
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
        const setButtonLabel = (label, iconClass = 'fas fa-share-alt') => {
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
                await navigator.clipboard.writeText(this.productUrl);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = this.productUrl;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'absolute';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            setButtonLabel('Kopiert', 'fas fa-check');
            button.classList.add('is-confirmed');
            if (wrapper) {
                wrapper.classList.remove('is-open');
                button.setAttribute('aria-expanded', 'false');
                AdCard.setShareMenuAccessibility(wrapper, false);
            }
        } catch (error) {
            setButtonLabel('Fehler', 'fas fa-exclamation-triangle');
            console.error(error);
        }

        window.setTimeout(() => {
            setButtonLabel('Teilen');
            button.classList.remove('is-confirmed');
        }, 1800);
    }
}
