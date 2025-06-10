async function main() {
    const { getSlackAuth } = await import("./slack.js");

    const workspaceSelect = document.getElementById("workspace-select");
    const enabledSwitch = document.getElementById("enable");
    const templateTextInput = document.getElementById("templateText");

    try {
        await getSlackAuth();
    }
    catch (e) {
        console.error(e);
        alert("Failed to get Slack auth, please sign in and try again!");
        return;
    }
    const { workspaces, selectedWorkspaceId, templateText } = await chrome.storage.local.get({
        workspaces: [],
        enabled: true,
        selectedWorkspaceId: null,
        templateText: "On $TITLE",
    });

    if (workspaces.length != 0) {
        // @ts-ignore
        for (const workspaceId of Object.keys(workspaces)) {
            const workspace = workspaces[workspaceId];
            console.log(workspace)
            const option = document.createElement("option");
            option.value = workspace;
            option.innerText = workspace.name;
            if (workspaceId === selectedWorkspaceId) {
                option.selected = true;
            }
            workspaceSelect?.appendChild(option);
        }
    } else {
        const option = document.createElement("option");
        option.value = "none";
        option.innerText = "No workspaces found";
        option.selected = true;
        workspaceSelect?.setAttribute("disabled", "true");
        workspaceSelect?.appendChild(option);
    }

    // @ts-ignore
    templateTextInput.value = templateText;

    // @ts-ignore
    bindSetting(enabledSwitch, "enabled");
    // @ts-ignore
    bindSetting(templateTextInput, "templateText")
    // @ts-ignore
    bindSetting(workspaceSelect, "selectedWorkspaceId");
}

/** @type (element: HTMLInputElement, key: string) => void */
function bindSetting(element, key) {
    element.addEventListener("change", (event) => {
        if (event.target && 'value' in event.target) {
            chrome.storage.local.set({ [key]: event.target.value });
        }
    });

}

main()