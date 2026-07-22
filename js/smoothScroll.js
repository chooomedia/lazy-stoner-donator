(function () {
    'use strict';

    function scrollToHash(hash, updateHistory) {
        const target = document.getElementById(hash.replace('#', ''));
        if (!target) {
            return false;
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (updateHistory && window.history && window.history.pushState) {
            window.history.pushState(null, '', hash);
        }

        return true;
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.hash) {
            window.setTimeout(() => scrollToHash(window.location.hash, false), 80);
        }

        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
            link.addEventListener('click', (event) => {
                if (scrollToHash(link.hash, true)) {
                    event.preventDefault();
                }
            });
        });
    });

    window.smoothScrollToHash = scrollToHash;
}());
