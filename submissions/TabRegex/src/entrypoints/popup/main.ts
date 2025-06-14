import { CodeJar } from 'codejar';
import './style.css';
import { BundledLanguage, BundledTheme, createHighlighter, HighlighterGeneric } from 'shiki'
import { RequestType } from '@/utils/types';
import { Tabs } from 'wxt/browser';
let highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>;
; (async () => {
  highlighter = await createHighlighter({
    themes: [
      'github-dark-default',
      'github-light-default',
    ],
    langs: [
      'regexp'
    ],
  });

  // initial highlight, as codejar doesn't call highlight initially
  highlight(document.querySelector('#editor') as HTMLElement);
})();

function isDark(): Boolean {
  return window?.matchMedia?.('(prefers-color-scheme:dark)')?.matches ?? false;
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  highlight(document.querySelector('#editor') as HTMLElement);
});

function highlight(editor: HTMLElement) {
  let code = editor.textContent || "";
  code = highlighter.codeToHtml(code, {
    theme: isDark() ? "github-dark-default" : "github-light-default",
    lang: "regexp",
  });
  editor.innerHTML = new DOMParser().parseFromString(code, "text/html").querySelector(".shiki")?.innerHTML || "";
}

let jar = CodeJar(document.querySelector('#editor') as HTMLElement, highlight);
document.querySelector("#editor")?.addEventListener("keydown", async e => {
  if ((e as KeyboardEvent).key == "Enter") {
    e.preventDefault();
    e.stopPropagation();
    // send query to background script
    let tabs: Tabs.Tab[] = await browser.runtime.sendMessage({
      type: RequestType.QUERY_TABS,
    });
    populateUpdates(tabs, jar.toString());
  }
}, true);

document.querySelectorAll(".match").forEach((el) => {
  el.addEventListener("change", async () => {
    let tabs: Tabs.Tab[] = await browser.runtime.sendMessage({
      type: RequestType.QUERY_TABS,
    });
    populateUpdates(tabs, jar.toString());
  });
});

function populateUpdates(tabs: Tabs.Tab[], regex: string) {
  let matchTitle = (document.getElementById("match_title") as HTMLInputElement).checked == true;
  let matchURL = (document.getElementById("match_url") as HTMLInputElement).checked == true;

  let regexp: RegExp;
  try {
    regexp = new RegExp(regex);
  }
  catch (e) {
    const tabsContainer = document.querySelector(".tabs");
    if (tabsContainer) {
      tabsContainer.innerHTML = `<div class="no-tabs-found invalid">Invalid Regular Expression</div>`;
    }
    return;
  }
  let filtered: Tabs.Tab[] = filterTabs(tabs, {
    regex: regexp,
    matchTitle,
    matchURL
  });
  const tabsContainer = document.querySelector(".tabs");
  if (tabsContainer) {
    if (filtered.length === 0) {
      tabsContainer.innerHTML = `<div class="no-tabs-found">No Matching Tabs</div>`
    }
    else {
      tabsContainer.innerHTML = filtered.map(f => Card(f)).join("\n");
    }
  }
}

function Card(tab: Tabs.Tab): string {
  return `<label for="tab-${tab.id}" class="tab-item">
          <input type="checkbox" name="tab-${tab.id}" id="tab-${tab.id}" class="tab-boxes" data-id=${tab.id} checked>
          <div class="tab-card">
    ${tab.favIconUrl === "" || !tab.favIconUrl ?
      `<img src="globe_black.svg" class="globe_black" alt="favicon" />
       <img src="globe.svg" class="globe" alt="favicon" />` :
      `<img src="${tab.favIconUrl}" alt="favicon" />`
    }
            <div>
              <div class="title" title="${tab.title}">${tab.title}</div>
              <div class="url" title="${tab.url}">${tab.url}</div>
            </div>
          </div>
        </label>`;
}

function filterTabs(tabs: Tabs.Tab[], {
  regex, matchTitle, matchURL
}: {
  regex: RegExp, matchTitle: Boolean, matchURL: Boolean
}): Tabs.Tab[] {
  let filtered: Tabs.Tab[] = [];
  for (let tab of tabs) {
    if (matchTitle === true &&
      matchURL === true &&
      regex.test(tab.title || "") &&
      regex.test(tab.url || "")
    )
      filtered.push(tab);
    else if (matchTitle === true && regex.test(tab.title || ""))
      filtered.push(tab);
    else if (matchURL === true && regex.test(tab.url || ""))
      filtered.push(tab);
  }
  return filtered;
}

async function removeTabs(e: Event) {
  e.preventDefault();
  let tabsToRemove = Array.from(document.querySelectorAll(".tab-boxes:checked"));
  let ids: number[] = tabsToRemove.map(tab => Number((tab as HTMLElement).dataset.id));
  if (ids.length === 0) return;
  let res = await browser.runtime.sendMessage({
    type: RequestType.CLOSE_TABS,
    tabs: ids
  });
  let tabs: Tabs.Tab[] = await browser.runtime.sendMessage({
    type: RequestType.QUERY_TABS,
  });
  populateUpdates(tabs, jar.toString());
}

document.querySelector(".execute")?.addEventListener("click", removeTabs);