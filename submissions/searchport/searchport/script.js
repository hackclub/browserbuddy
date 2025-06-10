document.addEventListener("DOMContentLoaded", () => {
	const container = document.querySelector(".container");
	const addButton = document.querySelector(".add-button");
	const modal = document.querySelector(".modal");
	const overlay = document.querySelector(".overlay");
	const addCustomBtn = document.getElementById("addCustom");
	const cancelCustomBtn = document.getElementById("cancelCustom");

	const searchEngines = {
		google: {
			name: "Google",
			url: "https://www.google.com/search?q=%s",
			icon: "https://www.google.com/favicon.ico",
		},
		youtube: {
			name: "YouTube",
			url: "https://www.youtube.com/results?search_query=%s",
			icon: "https://cdn3.iconfinder.com/data/icons/social-network-30/512/social-06-512.png",
		},
		twitter: {
			name: "Twitter",
			url: "https://twitter.com/search?q=%s",
			icon: "https://abs.twimg.com/responsive-web/client-web/icon-ios.b1fc727a.png",
		},
		github: {
			name: "GitHub",
			url: "https://github.com/search?q=%s",
			icon: "https://cdn-icons-png.flaticon.com/512/25/25231.png",
		},
		reddit: {
			name: "Reddit",
			url: "https://www.reddit.com/search/?q=%s",
			icon: "https://www.reddit.com/favicon.ico",
		},

		amazon: {
			name: "Amazon",
			url: "https://www.amazon.com/s?k=%s",
			icon: "https://www.amazon.com/favicon.ico",
		},
		wikipedia: {
			name: "Wikipedia",
			url: "https://en.wikipedia.org/wiki/Special:Search?search=%s",
			icon: "https://www.wikipedia.org/static/favicon/wikipedia.ico",
		},
		linkedin: {
			name: "LinkedIn",
			url: "https://www.linkedin.com/search/results/all/?keywords=%s",
			icon: "https://www.linkedin.com/favicon.ico",
		},

		netflix: {
			name: "Netflix",
			url: "https://www.netflix.com/search?q=%s",
			icon: "https://www.netflix.com/favicon.ico",
		},
		facebook: {
			name: "Facebook",
			url: "https://www.facebook.com/search/top/?q=%s",
			icon: "https://www.facebook.com/favicon.ico",
		},
	};

	// Load saved search boxes
	browser.storage.sync.get(["searchBoxes", "customEngines"], (result) => {
		const searchBoxes = result.searchBoxes || [];
		const customEngines = result.customEngines || {};

		Object.assign(searchEngines, customEngines);

		// biome-ignore lint/complexity/noForEach: kys
		searchBoxes.forEach((box) => createSearchBox(box.engine, box.position));
	});

	function createSearchBox(engine, position) {
		const searchBox = document.createElement("div");
		searchBox.className = "search-box";
		searchBox.dataset.engine = engine.name.toLowerCase();
		searchBox.innerHTML = `
            <div class="header">
                <img src="${engine.icon}" alt="${engine.name} icon" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔍</text></svg>'">
                <span>${engine.name}</span>
            </div>
            <input type="text" placeholder="Search ${engine.name}...">
            <div class="drag-hint">Drag to reposition</div>
        `;

		// random position
		if (!position) {
			const padding = 100;
			position = {
				x: padding + Math.random() * (window.innerWidth - 2 * padding - 400),
				y: padding + Math.random() * (window.innerHeight - 2 * padding - 100),
			};
		}

		searchBox.style.left = `${position.x}px`;
		searchBox.style.top = `${position.y}px`;

		// Dragging
		let isDragging = false;
		let currentX;
		let currentY;
		let initialX;
		let initialY;
		let xOffset = position.x;
		let yOffset = position.y;

		searchBox.addEventListener("mousedown", dragStart);
		document.addEventListener("mousemove", drag);
		document.addEventListener("mouseup", dragEnd);

		function dragStart(e) {
			if (e.target.tagName.toLowerCase() === "input") return;

			initialX = e.clientX - xOffset;
			initialY = e.clientY - yOffset;
			isDragging = true;

			searchBox.style.transition = "none";
		}

		function drag(e) {
			if (isDragging) {
				e.preventDefault();
				currentX = e.clientX - initialX;
				currentY = e.clientY - initialY;

				xOffset = currentX;
				yOffset = currentY;

				setTranslate(currentX, currentY, searchBox);
				saveSearchBoxPositions();
			}
		}

		function dragEnd(e) {
			initialX = currentX;
			initialY = currentY;
			isDragging = false;

			searchBox.style.transition = "all 0.2s ease";
		}

		function setTranslate(xPos, yPos, el) {
			el.style.left = `${xPos}px`;
			el.style.top = `${yPos}px`;
		}

		const input = searchBox.querySelector("input");
		input.addEventListener("keypress", (e) => {
			if (e.key === "Enter") {
				const query = encodeURIComponent(input.value);
				if (query) {
					window.location.href = engine.url.replace("%s", query);
				}
			}
		});
		searchBox.addEventListener("contextmenu", (e) => {
			e.preventDefault();
			showContextMenu(e, searchBox);
		});

		container.appendChild(searchBox);

		saveSearchBoxPositions();
	}
	function showContextMenu(e, searchBox) {
		const contextMenu = document.createElement("div");
		contextMenu.className = "context-menu";
		contextMenu.innerHTML = `
        <div class="context-menu-item"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_9_22)">
<path d="M1.75 3.49999H2.91667M2.91667 3.49999H12.25M2.91667 3.49999V11.6667C2.91667 11.9761 3.03958 12.2728 3.25838 12.4916C3.47717 12.7104 3.77391 12.8333 4.08333 12.8333H9.91667C10.2261 12.8333 10.5228 12.7104 10.7416 12.4916C10.9604 12.2728 11.0833 11.9761 11.0833 11.6667V3.49999M4.66667 3.49999V2.33332C4.66667 2.0239 4.78958 1.72716 5.00838 1.50837C5.22717 1.28957 5.52391 1.16666 5.83333 1.16666H8.16667C8.47609 1.16666 8.77283 1.28957 8.99162 1.50837C9.21042 1.72716 9.33333 2.0239 9.33333 2.33332V3.49999M5.83333 6.41666V9.91666M8.16667 6.41666V9.91666" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_9_22">
<rect width="14" height="14" fill="white"/>
</clipPath>
</defs>
</svg>
Delete</div>
    `;
		document.body.appendChild(contextMenu);

		contextMenu.style.top = `${e.clientY}px`;
		contextMenu.style.left = `${e.clientX}px`;

		contextMenu
			.querySelector(".context-menu-item")
			.addEventListener("click", () => {
				container.removeChild(searchBox);
				saveSearchBoxPositions();
				document.body.removeChild(contextMenu);
			});

		document.addEventListener(
			"click",
			() => {
				if (document.body.contains(contextMenu)) {
					document.body.removeChild(contextMenu);
				}
			},
			{ once: true },
		);
	}
	let saveTimeout;
	function saveSearchBoxPositions() {
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			const searchBoxes = Array.from(
				document.querySelectorAll(".search-box"),
			).map((box) => ({
				engine: searchEngines[box.dataset.engine],
				position: {
					x: Number.parseInt(box.style.left),
					y: Number.parseInt(box.style.top),
				},
			}));
			browser.storage.sync.set({ searchBoxes });
		}, 1000);
	}

	addButton.addEventListener("click", () => {
		modal.classList.add("active");
		overlay.classList.add("active");
	});

	overlay.addEventListener("click", () => {
		modal.classList.remove("active");
		overlay.classList.remove("active");
	});

	addCustomBtn.addEventListener("click", () => {
		const name = document.getElementById("engineName").value.trim();
		const url = document.getElementById("engineUrl").value.trim();
		const icon = document.getElementById("engineIcon").value.trim();

		if (name && url) {
			const engine = {
				name,
				url,
				icon:
					icon ||
					// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
					`data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔍</text></svg>`,
			};

			browser.storage.sync.get(["customEngines"], (result) => {
				const customEngines = result.customEngines || {};
				customEngines[name.toLowerCase()] = engine;
				browser.storage.sync.set({ customEngines });

				searchEngines[name.toLowerCase()] = engine;

				createSearchBox(engine);

				document.getElementById("engineName").value = "";
				document.getElementById("engineUrl").value = "";
				document.getElementById("engineIcon").value = "";

				modal.classList.remove("active");
				overlay.classList.remove("active");
			});
		}
	});

	cancelCustomBtn.addEventListener("click", () => {
		modal.classList.remove("active");
		overlay.classList.remove("active");
	});

	const searchEnginesGrid = document.querySelector(".search-engines-grid");
	// biome-ignore lint/complexity/noForEach: <explanation>
	Object.entries(searchEngines).forEach(([key, engine]) => {
		const option = document.createElement("div");
		option.className = "engine-option";
		option.innerHTML = `
            <img src="${engine.icon}" alt="${engine.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔍</text></svg>'">
            <span>${engine.name}</span>
        `;
		option.addEventListener("click", () => {
			createSearchBox(engine);
			modal.classList.remove("active");
			overlay.classList.remove("active");
		});
		searchEnginesGrid.appendChild(option);
	});
});
