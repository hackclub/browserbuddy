function drawGraph(svg, visits = [], edges = []) {
	svg.innerHTML = "";
	if (!edges.length) return;

	const VB = svg.viewBox.baseVal;
	const W = VB?.width ? VB.width : svg.clientWidth || 800;
	const H = VB?.height ? VB.height : svg.clientHeight || 450;

	const host = (u) => new URL(u).hostname.replace(/^www\./, "");

	const counts = {};
	// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
	// biome-ignore lint/complexity/noForEach: <explanation>
	visits.forEach((v) => (counts[host(v.url)] = (counts[host(v.url)] || 0) + 1));

	// Ensure every edge endpoint is represented even if count==0
	// biome-ignore lint/complexity/noForEach: <explanation>
	edges.forEach((e) => {
		// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
		// biome-ignore lint/complexity/noForEach: <explanation>
		[host(e.from), host(e.to)].forEach((h) => (counts[h] ??= 0));
	});

	const nodes = Object.fromEntries(
		Object.entries(counts).map(([h, n]) => [
			h,
			{ id: h, count: n, x: 0, y: 0, vx: 0, vy: 0 },
		]),
	);
	const nodeArr = Object.values(nodes);

	const rand01 = (str) => {
		let h = 2166136261 >>> 0;
		for (let i = 0; i < str.length; i++)
			h = Math.imul(h ^ str.charCodeAt(i), 16777619);
		return (h >>> 0) / 2 ** 32; // 0‥1
	};
	const R0 = 0.35 * Math.min(W, H);
	// biome-ignore lint/complexity/noForEach: <explanation>
	nodeArr.forEach((n) => {
		const a = 2 * Math.PI * rand01(n.id);
		n.x = W / 2 + Math.cos(a) * R0;
		n.y = H / 2 + Math.sin(a) * R0;
	});

	/* ---------- toy force sim ---------- */
	const ideal = 140;
	const steps = 350;
	const repelC = ideal ** 2 / 4;
	for (let s = 0; s < steps; s++) {
		// repulsion
		for (let i = 0; i < nodeArr.length; i++)
			for (let j = i + 1; j < nodeArr.length; j++) {
				const a = nodeArr[i];
				const b = nodeArr[j];
				let dx = a.x - b.x;
				let dy = a.y - b.y;
				const dist = Math.hypot(dx, dy) || 1e-6;
				const rep = repelC / dist;
				dx /= dist;
				dy /= dist;
				a.vx += dx * rep;
				a.vy += dy * rep;
				b.vx -= dx * rep;
				b.vy -= dy * rep;
			}
		// attraction
		// biome-ignore lint/complexity/noForEach: <explanation>
		edges.forEach(({ from, to }) => {
			const a = nodes[host(from)];
			const b = nodes[host(to)];
			if (!a || !b) return;
			let dx = a.x - b.x;
			let dy = a.y - b.y;
			const dist = Math.hypot(dx, dy) || 1e-6;
			const k = (dist - ideal) * 0.08;
			dx /= dist;
			dy /= dist;
			a.vx -= dx * k;
			a.vy -= dy * k;
			b.vx += dx * k;
			b.vy += dy * k;
		});
		// integrate + damp
		// biome-ignore lint/complexity/noForEach: <explanation>
		nodeArr.forEach((n) => {
			n.vx *= 0.6;
			n.vy *= 0.6;
			n.x = Math.min(W - 30, Math.max(30, n.x + n.vx * 0.02));
			n.y = Math.min(H - 30, Math.max(30, n.y + n.vy * 0.02));
		});
	}

	/* ---------- draw ---------- */
	const $ = (tag, attr) => {
		const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
		for (const k in attr) e.setAttribute(k, attr[k]);
		return e;
	};

	// biome-ignore lint/complexity/noForEach: <explanation>
	edges.forEach(({ from, to }) => {
		const a = nodes[host(from)];
		const b = nodes[host(to)];
		if (a && b)
			svg.appendChild(
				$("line", {
					x1: a.x,
					y1: a.y,
					x2: b.x,
					y2: b.y,
					stroke: "#bbb",
					"stroke-width": 1,
				}),
			);
	});

	// biome-ignore lint/complexity/noForEach: <explanation>
	nodeArr.forEach((n) => {
		const r = 14 + Math.log2(n.count + 1) * 6;
		svg.appendChild($("circle", { cx: n.x, cy: n.y, r, fill: "#4da3ff" }));

		const txt = $("text", {
			x: n.x,
			y: n.y + 4,
			fill: "#fff",
			"text-anchor": "middle",
		});
		const label = n.id.length > 18 ? `${n.id.slice(0, 16)}…` : n.id;
		const fs = Math.min(12, ((r - 3) * 2) / label.length + 4); // heuristic
		txt.setAttribute("font-size", fs.toFixed(1));
		txt.textContent = label;
		svg.appendChild(txt);
	});
}
