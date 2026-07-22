class CardStack extends Widget {
    constructor(parentContainer, options = {}) {
        super(null);
        this.options = options;
        this.cards = [];
        this.domElement.className = options.className || 'wishlist-grid';

        if (typeof parentContainer === 'string') {
            this.containerDomElement = document.getElementById(parentContainer);
        } else if (parentContainer && parentContainer.nodeType === 1) {
            this.containerDomElement = parentContainer;
        }

        if (this.containerDomElement) {
            this.domElement = this.containerDomElement;
            this.domElement.classList.add(options.className || 'wishlist-grid');
        }
    }

    addCard(card) {
        this.cards.push(card);
        this.domElement.appendChild(card.domElement);
        window.requestAnimationFrame(() => card.show());
    }

    getCard(index) {
        return this.cards[index];
    }
}
