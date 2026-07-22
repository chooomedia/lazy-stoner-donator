class VideoCard extends Card {
    constructor(cardOptions = {}) {
        super({ className: 'video-card' });

        if (!cardOptions.videoUrl) {
            throw new Error('cardOptions.videoUrl is required for VideoCard.');
        }

        this.video = cardOptions.videoUrl;
        this.videoHost = cardOptions.videoHost;
        this.render();
    }

    render() {
        if (this.video.includes('youtube')) {
            const videoId = this.getVideoId(this.video);
            this.domElement.appendChild(this.createYouTubeLink(videoId));
            return;
        }

        if (this.video.includes('vimeo')) {
            this.domElement.appendChild(this.createVimeoLink(this.video));
        }
    }

    getVideoId(url) {
        const parts = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
        if (parts[2] !== undefined) {
            return parts[2].split(/[^0-9a-z_-]/i)[0];
        }
        return url;
    }

    createYouTubeLink(videoId) {
        const link = document.createElement('a');
        link.href = 'https://www.youtube.com/watch?v=' + videoId;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const image = document.createElement('img');
        image.src = 'https://i.ytimg.com/vi/' + videoId + '/mqdefault.jpg';
        image.alt = 'YouTube Video öffnen';
        image.loading = 'lazy';
        link.appendChild(image);
        return link;
    }

    createVimeoLink(videoUrl) {
        const link = document.createElement('a');
        link.href = videoUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Vimeo Video öffnen';
        return link;
    }
}
