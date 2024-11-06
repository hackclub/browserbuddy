allFilters = null;
webRTCPrivacy = null;

function setFilters(newFilters) {
	allFilters = newFilters;
	chrome.storage.local.set({"filters": newFilters});
}

blockImagePayload = {redirectUrl: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAI="};
blockPagePayload = {redirectUrl: "about:blank"};
cancelPayload = {cancel: true};

function blockImage(details) {
	return blockImagePayload;
}

function blockPage(details) {
	return blockPagePayload;
}

function blockObject(details) {
	return cancelPayload;
}

listenerCallbacks = [
	[["image"], blockImage],
	[["sub_frame"], blockPage],
	[["main_frame", "object", "script", "xmlhttprequest", "stylesheet", "font", "media", "ping", "csp_report", "other"], blockObject]
]

blockingEnabled = false;

function enable(icon = true) {
	if (blockingEnabled) {
		return;
	}

	if (allFilters.length > 0) {
		for (var j in listenerCallbacks) {
			var types = listenerCallbacks[j][0];
			var callback = listenerCallbacks[j][1];
			chrome.webRequest.onBeforeRequest.addListener(
				callback,
				{urls: allFilters, types: types},
				["blocking"]
			);
		}
	}

	var wsFilters = [];
	var prefix = "*://";
	allFilters.forEach(function(filter) {
		if (filter.startsWith(prefix)) {
			var suffix = filter.slice(prefix.length);
			wsFilters.push("ws://" + suffix);
			wsFilters.push("wss://" + suffix);
		}
	});
	if (wsFilters.length > 0) {
		chrome.webRequest.onBeforeRequest.addListener(
			blockObject,
			{urls: wsFilters, types: ["websocket"]},
			["blocking"]
		);
	}

	blockingEnabled = true;
	if (icon) {
		chrome.browserAction.setIcon(enabledImageData);
	}
	
	removePopupsEnableScrollingAndRemovePaywalls();
}

function disable(icon = true) {}

function toggleEnabled() {
	enable();
}

function setWebRTCPrivacy(flag, store = true) {
	webRTCPrivacy = flag;
	var privacySetting = flag ? "default_public_interface_only" : "default";
	chrome.privacy.network.webRTCIPHandlingPolicy.set({value: privacySetting});
	if (store) {
		chrome.storage.local.set({"webrtc_privacy": flag});
	}
}

function removePopupsEnableScrollingAndRemovePaywalls() {
	chrome.tabs.executeScript({
		code: `
			document.querySelectorAll('div, section, aside, header').forEach(el => {
				const style = window.getComputedStyle(el);
				if ((style.position === 'fixed' || style.position === 'sticky' || style.zIndex > 1000) &&
					(el.innerText.toLowerCase().includes('subscribe') || el.innerText.toLowerCase().includes('sign up') || el.innerText.toLowerCase().includes('register'))) {
					el.style.display = 'none';
				}
			});

			document.body.style.overflow = 'auto';
			document.documentElement.style.overflow = 'auto';

			document.querySelectorAll('[class*="overlay"], [id*="overlay"], [class*="paywall"], [id*="paywall"]').forEach(el => {
				el.style.display = 'none';
			});

			document.querySelectorAll('*').forEach(el => {
				const computedStyle = window.getComputedStyle(el);
				if (computedStyle.filter && computedStyle.filter.includes('blur')) {
					el.style.filter = 'none';
				}
				if (computedStyle.backdropFilter && computedStyle.backdropFilter.includes('blur')) {
					el.style.backdropFilter = 'none';
				}
			});
		`
	});
}

chrome.storage.local.get("filters", function(result) {
	if (result["filters"] == undefined) {
		setFilters(defaultFilters);
	} else {
		setFilters(result["filters"]);
		allFilters = result["filters"];
	}
	enable();
});


chrome.storage.local.get("webrtc_privacy", function(result) {
	if (result["webrtc_privacy"] == undefined) {
		setWebRTCPrivacy(false, true);
	} else {
		setWebRTCPrivacy(result["webrtc_privacy"], false);
	}
});
