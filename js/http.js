/**
 * Small fetch wrapper kept for legacy components.
 */
class Http {
    async request(method, url, contentType, data) {
        const headers = {};

        if (contentType) {
            headers['Content-Type'] = contentType;
        }

        const response = await fetch(url, {
            method,
            headers,
            body: data
        });

        if (!response.ok) {
            throw new Error('Request failed with status ' + response.status);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }

    get(url) {
        return this.request('GET', url);
    }

    post(url, data) {
        return this.request('POST', url, 'application/json', JSON.stringify(data));
    }
}
