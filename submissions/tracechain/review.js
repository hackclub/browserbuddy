// Polyfill for browser API
window.browser = window.browser || window.chrome;

const list = document.getElementById("list");
const rowTpl = document.getElementById("row").content;
const search = document.getElementById("search");

let pages = [];

browser.storage.local.get(["burstCache"]).then(({ burstCache }) => {
	if (!Array.isArray(burstCache)) {
		console.error("[Review] burstCache is not an array", burstCache);
		pages = [];
	} else {
		pages = burstCache;
	}
	console.log("[Review] Loaded burstCache:", pages);
	render(pages);
	// Notify background that review board is loaded
	browser.runtime.sendMessage({ type: "REVIEW_LOADED" });
});

search.addEventListener("input", () => filter());

document.addEventListener("keydown", (e) => {
	if (e.ctrlKey && e.key.toLowerCase() === "k") {
		e.preventDefault();
		search.focus();
	}
});

function filter() {
	const q = search.value.toLowerCase();
	render(
		pages.filter(
			(p) =>
				p.title.toLowerCase().includes(q) || p.url.toLowerCase().includes(q),
		),
	);
}

function render(arr) {
	list.innerHTML = "";
	if (!arr.length) {
		console.warn("[Review] Nothing to review!");
		list.innerHTML = '<p class="empty">Nothing to review!</p>';
		return;
	}

	// biome-ignore lint/complexity/noForEach: <explanation>
	arr.forEach((p) => {
		const li = rowTpl.cloneNode(true);
		li.querySelector(".icon").src = `chrome://favicon/${p.url}`;
		const a = li.querySelector("a.title");
		a.href = p.url;
		a.textContent = p.title || p.url;

		// biome-ignore lint/complexity/noForEach: <explanation>
		li.querySelectorAll("button").forEach((btn) => {
			btn.onclick = () => handle(btn.dataset.cmd, p, li);
		});
		list.appendChild(li);
	});
}

function handle(cmd, p, li) {
	if (cmd === "copy") {
		navigator.clipboard.writeText(p.url);
		return;
	}
	browser.tabs.query({ url: p.url }).then((tabs) => {
		if (cmd === "open") {
			if (tabs.length) return browser.tabs.update(tabs[0].id, { active: true });
			return browser.tabs.create({ url: p.url });
		}
		if (cmd === "pin") {
			if (tabs.length)
				// biome-ignore lint/complexity/noForEach: <explanation>
				tabs.forEach((t) => browser.tabs.update(t.id, { pinned: !t.pinned }));
			else browser.tabs.create({ url: p.url, pinned: true });
		}
		if (cmd === "close") {
			if (tabs.length) {
				// biome-ignore lint/complexity/noForEach: <explanation>
				tabs.forEach((t) => browser.tabs.remove(t.id));
				li.style.opacity = 0.4;
			}
		}
	});
}
