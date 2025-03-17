// Add styles for floating modal
const style = document.createElement("style");
style.textContent = `
    .floating-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #FFF;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
        z-index: 10000;
    }
    .modal-content {
        text-align: center;
    }
    button {
        margin: 5px;
    }
`;

const overThirtyTabs = [
	"Your browser has more tabs open than your brain has functioning neurons. Close some before your computer files a restraining order.",
	"Are you running a NASA mission, or just too lazy to bookmark? Your RAM is sobbing in the corner.",
	"Your browser is one bad refresh away from a full-blown midlife crisis. Let it breathe, dude.",
	"Why do you even have a search bar? You clearly believe in never finding anything again.",
	"At this point, your browser isn’t opening pages, it’s assembling an encyclopedia that nobody asked for.",
	"NASA called. They said even their supercomputers can’t handle this level of chaos.",
	"You have more tabs open than a conspiracy theorist with a Red Bull addiction. Seek help.",
	"Your computer fans are working harder than you. Close some tabs before your laptop turns into a space heater.",
	"Congratulations! You’ve successfully turned your browser into a digital landfill. Hope you enjoy digging for that one tab from last Tuesday.",
	"You’ve got more tabs than a hoarder has expired coupons.",
	"If tabs were brain cells, you’d be a genius. Too bad none of them are actually useful.",
	"Even Google is judging you right now. And Google sees everything.",
	"You’re one tab away from being the person who accidentally starts a cyber apocalypse.",
	"Your browser is a digital manifestation of your life: chaotic, disorganized, and full of regret.",
	"You’re the reason the ‘close all tabs’ button was invented.",
	"I’ve seen cleaner disasters at nuclear waste sites. What are you even doing with this many tabs?",
	"You’ve got more tabs than the average office has excuses for not working.",
	"I’ve seen more organized chaos in a toddler’s toy bin than in your browser window"
];
const overTwentyTabs = [
	"Your tab bar is smaller than your attention span. Close some tabs before your browser files for divorce.",
	"How do you even function? Your tabs look like a digital hoarder’s wet dream.",
	"Your CPU just left a resignation letter. It refuses to work under these conditions.",
	"You’re one tab away from your browser spontaneously combusting. And honestly, I’d support it.",
	"Your search history must be a horror movie, but this tab list? This is the real nightmare.",
	"If I had to open as many tabs as you, I’d rather open my own grave.",
	"The only thing more chaotic than your tab list  is your decision-making process.",
	"How many tabs do you need open before you realize your brain is the one that’s frozen?",
	"Your browser’s memory is giving up on life because it can’t handle the weight of your bad choices.",
	"If you opened as many opportunities in life as you do tabs, maybe you’d have a career by now.",
	"You’re the human embodiment of ‘too many cooks in the kitchen’—except it’s just browser tabs, and none of them know what they’re doing.",
	"You’re the only person who needs a browser extension to remind you that you need help.",
	"You could probably launch a startup with the number of tabs you’ve got open, but it would crash faster than your attention span."
];
const tooFewTabs = [
	"Your browser’s looking a little empty. Did you forget how to internet, grandma?",
	"Your browser looks like a deserted wasteland—are you even using the internet, or just staring at the homepage?",
	"Your browser history must be the shortest story ever written.",
	"Are you afraid of commitment, or do you just not have enough thoughts to need multiple tabs?",
	"You have fewer tabs open than a tech-illiterate grandparent. Next step: asking how to copy and paste?",
	"Your browser’s emptier than a library on a Friday night. What are you even doing with your life?",
	"With so few tabs open, your computer must think it’s retired. Give it something to do before it starts collecting social security.",
	"Your browser’s emptier than a politician’s promises. What are you even doing with your life?",
	"Minimalist? More like mentally unprepared for anything beyond a single Google search.",
	"Your browser is so empty, even the ‘New Tab’ page looks bored.",
	"With so few tabs open, I bet you still type full URLs instead of using bookmarks.",
	"Are you really using the internet, or just giving your computer something to do between naps?",
	"Having this few tabs open should be a crime against curiosity.",
	"With that few tabs, you must be one of those people who actually closes their apps instead of letting them pile up.",
	"Blink twice if you don’t know what Ctrl+T does."
];
const shoppingRoasts = [
	"How many tabs does it take for you to realize that your shopping cart isn’t a personal achievement ?",
	"If your shopping tabs were any more stacked, they’d need their own storage unit.",
	"Your browser’s been open longer than those ‘limited-time offers’ you’ve been ignoring.",
	"Your tabs are like a digital shopping cart that’s been abandoned in the middle of the store.",
	"Your browser’s got more tabs than a shopping mall on Black Friday.",
];
const entertainmentRoasts = [
	"You have more tabs dedicated to streaming shows than Netflix has original content.",
	"Your tabs are like a digital library that nobody asked for.",
	"At this point, your browser is just a digital theater showing a never-ending rerun of your procrastination.",
	"Do you have tabs open for every season of every show, or are you just pretending to catch up on life?"
];
const productivityRoasts = [
	"You’re the kind of person who opens 12 tabs to organize their life and ends up only organizing procrastination.",
	"Your tabs are like a digital to-do list that’s been ignored for weeks.",
	"Your productivity tabs are the digital equivalent of making a to-do list and never crossing anything off.",
	"How do you keep track of all those productivity tabs? Are you hoping one will finally organize your life for you?",
	"If your work tabs were a project, they’d be the never-ending draft.",
	"I’m impressed by how your browser can multitask—but maybe you should, too."
];
const socialRoasts = [
	"I’m surprised your browser hasn’t started sending you ‘Are you still there?’ messages for all those social media tabs.",
	"You’ve got enough tabs open for Instagram, Twitter, and Facebook to have a reunion.",
	"How many tabs do you need to scroll through before realizing you’re just hiding from real life behind memes?"
];

