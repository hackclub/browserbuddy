const storageAPI = chrome.storage;
const api = chrome;

function getDomain(url) {
	try {
		return new URL(url).hostname.replace("www.", "").split(".").slice(-2).join(".");
	} catch (e) {
		return null;
	}
}

function checkDomain(tabId, url) {
	if (url.startsWith("chrome-extension://") || url.startsWith("chrome://")) return console.log("Tab-buse: Ignoring extension page");

	const domain = getDomain(url);
	if (!domain) return;

	storageAPI.local.get(["categorizedDomains", "ignoredDomains"], (data) => {
		const categorized = data.categorizedDomains || {};
		const ignored = data.ignoredDomains || {};

		if (categorized[domain] || ignored[domain]) return;

		promptUserToCategorize(tabId, domain);
	});
}

function promptUserToCategorize(tabId, domain) {
	// chrome.scripting.executeScript({
	// 	target: { tabId },
	// 	function: showCategorizationPromptUI,
	// 	args: [domain]
	// });

	chrome.scripting.executeScript({
		target: { tabId: tabId },
		func: showCategorizationPromptUI,
		args: [domain]
	}).catch((err) => {
		console.error("Error injecting script: ", err);
	})
}

function showCategorizationPromptUI(domain) {
	// Check if a prompt already exists
	if (document.getElementById("tabbuse-prompt")) return;

	// Create the popup container
	const popup = document.createElement("div");
// 	popup.innerHTML = ```
// <link rel="preconnect" href="https://fonts.googleapis.com">
// <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
// <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet">```;

	const fontLink = document.createElement("div");
	fontLink.innerHTML = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Open+Sans:wght@300..800&display=swap" rel="stylesheet">`;
	document.head.appendChild(fontLink);

	popup.id = "tabbuse-prompt";
	popup.style.position = "fixed";
	popup.style.top = "10px";
	popup.style.right = "10px";
	popup.style.background = "lightgray";
	popup.style.border = "2px solid #333";
	popup.style.borderRadius = "10px";
	popup.style.boxShadow = "10px 4px 6px rgba(0,0,0,1)";
	popup.style.fontFamily = "\"Inter\", Calibri, Verdana, Arial, sans-serif";
	popup.style.paddingTop = "30px";
	popup.style.paddingBottom = "30px";
	popup.style.paddingLeft = "20px";
	popup.style.paddingRight = "40px";
	popup.style.maxWidth = "30%";
	popup.style.zIndex = "9999";
	popup.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.1)";
	popup.style.color = "black !important";

	// Title
	popup.innerHTML += `<strong style="color: black; font-size: 30px; margin-bottom: 10px;">Categorize ${domain}</strong></h1><br><br>`;

	// Dropdown for existing categories
	const categorySelect = document.createElement("select");
	categorySelect.innerHTML = `<option value="">-- Select Category --</option>`;
	categorySelect.style.color = "black";
	categorySelect.style.padding = "5px";
	categorySelect.style.marginTop = "5px";

	// Fetch existing categories from storage
	chrome.storage.local.get(["categorizedDomains"], (data) => {
		const categories = new Set(Object.values(data.categorizedDomains || {}));
		categories.forEach(cat => {
			const option = document.createElement("option");
			option.value = cat;
			option.textContent = cat;
			option.style.color = "black";
			categorySelect.appendChild(option);
		});
	});

	popup.appendChild(categorySelect);
	popup.appendChild(document.createElement("br"));

	// Input for new category
	const categoryInput = document.createElement("input");
	categoryInput.type = "text";
	categoryInput.placeholder = "Or enter a new category";
	categoryInput.style.color = "gray";
	categoryInput.style.border = "none";
	categoryInput.style.borderBottom = "2px solid deepskyblue";
	categoryInput.style.backgroundColor = "lightgray";
	categoryInput.style.padding = "5px";
	categoryInput.style.marginTop = "7px";
	categoryInput.style.marginBottom = "7px";
	popup.appendChild(categoryInput);
	popup.appendChild(document.createElement("br"));

	// "Never ask again" checkbox
	const neverAskCheckbox = document.createElement("input");
	neverAskCheckbox.type = "checkbox";
	neverAskCheckbox.id = "never-ask-again";
	neverAskCheckbox.style.marginTop = "5px";
	neverAskCheckbox.style.cursor = "pointer";
	neverAskCheckbox.style.color = "black";

	const label = document.createElement("label");
	label.textContent = " Never ask again";
	label.htmlFor = "never-ask-again";
	label.style.marginLeft = "5px";
	label.style.color = "black";
	label.style.marginBottom = "10px";

	popup.appendChild(neverAskCheckbox);
	popup.appendChild(label);
	popup.appendChild(document.createElement("br"));

	// Save button
	const saveButton = document.createElement("button");
	saveButton.textContent = "Save";
	saveButton.style.marginTop = "5px";
	saveButton.style.cursor = "pointer";
	saveButton.style.color = "black";
	saveButton.style.backgroundColor = "deepskyblue";
	saveButton.style.border = "none";
	saveButton.style.padding = "5px 15px";
	saveButton.style.borderRadius = "5px";
	saveButton.style.marginRight = "5px";
	popup.appendChild(saveButton);

	// Cancel button
	const cancelButton = document.createElement("button");
	cancelButton.textContent = "Cancel";
	cancelButton.style.marginTop = "5px";
	cancelButton.style.marginLeft = "5px";
	cancelButton.style.cursor = "pointer";
	cancelButton.style.color = "black";
	cancelButton.style.backgroundColor = "deepskyblue";
	cancelButton.style.border = "none";
	cancelButton.style.padding = "5px 15px";
	cancelButton.style.borderRadius = "5px";
	cancelButton.style.marginRight = "5px";
	popup.appendChild(cancelButton);

	document.body.appendChild(popup);

	// Handle Save
	saveButton.addEventListener("click", () => {
		const selectedCategory = categorySelect.value;
		const newCategory = categoryInput.value.trim();
		const neverAskAgain = neverAskCheckbox.checked;

		chrome.storage.local.get(["categorizedDomains", "ignoredDomains"], (data) => {
			let categorized = data.categorizedDomains || {};
			let ignored = data.ignoredDomains || {};

			if (newCategory) {
				categorized[domain] = newCategory;
			} else if (selectedCategory) {
				categorized[domain] = selectedCategory;
			} else if (neverAskAgain) {
				ignored[domain] = true;
			}

			chrome.storage.local.set({ categorizedDomains: categorized, ignoredDomains: ignored }, () => {
				console.log(`Successfully categorized ${domain}`);
			});
		});

		popup.remove();
	});

	// Handle Cancel
	cancelButton.addEventListener("click", () => popup.remove());
}

function addTabListeners() {
	chrome.tabs.onCreated.addListener((tab) => {
		checkDomain(tab.id, tab.url);
	});

	chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
		if (changeInfo.url) checkDomain(tabId, changeInfo.url);
	});
}

addTabListeners();