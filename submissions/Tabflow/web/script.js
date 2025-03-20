// Store the original index of all the open tabs,
// so when you add them back to the all tabs list, they're in their original order
const ogIndexMap = new Map();
const allTabsList = document.getElementById("all-tabs-list");
const moveToWindowList = document.getElementById("move-to-window-list");

// Display all open tabs in the "All Tabs" list, except for this tab (Tabflow GUI)
async function displayTabs() {
  const tabs = await chrome.tabs.query({});
  const allTabsList = document.getElementById("all-tabs-list");

  for (const tab of tabs) {
    if (tab.url !== chrome.runtime.getURL("web/index.html")) {
      // list element
      const listItem = document.createElement("li");
      listItem.dataset.tabId = tab.id;
      listItem.dataset.windowId = tab.windowId;

      // Tab Favicon
      const favicon = document.createElement("img");
      favicon.src = tab.favIconUrl || "icons/missing-favicon.png";
      favicon.alt = "Favicon";

      // Tab name
      const title = document.createElement("span");
      title.textContent = tab.title;
      title.className = "title";

      // Add a little plus icon to signify that the tabs can be added to the other list.
      const plusIcon = document.createElement("img");
      plusIcon.src = "icons/plus.png";
      plusIcon.alt = "";
      plusIcon.style.marginLeft = "8px"; // TODO: put this in styles.css
      plusIcon.style.flexShrink = "0";

      listItem.appendChild(favicon);
      listItem.appendChild(title);
      listItem.appendChild(plusIcon);
      allTabsList.appendChild(listItem);
    }
  }
}

// Move a tab to the "Move to this Window" list
function moveTabToWindowList(tabElement) {
  // Store the original index of the tab in the map
  const originalIndex = Array.from(allTabsList.children).indexOf(tabElement);
  ogIndexMap.set(tabElement.dataset.tabId, originalIndex);

  // Remove the tab from the All Tabs list
  allTabsList.removeChild(tabElement);

  // Add the tab to the "Move to this Window" list
  const newListItem = tabElement.cloneNode(true);

  // Remove the plus icon from the tab
  const plusIcon = newListItem.querySelector("img[src*='plus.png']")
  if (plusIcon)
    newListItem.removeChild(plusIcon);

  // Prefix the order number in front of the tab (the order that the tabs will be moved to the window)
  const number = document.createElement("span");
  number.className = "number";
  number.textContent = moveToWindowList.children.length + 1;
  newListItem.insertBefore(number, newListItem.firstChild); // Organization :)

  // Add a back icon to move it out of the ordered list.
  const backButton = document.createElement("button");
  const backIcon = document.createElement("img");
  backIcon.src = "icons/back.png";
  backIcon.alt = "Back";
  backButton.appendChild(backIcon);
  //For each back button add the functionality for it to be added back at the list.
  backButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent the click from affecting the tab list element
    moveToWindowList.removeChild(newListItem);
    // Add the tab back to its original position in the "All Tabs" list
    const originalIndex = ogIndexMap.get(tabElement.dataset.tabId);
    if (originalIndex !== undefined) {
      allTabsList.insertBefore(tabElement, allTabsList.children[originalIndex]);
    } else {
      allTabsList.appendChild(tabElement);
    }

    updateMoveButton();
    updateNumbers();
  });

  newListItem.appendChild(backButton);
  moveToWindowList.appendChild(newListItem);
  updateMoveButton();
}

// Update the "Move X tabs" button text after adding or removing a tab to the queue
function updateMoveButton() {
  const moveButton = document.getElementById("move-tabs-button");
  moveButton.textContent = `Move ${moveToWindowList.children.length} tabs`;
}

// Update the order of the tabs in the queue
function updateNumbers() {
  const children = Array.from(moveToWindowList.children);

  for (let index = 0; index < children.length; index++) {
    const item = children[index];
    item.querySelector("span").textContent = index + 1;
  }
}

// Move the selected tabs to the current window
async function moveTabsToCurrentWindow() {
  const children = Array.from(moveToWindowList.children);
  const tabIds = [];

  // set the tab IDs of all the tabs in the queue to be moved.
  for (const item of children) {
    tabIds.push(item.dataset.tabId);
  }

  // Move tabs
  for (const tabId of tabIds) {
    await chrome.tabs.move(parseInt(tabId), {
      windowId: chrome.windows.WINDOW_ID_CURRENT,
      index: -1,
    });
  }

  // Close the extension tab after moving the tabs
  const currentTab = await chrome.tabs.getCurrent();
  if (currentTab) chrome.tabs.remove(currentTab.id);
}

// Initialize the webpage
document.addEventListener("DOMContentLoaded", () => {
  displayTabs();

  // Add click event listeners to the "All Tabs" list items
  allTabsList.addEventListener("click", (event) => {
    // Check if the clicked element is a 'li' or any of its child elements (Favicon, tab name)
    if (event.target.closest("li")) {
      // This allows the user to press on the list item anywhere (without making a dedicated button)
      moveTabToWindowList(event.target.closest("li"));
    }
  });

  // Add the event listener to the "Move X tabs" button
  const moveButton = document.getElementById("move-tabs-button");
  moveButton.addEventListener("click", moveTabsToCurrentWindow);
});
