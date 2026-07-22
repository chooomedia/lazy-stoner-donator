function pageHasHash() {
    if (!window.location.hash || typeof window.smoothScrollToHash !== 'function') {
        return false;
    }

    return window.smoothScrollToHash(window.location.hash, false);
}
