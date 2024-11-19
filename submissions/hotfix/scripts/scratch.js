chrome.storage.local.get("scratch.useTurbowarpEmbed", function (result) {
  if (result["scratch.useTurbowarpEmbed"] === true) {
    useTurbowarpEmbed();
  }
});

function useTurbowarpEmbed() {
  let loaded = false;

  async function load() {
    const getProjectId = () => {
      return window.location.pathname.split("/")[2];
    };

    const getIsProjectShared = async (username, id) => {
      const response = await fetch(
        `https://api.scratch.mit.edu/users/${username}/projects/${id}`,
        { cache: "no-store" }
      );

      if (!response.ok) return false;
      if ((await response.json()).code === "NotFound") return false;

      return true;
    };

    async function checkForLoad() {
      if (loaded === false) {
        const usernameLabel =
          document.querySelector("div.title a") ||
          document.querySelector("span.profile-name");
        const player = document.querySelector(".guiPlayer");
        if (!usernameLabel || !player) return;
        player.id = "guiPlayer";

        loaded = true;

        const username = usernameLabel.innerText;

        const isShared = await getIsProjectShared(username, getProjectId());
        if (!isShared) return;

        let turboPlayer = document.createElement("iframe");
        turboPlayer.id = "turboPlayer";
        turboPlayer.src = `https://turbowarp.org/${getProjectId()}/embed?settings-button&fullscreen-background=white`;
        turboPlayer.width = 482;
        turboPlayer.height = 412;
        turboPlayer.allowTransparency = true;
        turboPlayer.allowFullscreen = true;
        turboPlayer.style.border = "none";

        player.parentNode.insertBefore(turboPlayer, player.nextSibling);
        player.style.display = "none";
        checkCloudProject();
      } else {
        checkCloudProject();
      }

      function checkCloudProject() {
        const extensionList = document.querySelectorAll(
          "div.extension-content span"
        );

        if (extensionList == undefined) return;

        let isCloudProject = Array.from(extensionList).some((element) => {
          return element.innerText == "Cloud Variables";
        });

        if (isCloudProject)
          chrome.storage.local.get(
            "scratch.useTurbowarpEmbedOnCloud",
            function (result) {
              if (result["scratch.useTurbowarpEmbedOnCloud"] === false) {
                document.getElementById("guiPlayer").style.display = "block";
                document.getElementById("turboPlayer").remove();
              }
            }
          );

        observer.disconnect();
      }
    }

    const observer = new MutationObserver(checkForLoad);
    observer.observe(document.body, { childList: true, subtree: true });
    checkForLoad();
  }
  load();
}
