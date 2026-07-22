function createButton(text, faIcon) {
    const button = document.createElement('button');
    button.type = 'button';

    if (faIcon) {
        const icon = document.createElement('i');
        icon.className = 'fas fa-' + faIcon;
        icon.setAttribute('aria-hidden', 'true');
        button.appendChild(icon);
    }

    button.appendChild(document.createTextNode(text));
    return button;
}

class Menu extends Widget {
    constructor(parentContainerId, options = {}) {
        super(parentContainerId);
        this.options = options;
        this.title = options.title;
        this.content = options.content;
        this.collapsed = false;

        this.domElement.className = 'legacy-menu';

        const headerContainer = document.createElement('section');
        headerContainer.className = 'legacy-menu-header';
        this.domElement.appendChild(headerContainer);

        if (typeof this.title === 'string') {
            const titleElement = document.createElement('div');
            titleElement.innerHTML = this.title;
            this.title = titleElement;
            headerContainer.appendChild(this.title);
        } else if (this.title) {
            headerContainer.appendChild(this.title);
        }

        if (typeof this.content === 'string') {
            const contentElement = document.createElement('div');
            contentElement.innerHTML = this.content;
            this.content = contentElement;
            this.domElement.appendChild(this.content);
        } else if (this.content) {
            this.domElement.appendChild(this.content);
        }

        if (!this.content) {
            return;
        }

        const collapseButton = createButton('Toggle', 'arrows-alt-v');
        collapseButton.classList.add('collapseButton');
        collapseButton.addEventListener('click', () => {
            this.collapsed = !this.collapsed;
            this.content.hidden = this.collapsed;
        });
        headerContainer.appendChild(collapseButton);
    }
}
