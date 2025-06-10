(new MutationObserver(() =>
	document.querySelectorAll('ytd-thumbnail yt-image, .ytp-videowall-still-image')
		.forEach(e => {
			if (e.classList.contains('clickbaitified')) return;
			let img = document.createElement('IMG');
			img.src = chrome.runtime.getURL(`images/Clickbaitify${Math.floor(Math.random()*8)}.png`,);
			img.style.position = 'absolute';
			img.style.width = '100%';
			img.style.left = 0;
			img.style.bottom = 0;
			img.style.objectFit = 'cover';
			e.append(img);
			e.classList.add('clickbaitified');
		})
)).observe(document.querySelector('ytd-page-manager'), {subtree: true, childList: true});
