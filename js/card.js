/**
 * Lightweight base card used by specialized card renderers.
 */
class Card extends Widget {
    constructor(cardOptions = {}) {
        super(null);
        this.cardOptions = cardOptions;
        this.domElement.className = cardOptions.className || 'card';
    }

    show() {
        this.domElement.classList.add('is-ready');
    }
}
