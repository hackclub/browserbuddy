function renderBadge(total_formatted) {
    const badge = document.createElement('div');
    badge.className = 'yt-total-duration-fixed';
    badge.textContent = `⏱ Total Duration: ${total_formatted}`;

    Object.assign(badge.style, {
        position: 'fixed',
        top: '12px',
        right: '12px',
        zIndex: 10000,
        backgroundColor: '#212121',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        opacity: '0',
        cursor: 'move',
        userSelect: 'none',
        transition: 'opacity 0.5s ease'
    });

    const closeBtn = document.createElement('span');
    closeBtn.textContent = ' ×';
    closeBtn.style.marginLeft = '8px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.onclick = () => badge.remove();
    badge.appendChild(closeBtn);

    let isDragging = false, offsetX, offsetY;
    badge.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - badge.offsetLeft;
        offsetY = e.clientY - badge.offsetTop;
        e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            badge.style.left = `${e.clientX - offsetX}px`;
            badge.style.top = `${e.clientY - offsetY}px`;
            badge.style.right = 'auto';
        }
    });
    document.addEventListener('mouseup', () => isDragging = false);

    document.body.appendChild(badge);
    requestAnimationFrame(() => badge.style.opacity = '1');
}

async function getTotalPlaylistDuration(playlistId, apiKey) {
    let videoIds = [];
    let nextPageToken = '';

    do {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}&pageToken=${nextPageToken}`;
        const res = await fetch(url);
        const data = await res.json();

        data.items.forEach(item => {
            videoIds.push(item.contentDetails.videoId);
        });

        nextPageToken = data.nextPageToken || '';
    } while (nextPageToken);

    let totalSeconds = 0;
    for (let i = 0; i < videoIds.length; i += 50) {
        const batch = videoIds.slice(i, i + 50);
        const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${batch.join(',')}&key=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();

        data.items.forEach(item => {
            const duration = item.contentDetails.duration;
            totalSeconds += isoDurationToSeconds(duration);
        });
    }

    // Convert total seconds to H:M:S
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return duration;
}

function isoDurationToSeconds(duration) {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const [, hours, minutes, seconds] = duration.match(regex).map(x => parseInt(x || 0));
    return (hours * 3600) + (minutes * 60) + seconds;
}

async function displayDuration(playlist) {
    const API_KEY = 'AIzaSyCl1NjFBnvTCthuX-EmgmrEkXbXWWjNN-U';

    const time = await getTotalPlaylistDuration(playlist, API_KEY);

    renderBadge(time);

}

let displayed = false;
setInterval(() => {
    let url = location.href;
    let badge = document.querySelector('.yt-total-duration-fixed');
    if (!url.includes('playlist?list=') || (/playlist\?list=WL(&|$)/).test(url) || (/playlist\?list=LL(&|$)/).test(url)) {
        displayed = false;
        badge?.remove();
    } else if (!displayed) {
        displayed = true;
        const playlist = url.match(/playlist\?list=([^&]+)/)[1];
        displayDuration(playlist);
    }
}, 500);