var systemPage = false;

function detectSystemPage(url) {
	if (url.startsWith("about:") || url.startsWith("chrome-extension://") || url.startsWith("chrome://")) return true;
	return false;
}

function capitalizeFirstLetter(val) {
	return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function categorizeTabs() {
	const tabsAPI = chrome.tabs; // For Firefox

	tabsAPI.query({}, (tabs) => {
		// Get all categorized domains from storage
		chrome.storage.local.get(["categorizedDomains"], (data) => {
			const categorized = data.categorizedDomains || {};
			const categorizedTabs = {};
			const uncategorizedTabs = [];

			tabs.forEach((tab) => {
				if (tab.url.startsWith("about:") || tab.url.startsWith("moz-extension://")) return systemPage = true;
				let domain = getDomain(tab.url);
				const category = categorized[domain] || "Miscellaneous";

				// if (domain == "" || domain === " ") domain = "Browser tab";

				if (categorizedTabs[category]) categorizedTabs[category].push(domain);
				else categorizedTabs[category] = [domain];

				if (!categorized[domain]) {
					uncategorizedTabs.push(domain);
				}
			});

			// Show roast text based on the categorized tabs
			showRoast(categorizedTabs, uncategorizedTabs.length);

			// Show the number of open tabs
			showTabCount(tabs.length);

			// Show category breakdown
			showCategoryBreakdown(categorizedTabs);

			// Generate roast
			generateRoast(categorizedTabs, tabs.length);
		});

		chrome.storage.local.get(["ignoredDomains"], (data) => {
			const ignored = data.ignoredDomains || {};
			const ignoredList = document.getElementById("ignored-list");
			ignoredList.innerHTML = "";

			Object.keys(ignored).forEach((domain) => {
				const listItem = document.createElement("div");

				const checkbox = document.createElement("input");
				checkbox.type = "checkbox";
				checkbox.value = domain;

				listItem.appendChild(checkbox);
				listItem.appendChild(document.createTextNode(domain));
				ignoredList.appendChild(listItem);
			});

			document.getElementById("toggle-ignored").addEventListener("click", () => {
				toggleIgnoredDomains();
			});

			const unignoreButton = document.createElement("button");
			unignoreButton.textContent = "Unignore selected domains";
			unignoreButton.style.marginTop = "10px";
			ignoredList.appendChild(unignoreButton);
			unignoreButton.addEventListener("click", () => {
				unignoreSelectedDomains();
			});
		});
	});
}

// Function to get domain from URL
function getDomain(url) {
	try {
		return new URL(url).hostname.replace("www.", "").split(".").slice(-2).join("."); // Normalize domain
	} catch (e) {
		return null;
	}
}

// Function to show the roast text
function showRoast(categorizedTabs, uncategorizedCount) {
	let roastText = "Your tabs are categorized as:";
	for (let category in categorizedTabs) {
		roastText += `<br>${category}: ${categorizedTabs[category].length} tab(s)`;
	}

	if (uncategorizedCount > 0) roastText += `<br>Uncategorized tabs: ${uncategorizedCount}<br><br>`;

	document.getElementById("stats").innerHTML = roastText;
}

// Function to display the tab count
function showTabCount(tabCount) {
	document.getElementById("tab-count").textContent = `Total tabs open: ${tabCount}`;
}

// Function to show the category breakdown
function showCategoryBreakdown(categorizedTabs) {
	const breakdownListElement = document.getElementById("breakdown-list");
	const categoryBreakdownElement = document.getElementById("category-breakdown");

	categoryBreakdownElement.addEventListener("click", () => {
		breakdownListElement.style.display = breakdownListElement.style.display === "none" ? "block" : "none";
	});

	let numEachDomain = {};
	
	let categoryListHtml = "";
	for (let category in categorizedTabs) {
		categorizedTabs[category].forEach((domain) => {
			if (numEachDomain[domain]) numEachDomain[domain]++;
			else numEachDomain[domain] = 1;
		});

		categoryListHtml += `<div><strong>${category}</strong></div>`;
		Object.keys(numEachDomain).forEach(domain => {
			categoryListHtml += `<div style="margin-left: 20px;">${domain} (${numEachDomain[domain]})</div>`;
		});

		numEachDomain = {};
	}

	breakdownListElement.innerHTML = categoryListHtml;
}

function loadCategories() {
	chrome.storage.local.get(["categorizedDomains"], (data) => {
		const categorized = data.categorizedDomains || {};
		const categoryList = document.getElementById("category-list");
		categoryList.innerHTML = ""; // Clear previous list

		const categories = [];
		for (const [domain, category] of Object.entries(categorized)) {
			if (!categories.includes(category)) {
				categories.push(category);
			}
		}

		let activeButtonsContainer = null;

		categories.forEach(category => {
			const categoryItem = document.createElement("div");
			categoryItem.classList.add("category-item");
			categoryItem.textContent = category;
			categoryItem.style.textDecoration = "underline";
			categoryItem.style.textDecorationColor = "blue";
			categoryList.appendChild(categoryItem);

			// Buttons container
			const buttonsContainer = document.createElement("div");
			buttonsContainer.style.display = "none";

			// Edit Button
			const editButton = document.createElement("button");
			editButton.textContent = "Edit";
			editButton.addEventListener("click", () => showEditCategoryUI(category));

			// Delete Button
			const deleteButton = document.createElement("button");
			deleteButton.textContent = "Delete";
			deleteButton.addEventListener("click", () => showDeleteCategoryUI(category));

			buttonsContainer.appendChild(editButton);
			buttonsContainer.appendChild(deleteButton);
			categoryItem.appendChild(buttonsContainer);

			categoryItem.addEventListener("click", () => {
				if (activeButtonsContainer && activeButtonsContainer !== buttonsContainer) {
					activeButtonsContainer.style.display = "none";
				}
				buttonsContainer.style.display = buttonsContainer.style.display === "none" ? "block" : "none";
				activeButtonsContainer = buttonsContainer.style.display === "block" ? buttonsContainer : null;
			});

		});
	});
}

function createFloatingModal(content) {
	const modal = document.createElement("div");
	modal.classList.add("floating-modal");
	modal.innerHTML = `<div class='modal-content'>${content}</div>`;
	document.body.appendChild(modal);
	return modal;
}

function showDeleteCategoryUI(category) {
	const modal = createFloatingModal(`
        <p>Are you sure you want to delete the category '${category}'? This will remove all associated domains.</p>
        <button id='confirm-delete'>Yes</button>
        <button id='cancel-delete'>No</button>
    `);

	document.getElementById("confirm-delete").addEventListener("click", () => {
		deleteCategory(category);
		modal.remove();
	});

	document.getElementById("cancel-delete").addEventListener("click", () => {
		modal.remove();
	});
}

function deleteCategory(category) {
	chrome.storage.local.get(["categorizedDomains"], (data) => {
		let categorized = data.categorizedDomains || {};

		for (const domain in categorized) {
			if (categorized[domain] === category) {
				delete categorized[domain];
			}
		}

		chrome.storage.local.set({ categorizedDomains: categorized }, () => {
			loadCategories(); // Refresh UI
		});
	});
}

function showEditCategoryUI(category, domains) {
	const modal = createFloatingModal(`
        <p>Enter a new name for the category '${category}':</p>
        <input type='text' id='new-category-name' value='${category}' />
        <button id='confirm-edit'>Save</button>
        <button id='cancel-edit'>Cancel</button>
    `);

	document.getElementById("confirm-edit").addEventListener("click", () => {
		const newCategory = document.getElementById("new-category-name").value.trim();
		if (newCategory) {
			editCategory(category, domains, newCategory);
			modal.remove();
		}
	});

	document.getElementById("cancel-edit").addEventListener("click", () => {
		modal.remove();
	});
}

function editCategory(category, domains, newCategory) {
	chrome.storage.local.get(["categorizedDomains"], (data) => {
		let categorized = data.categorizedDomains || {};

		for (const domain of domains) {
			categorized[domain] = newCategory;
		}

		chrome.storage.local.set({ categorizedDomains: categorized }, () => {
			loadCategories(); // Refresh UI
		});
	});
}

function toggleIgnoredDomains() {
	const ignoredList = document.getElementById("ignored-list");
	ignoredList.style.display = ignoredList.style.display === "none" ? "block" : "none";
}

function unignoreSelectedDomains() {
	chrome.storage.local.get(["ignoredDomains"], (data) => {
		const ignored = data.ignoredDomains || {};
		const ignoredList = document.getElementById("ignored-list");
		const checkboxes = ignoredList.querySelectorAll("input[type='checkbox']:checked");
		checkboxes.forEach((checkbox) => {
			const domain = checkbox.value;
			delete ignored[domain];
		});

		chrome.storage.local.set({ ignoredDomains: ignored }, () => {
			categorizeTabs();
		});
	});
}

function updateCurrentTabSection() {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs.length === 0) return;
		const currentTab = tabs[0];
		const domain = getDomain(currentTab.url);

		if (detectSystemPage(currentTab.url)) {
			document.getElementById("current-tab-category").textContent = "This is a system or extension page, which cannot be categorized";
			document.getElementById("current-tab-categorization-changes").style.display = "none";
			return;
		}

		chrome.storage.local.get(["categorizedDomains"], (data) => {
			const categorized = data.categorizedDomains || {};
			const category = categorized[domain] || "Uncategorized";
			document.getElementById("current-tab-category").textContent = category === "Uncategorized" ? `${capitalizeFirstLetter(domain)} is not categorized` : `${capitalizeFirstLetter(domain)} is categorized as ${category}`;

			// Populate the category dropdown
			const categorySelect = document.getElementById("category-dropdown");
			categorySelect.innerHTML = "<option value=''>-- Select Category --</option>";

			const uniqueCategories = new Set(Object.values(categorized));
			uniqueCategories.forEach((category) => {
				const option = document.createElement("option");
				option.value = category;
				option.textContent = category;
				categorySelect.appendChild(option);
			});
		});

		document.getElementById("change-category").addEventListener("click", () => {
			changeCurrentTabCategory();
		});
		document.getElementById("uncategorize-tab").addEventListener("click", () => {
			uncategorizeCurrentTab();
		});
	});
}

