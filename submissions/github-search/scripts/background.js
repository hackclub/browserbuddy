async function refreshRepos() {
  const { githubToken: token } = await chrome.storage.local.get("githubToken");
  const { searchSettings } = await chrome.storage.local.get("searchSettings");

  if (!token) {
    return false;
  }

  try {
    const repos = [];
    if (searchSettings.personalRepos) {
      let page = 1;
      let hasMorePages = true;
      while (hasMorePages) {
        const personalReposRaw = await fetch(
          `https://api.github.com/user/repos?per_page=100&page=${page}`,
          {
            headers: {
              Authorization: `token ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        ).then((response) => response.json());

        const personalRepos = personalReposRaw.map((repo) => ({
          name: repo.name,
          url: repo.html_url,
        }));
        repos.push(...personalRepos);

        hasMorePages = personalReposRaw.length === 100;
        page++;
      }
    }

    if (searchSettings.starredRepos) {
      let page = 1;
      let hasMorePages = true;
      while (hasMorePages) {
        const starredReposRaw = await fetch(
          `https://api.github.com/user/starred?per_page=100&page=${page}`,
          {
            headers: {
              Authorization: `token ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        ).then((response) => response.json());

        const starredRepos = starredReposRaw.map((repo) => ({
          name: repo.name,
          url: repo.html_url,
        }));
        repos.push(...starredRepos);

        hasMorePages = starredReposRaw.length === 100;
        page++;
      }
    }

    if (searchSettings.recentRepos) {
      const recentReposRaw = await new Promise((resolve) => {
        chrome.history.search(
          {
            text: "github.com",
            startTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
            maxResults: 1000,
          },
          (historyItems) => {
            const repoUrls = historyItems
              .map((item) => item.url)
              .filter((url) => {
                try {
                  const urlObj = new URL(url);
                  const pathParts = urlObj.pathname.split("/").filter(Boolean);
                  return (
                    urlObj.hostname === "github.com" &&
                    pathParts.length === 2 &&
                    !pathParts[0].startsWith(".") &&
                    !pathParts[1].startsWith(".")
                  );
                } catch (err) {
                  return false;
                }
              });

            const recentRepos = repoUrls.map((url) => {
              const pathParts = new URL(url).pathname
                .split("/")
                .filter(Boolean);
              return {
                name: `${pathParts[0]}/${pathParts[1]}`,
                url: url,
              };
            });

            resolve(recentRepos);
          }
        );
      });

      repos.push(...recentReposRaw);
    }

    return Array.from(new Map(repos.map((repo) => [repo.url, repo])).values());
  } catch (error) {
    return false;
  }
}

async function setupAutoUpdate() {
  const { updateFrequency } = await chrome.storage.local.get("updateFrequency");
  const minutes = parseInt(updateFrequency);

  await chrome.alarms.clear("refreshRepos");

  if (minutes > 0) {
    chrome.alarms.create("refreshRepos", {
      delayInMinutes: minutes,
      periodInMinutes: minutes,
    });
  }
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "refreshRepos") {
    const success = await refreshRepos();
    await showBadgeFeedback(success);
  }
});

setupAutoUpdate();

let cachedRepos = [];

refreshRepos().then((repos) => {
  if (repos) cachedRepos = repos;
});

chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  if (!cachedRepos.length) {
    const repos = await refreshRepos();
    if (repos) cachedRepos = repos;
  }

  const matches = cachedRepos
    .filter((repo) => repo.name.toLowerCase().includes(text.toLowerCase()))
    .slice(0, 5)
    .map((repo) => ({
      content: repo.url,
      description: `${repo.name} - <url>${repo.url}</url>`,
    }));

  suggest(matches);
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  const selectedUrl = text;

  switch (disposition) {
    case "currentTab":
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.tabs.update(tab.id, { url: selectedUrl });
      });
      break;
    case "newForegroundTab":
      chrome.tabs.create({ url: selectedUrl, active: true });
      break;
    case "newBackgroundTab":
      chrome.tabs.create({ url: selectedUrl, active: false });
      break;
  }
});

async function showBadgeFeedback(success) {
  if (success) {
    cachedRepos = success;
  }

  chrome.action.setBadgeText({ text: " " });
  chrome.action.setBadgeBackgroundColor({
    color: success ? "#00FF00" : "#FF0000",
  });

  setTimeout(() => {
    chrome.action.setBadgeText({ text: "" });
  }, 1500);
}

chrome.runtime.onMessage.addListener(async (message) => {
  if (message === "refresh") {
    const success = await refreshRepos();
    await showBadgeFeedback(success);
    await setupAutoUpdate();
  }
});

chrome.action.onClicked.addListener(async () => {
  const success = await refreshRepos();
  await showBadgeFeedback(success);
});
