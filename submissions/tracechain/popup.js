// Polyfill for browser API
window.browser = window.browser || window.chrome;

document.addEventListener("DOMContentLoaded", () => initPopup());

async function initPopup() {
	const gtrr = (id) => document.getElementById(id);
	const elPath = gtrr("paths");
	const elStat = gtrr("stats");
	const elAI = gtrr("summary");

	const btnQuick = gtrr("recapBtn");
	const btnFull = gtrr("fullBtn");
	const btnPDF = gtrr("pdfBtn");
	const btnGraph = gtrr("graphBtn");

	const raw = await getToday();
	const muted = await getMuted(); // crass or domains with too many hits which one might not need
	const hideDom = (url) => muted.includes(host(url));

	const visits = raw.visits.filter((v) => !hideDom(v.url));
	const edges = raw.edges.filter((e) => !hideDom(e.from) && !hideDom(e.to));

	elPath && renderPaths(edges, elPath);
	elStat && renderStats(visits, edges, elStat, muted);
	if (btnQuick)
		btnQuick.onclick = () =>
			askAI(
				unique(visits.map((v) => host(v.url))).slice(-60),
				"Give me a crisp 3-bullet summary of the user's web activity today speculating what they were doing and providing insights and suggestions to better help them. Address it directly to the user and don't tell them what you are giving them dive straight into the recap.",
				elAI,
			);

	if (btnFull)
		btnFull.onclick = () =>
			askAI(
				[
					"TIMELINE:",
					...visits.map((v) => `${time(v.t)} — ${host(v.url)}`),
					"",
					"STATS:",
					...buildStats(visits, edges),
				],
				"Turn this into a readable single-paragraph recap",
				elAI,
			);

	if (btnPDF)
		btnPDF.onclick = () =>
			browser.tabs.create({ url: browser.runtime.getURL("print.html") });

	if (btnGraph)
		btnGraph.onclick = () =>
			browser.tabs.create({ url: browser.runtime.getURL("graph.html") });
}

const host = (u) => new URL(u).hostname.replace(/^www\./, "");
const time = (t) =>
	new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const unique = (a) => [...new Set(a)];

function getToday() {
	return new Promise((res) =>
		browser.runtime.sendMessage({ type: "GET_DAY" }, (d) =>
			res({ visits: d?.visits ?? [], edges: d?.edges ?? [] }),
		),
	);
}

const getMuted = () =>
	new Promise((r) =>
		browser.storage.sync.get(["muted"], (d) => r(d.muted ?? [])),
	);
const saveMuted = (arr) => browser.storage.sync.set({ muted: arr });

function renderPaths(edges, box) {
	box.innerHTML = edges.length
		? edges
				.map(
					(e) =>
						`<div><a href="${e.from}" target="_blank">${host(e.from)}</a>
             → <a href="${e.to}" target="_blank">${host(e.to)}</a></div>`,
				)
				.join("")
		: "(no paths yet)";
}

function renderStats(vis, edg, ul, muted) {
	const stats = buildStats(vis, edg);
	ul.innerHTML = stats.map((s) => `<li>${s}</li>`).join("");

	if (!vis.length) return;
	const domSet = new Set(vis.map((v) => host(v.url)));

	ul.insertAdjacentHTML("beforeend", "<hr><b>Include in recap:</b>");
	domSet.forEach((d) => {
		const id = `chk-${d}`;
		const li = document.createElement("li");
		li.style.opacity = muted.includes(d) ? 0.5 : 1;
		li.innerHTML = `<label><input type="checkbox" id="${id}" ${
			muted.includes(d) ? "" : "checked"
		}> ${d}</label>`;
		ul.appendChild(li);
		document.getElementById(id).onchange = (e) => {
			const next = new Set(muted);
			e.target.checked ? next.delete(d) : next.add(d);
			saveMuted([...next]).then(() => location.reload());
		};
	});
}

function buildStats(vis, edg) {
	if (!vis.length) return ["No browsing data yet."];

	/* domain count */
	const counts = {};
	// biome-ignore lint/complexity/noForEach: <explanation>
	vis.forEach((v) => {
		const h = host(v.url);
		counts[h] = (counts[h] || 0) + 1;
	});
	const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || ["—", 0];

	/* times */
	const spanMin = Math.round((vis.at(-1).t - vis[0].t) / 60000);
	let dwell = 0;
	for (let i = 0; i < vis.length - 1; i++)
		if (vis[i].tabId === vis[i + 1].tabId) dwell += vis[i + 1].t - vis[i].t;
	dwell = Math.round(dwell / 60000);

	/* misc */
	const link = vis.filter((v) => v.type === "link").length;
	const typed = vis.filter((v) => v.type === "typed").length;
	const search = vis.filter((v) => /google|duckduckgo|bing/.test(v.url)).length;

	let longest = 1;
	let cur = 1;
	for (let i = 1; i < vis.length; i++) {
		cur = vis[i].tabId === vis[i - 1].tabId ? cur + 1 : 1;
		longest = Math.max(longest, cur);
	}

	return [
		`Pages visited: ${vis.length}`,
		`Unique domains: ${Object.keys(counts).length}`,
		`Tabs opened: ${new Set(vis.map((v) => v.tabId)).size}`,
		`Top domain: ${top[0]} (${top[1]} hits)`,
		`Browsing span: ${spanMin} min`,
		`Est. on-page time: ${dwell} min`,
		`Link navigations: ${link}`,
		`Typed URLs: ${typed}`,
		`Search hits: ${search}`,
		`Edges logged: ${edg.length}`,
		`Longest same-tab chain: ${longest} pages`,
	];
}

async function askAI(lines, sysPrompt, outBox) {
	if (!outBox) return;
	outBox.textContent = "Thinking…";
	try {
		const r = await fetch("https://ai.hackclub.com/chat/completions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				model: "gpt-3.5-turbo",
				messages: [
					{ role: "system", content: sysPrompt },
					{
						role: "user",
						content: Array.isArray(lines) ? lines.join("\n") : lines,
					},
				],
			}),
		});
		const j = await r.json();
		outBox.textContent =
			j?.choices?.[0]?.message?.content?.trim() || "No summary returned.";
	} catch (e) {
		console.error(e);
		outBox.textContent = "AI request failed.";
	}
}
