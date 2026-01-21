let isIdle = false;

const todayKey = () => new Date().toISOString().slice(0, 10);
const lastURL = new Map();
chrome.idle.setDetectionInterval(120);
chrome.idle.onStateChanged.addListener((state) => {
	isIdle = state !== "active";
});

function normalise(obj = {}) {
	return { visits: obj.visits ?? [], edges: obj.edges ?? [] };
}
function push(key, field, obj) {
	if (isIdle) return; //  skip idle periods
	chrome.storage.local.get([key], (d) => {
		const day = normalise(d[key]);
		day[field].push(obj);
		chrome.storage.local.set({ [key]: day });
	});
}
// ensure {visits:[],edges:[]} skeleton

function save(key, day) {
	chrome.storage.local.set({ [key]: day });
}

function safePush(key, field, obj) {
	chrome.storage.local.get([key], (data) => {
		const day = normalise(data[key]);
		day[field].push(obj);
		save(key, day);
	});
}

chrome.webNavigation.onCommitted.addListener((d) => {
	if (d.frameId) return; // ignore iframes

	const visit = {
		url: d.url,
		t: Date.now(),
		tabId: d.tabId,
		type: d.transitionType,
	};
	safePush(todayKey(), "visits", visit);

	const prev = lastURL.get(d.tabId);
	if (prev)
		safePush(todayKey(), "edges", { from: prev, to: d.url, t: Date.now() });
	lastURL.set(d.tabId, d.url);
});
chrome.webNavigation.onCreatedNavigationTarget.addListener((d) => {
	const src = lastURL.get(d.sourceTabId);
	if (src)
		safePush(todayKey(), "edges", { from: src, to: d.url, t: Date.now() });
});

chrome.runtime.onMessage.addListener((msg, _s, res) => {
	if (msg?.type === "GET_DAY") {
		chrome.storage.local.get([todayKey()], (d) =>
			res(normalise(d[todayKey()])),
		);
		return true;
	}
});

const BURST_WINDOW_MIN = 10; // minute observation window
const BURST_TABS = 9; // tab count that triggers a burst
const REMINDER_DELAY_MIN = 15; // nudge 15 minutes after burst

const BURST_WINDOW_MS = BURST_WINDOW_MIN * 60 * 1_000;
const NUDGE_ID = "recap-nudge";
const NUDGE_ICON = chrome.runtime.getURL("icon.png");

let openTimes = [];
let burstTabs = [];
let alarmActive = false;

chrome.tabs.onCreated.addListener((tab) => {
	const now = Date.now();
	openTimes.push(now);
	burstTabs.push({
		tabId: tab.id,
		url: tab.pendingUrl || tab.url || "about:blank",
		title: "(new tab)",
	});

	// prune entries outside the window
	while (openTimes.length && now - openTimes[0] > BURST_WINDOW_MS) {
		openTimes.shift();
		burstTabs.shift();
	}

	console.log("[BurstDetector] window =", openTimes.length, "tabs");

	if (!alarmActive && openTimes.length >= BURST_TABS) {
		const cache = burstTabs.map(({ url, title }) => ({ url, title }));
		chrome.storage.local.set({ burstCache: cache }, () => {
			if (chrome.runtime.lastError) {
				console.error(
					"[BG] Failed to set burstCache:",
					chrome.runtime.lastError,
				);
			} else {
				console.log("[BG] burstCache set:", cache);
			}
		});
		chrome.alarms.create(NUDGE_ID, { delayInMinutes: REMINDER_DELAY_MIN });
		alarmActive = true;
		console.log("[BurstDetector] Burst detected → alarm scheduled");
	}
});

chrome.webNavigation.onCommitted.addListener((d) => {
	if (d.frameId) return; // ignore iframes

	const visit = {
		url: d.url,
		t: Date.now(),
		tabId: d.tabId,
		type: d.transitionType,
	};
	safePush(todayKey(), "visits", visit);

	const prev = lastURL.get(d.tabId);
	if (prev)
		safePush(todayKey(), "edges", { from: prev, to: d.url, t: Date.now() });
	lastURL.set(d.tabId, d.url);

	const idx = burstTabs.findIndex((t) => t.tabId === d.tabId);
	if (idx !== -1) {
		chrome.tabs.get(d.tabId, (tab) => {
			burstTabs[idx].url = d.url;
			burstTabs[idx].title = tab?.title ? tab.title : d.url;
			const cache = burstTabs.map(({ url, title }) => ({ url, title }));
			chrome.storage.local.set({ burstCache: cache }, () => {
				if (chrome.runtime.lastError) {
					console.error(
						"[BG] Failed to update burstCache:",
						chrome.runtime.lastError,
					);
				} else {
					console.log("[BG] burstCache updated:", cache);
				}
			});
		});
	}
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg && msg.type === "REVIEW_LOADED") {
		openTimes = [];
		burstTabs = [];
		chrome.storage.local.remove("burstCache", () => {
			if (chrome.runtime.lastError) {
				console.error(
					"[BG] Failed to remove burstCache:",
					chrome.runtime.lastError,
				);
			} else {
				console.log("[BG] burstCache removed after review loaded");
			}
		});
	}
});

chrome.notifications.onClicked.addListener((id) => {
	if (id !== NUDGE_ID) return;
	openReview();
	chrome.notifications.clear(id);
});

chrome.notifications.onClicked.addListener((id) => {
	if (id !== NUDGE_ID) return;
	openReview();
	chrome.notifications.clear(id);
});

function openReview() {
	chrome.tabs.create({ url: chrome.runtime.getURL("review.html") });
}

//  keep the worker alive forcefuilly
chrome.alarms.onAlarm.addListener((alarm) => {
	if (alarm.name !== NUDGE_ID) return;

	chrome.notifications
		.create(NUDGE_ID, {
			type: "basic",
			iconUrl: NUDGE_ICON,
			title: "Tab spree detected!",
			message: "Click to triage your new tabs.",
			requireInteraction: true, // keeps notification onscreen (Chrome >= 67)
		})
		.then(() => {
			setTimeout(
				() =>
					chrome.notifications.getAll((nots) => {
						if (nots[NUDGE_ID]) {
							openReview();
							chrome.notifications.clear(NUDGE_ID);
						}
					}),
				30_000,
			);
		});

	alarmActive = false;
});
