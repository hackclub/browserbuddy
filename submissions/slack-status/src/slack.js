export async function getSlackTeams() {
    const slackTab = await chrome.tabs.create({
        url: "https://app.slack.com/404",
        active: false,
    });
    if (!slackTab.id) throw new Error("Failed to create tab");
    console.debug(`Created Slack tab: ${slackTab.id}`);

    // localConfig_v2 stores info on Slack workspaces and the xoxc tokens
    const results = await chrome.scripting.executeScript({
        target: { tabId: slackTab.id },
        func: () => localStorage.getItem("localConfig_v2"),
        injectImmediately: true,
    });

    const localConfig = results[0].result;
    if (!localConfig) throw new Error("Failed to get xoxc");
    const config = JSON.parse(localConfig);

    setTimeout(() => {
        chrome.tabs.remove(slackTab.id || chrome.tabs.TAB_ID_NONE);
    }, 1000);

    await chrome.storage.local.set({ workspaces: config.teams });
    return config.teams;
}

export async function getSlackAuth() {
    const teams = await getSlackTeams();
    console.log(teams)
    const xoxd = (
        await chrome.cookies.get({
            name: "d",
            url: "https://app.slack.com",
        })
    )?.value;
    if (!xoxd) throw new Error("Failed to get xoxd");

    const { selectedWorkspaceId } = await chrome.storage.local.get({
        selectedWorkspaceId: Object.keys(teams)[0],
    });
    console.log(selectedWorkspaceId)

    const team = teams[selectedWorkspaceId];
    if (!team) throw new Error("Failed to get team - have you signed out?");
    return {
        xoxd,
        xoxc: team.token,
        teamDomain: team.domain,
    };
}
