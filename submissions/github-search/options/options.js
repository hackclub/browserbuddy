const tokenInput = document.getElementById("github-token");
const validationMessage = document.getElementById("validation-message");
const saveButton = document.getElementById("save-settings");

async function validateToken(token) {
  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (response.ok) {
      const scopes = response.headers.get("X-OAuth-Scopes");
      if (scopes && scopes.includes("repo") && scopes.includes("read:user")) {
        return true;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}

tokenInput.addEventListener("input", async (e) => {
  const token = e.target.value.trim();

  if (!token) {
    validationMessage.textContent = "";
    validationMessage.classList.remove("visible");
    tokenInput.classList.remove("valid", "invalid");
    saveButton.disabled = true;
    return;
  }

  const isValid = await validateToken(token);
  validationMessage.textContent = isValid
    ? "Token verified"
    : "Invalid token or missing permissions";
  validationMessage.style.color = isValid
    ? "var(--success-text)"
    : "var(--error-text)";
  validationMessage.classList.add("visible");

  tokenInput.classList.remove("valid", "invalid");
  tokenInput.classList.add(isValid ? "valid" : "invalid");
  saveButton.disabled = !isValid;
});

saveButton.addEventListener("click", async () => {
  const token = tokenInput.value.trim();

  const personalRepos = document.getElementById("personal-repos").checked;
  const starredRepos = document.getElementById("starred-repos").checked;
  const recentRepos = document.getElementById("recent-repos").checked;

  const updateFrequency = String(
    document.getElementById("update-frequency").value
  );

  chrome.storage.local.set(
    {
      githubToken: token,
      searchSettings: {
        personalRepos,
        starredRepos,
        recentRepos,
      },
      updateFrequency: updateFrequency,
    },
    async () => {
      await chrome.runtime.sendMessage("refresh");
      window.close();
    }
  );
});

function loadFields() {
  chrome.storage.local.get(
    ["githubToken", "searchSettings", "updateFrequency"],
    async (data) => {
      tokenInput.value = data.githubToken || "";

      if (data.githubToken) {
        const isValid = await validateToken(data.githubToken);
        validationMessage.textContent = isValid
          ? "Token verified"
          : "Invalid token or missing permissions";
        validationMessage.style.color = isValid
          ? "var(--success-text)"
          : "var(--error-text)";
        validationMessage.classList.add("visible");
        tokenInput.classList.add(isValid ? "valid" : "invalid");
        saveButton.disabled = !isValid;
      }

      document.getElementById("personal-repos").checked =
        data.searchSettings?.personalRepos || false;
      document.getElementById("starred-repos").checked =
        data.searchSettings?.starredRepos || false;
      document.getElementById("recent-repos").checked =
        data.searchSettings?.recentRepos || false;
      console.log(data.updateFrequency);
      document.getElementById("update-frequency").value = String(
        data.updateFrequency || "0"
      );
    }
  );
}

document.addEventListener("DOMContentLoaded", loadFields);
