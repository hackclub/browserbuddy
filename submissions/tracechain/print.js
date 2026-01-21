window.browser = window.browser || window.chrome;

browser.runtime.sendMessage({ type: "GET_DAY" }, ({ visits, edges }) => {
	if (!visits.length) {
		document.body.innerHTML = "<p>No data for today.</p>";
		return;
	}
	const fmt = (d) =>
		new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	/*  date */
	document.getElementById("date").textContent = new Date(
		visits[0].t,
	).toLocaleDateString();

	/* timeline table */
	const tb = document.querySelector("#timelineTbl tbody");
	// biome-ignore lint/complexity/noForEach: <explanation>
	visits.forEach((v) => {
		const tr = document.createElement("tr");
		tr.innerHTML = `<td>${fmt(v.t)}</td><td>${new URL(v.url).hostname.replace(/^www\./, "")}</td>`;
		tb.appendChild(tr);
	});

	const stats = buildStats(visits, edges);
	const grid = document.getElementById("statsGrid");
	// biome-ignore lint/complexity/noForEach: <explanation>
	stats.forEach((s) => {
		const m = s.match(/^(.*?): (.*)$/);
		grid.innerHTML += `<div class="stat"><strong>${m ? m[2] : s}</strong>${m ? m[1] : ""}</div>`;
	});

	drawGraph(document.getElementById("g"), visits, edges);

	/* auto-print after a tick */
	setTimeout(() => window.print(), 600);
});

function buildStats(vis, edg) {
	const host = (u) => new URL(u).hostname.replace(/^www\./, "");
	const counts = {};
	// biome-ignore lint/complexity/noForEach: <explanation>
	// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
	vis.forEach((v) => (counts[host(v.url)] = (counts[host(v.url)] || 0) + 1));
	const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || ["—", 0];
	const span = Math.round((vis.at(-1).t - vis[0].t) / 60000);
	let dwell = 0;
	for (let i = 0; i < vis.length - 1; i++)
		if (vis[i].tabId === vis[i + 1].tabId) dwell += vis[i + 1].t - vis[i].t;
	dwell = Math.round(dwell / 60000);
	let longest = 1;
	let c = 1;
	for (let i = 1; i < vis.length; i++) {
		c = vis[i].tabId === vis[i - 1].tabId ? c + 1 : 1;
		longest = Math.max(longest, c);
	}
	const link = vis.filter((v) => v.type === "link").length;
	const typed = vis.filter((v) => v.type === "typed").length;
	const search = vis.filter((v) => /google|duck|bing/.test(v.url)).length;
	return [
		`Pages visited: ${vis.length}`,
		`Unique domains: ${Object.keys(counts).length}`,
		`Tabs opened: ${new Set(vis.map((v) => v.tabId)).size}`,
		`Top domain: ${top[0]} (${top[1]} hits)`,
		`Browsing span: ${span} min`,
		`Est. on-page time: ${dwell} min`,
		`Link navigations: ${link}`,
		`Typed URLs: ${typed}`,
		`Search hits: ${search}`,
		`Edges logged: ${edg.length}`,
		`Longest same-tab chain: ${longest} pages`,
	];
}