function changeCurrentTabCategory() {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs.length === 0) return;
		const currentTab = tabs[0];
		const domain = getDomain(currentTab.url);
		const newCategory = document.getElementById("new-category-input").value.trim();
		const selectedCategory = document.getElementById("category-dropdown").value;

		const finalCategory = newCategory || selectedCategory;

		if (finalCategory) {
			chrome.storage.local.get(["categorizedDomains"], (data) => {
				let categorized = data.categorizedDomains || {};
				categorized[domain] = finalCategory;

				chrome.storage.local.set({ categorizedDomains: categorized }, () => {
					updateCurrentTabSection(); // Refresh UI
				});
			});
		}
	});
}

function uncategorizeCurrentTab() {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs.length === 0) return;
		const currentTab = tabs[0];
		const domain = getDomain(currentTab.url);

		chrome.storage.local.get(["categorizedDomains"], (data) => {
			let categorized = data.categorizedDomains || {};
			if (categorized[domain]) {
				delete categorized[domain];
			}

			chrome.storage.local.set({ categorizedDomains: categorized }, () => {
				updateCurrentTabSection(); // Refresh UI
			});
		});
	});
}

function generateRoast(categorizedTabs, numTabs) {
	let roast = "";
	let categoryCounts = Object.entries(categorizedTabs).map(([category, domains]) => ({ category, count: domains.length }));

	if (categoryCounts.length === 0) return document.getElementById("roast").innerHTML = "Not one single categorized tab? How uncivilized.";

	categoryCounts.sort((a, b) => b.count - a.count);
	let mostCommon = categoryCounts[0].category.toLowerCase().includes("misc") ? categoryCounts[1] : categoryCounts[0];

	let finalistRoasts = [];

	if (!mostCommon) return document.getElementById("roast").innerHTML = "Not one single categorized tab? How uncivilized.";

	if (numTabs > 30) finalistRoasts.push(overThirtyTabs[Math.floor(Math.random() * overThirtyTabs.length)]);
	else if (numTabs > 20) finalistRoasts.push(overTwentyTabs[Math.floor(Math.random() * overTwentyTabs.length)]);

	if (numTabs < 5) finalistRoasts.push(tooFewTabs[Math.floor(Math.random() * tooFewTabs.length)]);

	if (mostCommon.category.toLowerCase().includes("shop")) finalistRoasts.push(shoppingRoasts[Math.floor(Math.random() * shoppingRoasts.length)]);
	else if (mostCommon.category.toLowerCase().includes("tertainment")) finalistRoasts.push(entertainmentRoasts[Math.floor(Math.random() * entertainmentRoasts.length)]);
	else if (mostCommon.category.toLowerCase().includes("roductiv")) finalistRoasts.push(productivityRoasts[Math.floor(Math.random() * productivityRoasts.length)]);
	else if (mostCommon.category.toLowerCase().includes("ocial")) finalistRoasts.push(socialRoasts[Math.floor(Math.random() * socialRoasts.length)]);

	let roastWinner = finalistRoasts.length > 0 ? finalistRoasts[Math.floor(Math.random() * finalistRoasts.length)] : "Congratulations! Somehow, I can't seem to find a way to roast you. You're either too organized or too chaotic. Either way, you win. (Try categorizing more tabs)";
	roast += roastWinner;

	document.getElementById("roast").innerHTML = roast;
}


document.addEventListener("DOMContentLoaded", () => {
	// Floating modal style
	document.head.appendChild(style);

	loadCategories();

	// When the popup is opened, categorize tabs and show the UI
	categorizeTabs();

	updateCurrentTabSection();
});