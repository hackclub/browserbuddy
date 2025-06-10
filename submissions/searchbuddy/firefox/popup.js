function mainPage(shouldDisplayHistory = true, pos = null) {
  clearPage();
  // document.createElement("h1").innerText = "Search Buddy"
  const title = document.createElement("h1");
  title.innerText = "Search Buddy";
  title.style.textAlign = "center";
  document.body.appendChild(title);

  const toggleButton = document.createElement("button");
  const settingsButton = document.createElement("button");
  const createFolder = document.createElement("button");

  chrome.runtime.sendMessage({ action: "getSettings" }).then((data) => {
    const state = data.settings.state ?? true;

    if (state) {
      toggleButton.innerText = "Disable";
      toggleButton.style.backgroundColor = "#FFB4B4";
      toggleButton.style.border = "2px solid #EC7694";
    } else {
      toggleButton.innerText = "Enable";
      toggleButton.style.backgroundColor = "#B2FFD6";
      toggleButton.style.border = "2px solid #689F38";
    }
  });

  if (shouldDisplayHistory) displayHistory();

  toggleButton.style.width = "45%";
  toggleButton.style.borderRadius = "10px";
  toggleButton.style.fontFamily = "Roboto, sans-serif";
  toggleButton.style.fontWeight = "bold";
  toggleButton.style.height = "30px";
  toggleButton.style.position = "relative";
  toggleButton.style.bottom = "-20px";
  toggleButton.style.left = "5%";
  toggleButton.style.cursor = "pointer";
  document.body.appendChild(toggleButton);

  createFolder.style.width = "45%";
  createFolder.style.borderRadius = "10px";
  createFolder.style.fontFamily = "Roboto, sans-serif";
  createFolder.style.fontWeight = "bold";
  createFolder.style.height = "30px";
  createFolder.style.position = "relative";
  createFolder.style.bottom = "-20px";
  createFolder.style.left = "0%";
  createFolder.style.cursor = "pointer";
  document.body.appendChild(createFolder);

  createFolder.innerText = "Create Folder";
  createFolder.style.backgroundColor = "#F7DC6F";
  createFolder.style.border = "2px solid #F1C40F";

  settingsButton.style.background = "none";
  settingsButton.style.border = "none";
  settingsButton.style.position = "absolute";
  settingsButton.style.left = "5%";
  settingsButton.style.top = "4%";
  settingsButton.style.cursor = "pointer";

  const settingsButtonImage = document.createElement("img");
  settingsButtonImage.src = "img/gear.png";
  settingsButtonImage.style.background = "none";
  settingsButtonImage.style.width = "40px";
  settingsButtonImage.style.position = "relative";
  settingsButtonImage.style.right = "5%";
  settingsButtonImage.style.top = "0px";
  settingsButtonImage.style.cursor = "pointer";
  settingsButton.appendChild(settingsButtonImage);

  document.body.appendChild(settingsButton);

  toggleButton.onclick = () => {
    chrome.runtime.sendMessage({ action: "getSettings" }).then((data) => {
      data.settings.state = !data.settings.state;
      chrome.runtime.sendMessage({
        action: "saveSettings",
        settings: data,
      });

      // console.log(data);
      const state = data.settings.state;
      if (state) {
        toggleButton.innerText = "Disable";
        toggleButton.style.backgroundColor = "#FFB4B4";
        toggleButton.style.border = "2px solid #EC7694";
      } else {
        toggleButton.innerText = "Enable";
        toggleButton.style.backgroundColor = "#B2FFD6";
        toggleButton.style.border = "2px solid #689F38";
      }
    });
  };
  document.body.appendChild(toggleButton);

  settingsButton.onclick = () => {
    settingsPage();
  };

  createFolder.onclick = () => {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
      // console.log("there is folder name")
      chrome.runtime.sendMessage({ action: "getSettings" }).then((data) => {
        const history = data.history ?? [];
        if (pos) {
          console.log(pos);
          console.log(history);
          setDeepValue(history, pos, { title: folderName, items: [] });
        } else {
          history.unshift({ title: folderName, items: [] });
        }
        chrome.runtime.sendMessage({
          action: "saveSettings",
          settings: {
            ...data,
            history,
          },
        });
        clearPage();
        mainPage(false, pos);
        displayHistory(pos);
      });
    }
  };

  if (pos && pos.length > 0) {
    const backButton = document.createElement("button");
    backButton.innerText = "Back";
    backButton.style.width = "45%";
    backButton.style.borderRadius = "10px";
    backButton.style.fontFamily = "Roboto, sans-serif";
    backButton.style.fontWeight = "bold";
    backButton.style.height = "30px";
    backButton.style.position = "relative";
    backButton.style.bottom = "-23px";
    backButton.style.left = "50%";
    backButton.style.transform = "translateX(-50%)";
    backButton.style.backgroundColor = "#F7DC6F";
    backButton.style.border = "2px solid #F1C40F";
    backButton.style.cursor = "pointer";
    backButton.onclick = () => {
      clearPage();
      mainPage(false, pos.slice(0, -1));
      displayHistory(pos.slice(0, -1));
    };
    document.body.appendChild(backButton);
  }
}

function setDeepValue(obj, path, value) {
  let current = obj;
  for (let i = 0; i <= path.length - 1; i++) {
    if (i != 0) current = current.items[path[i]];
    else current = current[path[i]];
  }
  if (current.items) current.items.push(value);
  else current.unshift(value);
}

function displayHistory(pos = null) {
  chrome.runtime.sendMessage({ action: "getSettings" }).then((data) => {
    const history = data.history ?? [];
    // [3,5,7,1]
    let historyLocationToDisplay = history;
    if (pos !== null) {
      console.log(pos);
      pos.forEach(
        (item) =>
          (historyLocationToDisplay = historyLocationToDisplay[item].items)
      );
    }

    historyLocationToDisplay.forEach((url, index) => {
      const link = document.createElement("button");
      // [{"link":"https://en.wikipedia.org/wiki/E_(mathematical_constant)","title":"e (mathematical constant)\nWikipedia\n"},{items: [{link: "https://google.com", title: "Google"}], title: "Test Folder"}]
      // link.href = url.link;
      // link.target = "_blank";
      link.innerText = url.title;
      link.style.position = "relative";
      link.style.left = "32%";
      link.style.top = "15px";
      link.style.marginTop = "10px";
      if (url.link) link.style.backgroundColor = "#c5dbe6";
      else link.style.backgroundColor = "#F7DC6F";
      link.style.border = "2px solid #45a";
      link.style.borderRadius = "10px";
      link.style.height = "40px";
      link.style.width = "60%";
      link.style.overflowWrap = "break-word";

      if (url.link) {
        link.target = "_blank";
      }

      const deleteButton = document.createElement("button");
      deleteButton.style.position = "absolute";
      deleteButton.style.right = "-90px";
      deleteButton.style.top = "0px";
      deleteButton.innerText = "X";
      deleteButton.style.backgroundColor = "#EC7694";
      deleteButton.style.border = "none";
      deleteButton.style.borderRadius = "10px";
      deleteButton.style.height = "40px";
      deleteButton.style.width = "35px";
      deleteButton.style.cursor = "pointer";
      link.appendChild(deleteButton);

      // if (url.link) {
      const moveButton = document.createElement("button");
      moveButton.style.position = "absolute";
      moveButton.style.right = "-45px";
      moveButton.style.top = "0px";
      moveButton.innerText = ">>";
      moveButton.style.backgroundColor = "#F7DC6F";
      moveButton.style.border = "none";
      moveButton.style.borderRadius = "10px";
      moveButton.style.height = "40px";
      moveButton.style.width = "35px";
      moveButton.style.cursor = "pointer";
      link.appendChild(moveButton);

      moveButton.onclick = (e) => {
        e.stopPropagation();
        const response = prompt(
          'Enter folder name to place into (in the current directory, enter ".." to move a folder back)'
        );
        if (response) {
          if (
            historyLocationToDisplay.some(
              (item) => item.title === response && item.items
            ) ||
            response === ".."
          ) {
            const tempPos = JSON.parse(JSON.stringify(pos ?? [])); // to make sure pos wont be modified
            historyLocationToDisplay.splice(
              historyLocationToDisplay.findIndex(
                (item) => item.title === url.title
              ),
              1
            );

            if (response !== "..")
              tempPos.push(
                historyLocationToDisplay.findIndex(
                  (item) => item.title === response && item.items
                )
              );
            else {
              if (tempPos.length < 1) {
                alert("You are already at the root directory");
                return;
              }
              tempPos.pop();
            }
            if (tempPos.length > 0)
              if (url.link)
                setDeepValue(history, tempPos, {
                  link: url.link,
                  title: url.title,
                });
              else
                setDeepValue(history, tempPos, {
                  items: url.items,
                  title: url.title,
                });
            else history.unshift({ link: url.link, title: url.title });
            chrome.runtime.sendMessage({
              action: "saveSettings",
              settings: { ...data, history },
            });
            link.remove();
          } else {
            alert("Folder does not exist");
          }
        } else {
          alert("Please enter a folder name");
        }
      };
      // }

      deleteButton.onclick = (e) => {
        e.stopPropagation();

        // const deleteCondition = (item) => {
        //   if (item.link)
        //     return item.link !== url.link && item.title !== url.title;
        //   else {
        //     return { ...item, items: item.items.filter(deleteCondition) };
        //   }
        // };

        historyLocationToDisplay.splice(index, 1);
        chrome.runtime.sendMessage({
          action: "saveSettings",
          settings: { ...data, history },
        });
        link.remove();
      };

      // link.style.fontSizeAdjust = "0.3"
      link.style.transform = "translateX(-50%)";
      link.style.cursor = "pointer";
      document.body.appendChild(link);

      link.onclick = () => {
        chrome.runtime.sendMessage({ action: "getSettings" }).then((data) => {
          let history = data.history ?? [];
          if (pos !== null) {
            console.log(pos);
            pos.forEach((item) => (history = history[item].items));
          }
          if (url.link) {
            window.open(url.link, "_blank");
          } else {
            if (!pos) pos = [];
            pos.push(history.findIndex((item) => item.title === url.title));
            clearPage();
            mainPage(false, pos);
            displayHistory(pos);
          }
        });
      };
    });
  });
}

function settingsPage() {
  clearPage();
  const title = document.createElement("h1");
  title.innerText = "Settings";

  const styleTitle = document.createElement("h2");
  styleTitle.style.textAlign = "center";
  styleTitle.innerText = "Personalization";
  document.body.appendChild(styleTitle);

  const offsetInputX = document.createElement("input");
  const offsetInputY = document.createElement("input");
  const offsetInputWidth = document.createElement("input");
  const offsetInputHeight = document.createElement("input");
  offsetInputX.type = "number";
  offsetInputY.type = "number";
  offsetInputWidth.type = "number";
  offsetInputHeight.type = "number";

  offsetInputX.style.position = "relative";
  offsetInputY.style.position = "relative";
  offsetInputHeight.style.position = "relative";
  offsetInputWidth.style.position = "relative";
  offsetInputX.style.width = "30%";
  offsetInputY.style.width = "30%";
  offsetInputHeight.style.width = "30%";
  offsetInputWidth.style.width = "30%";
  offsetInputX.style.borderRadius = "5px";
  offsetInputY.style.borderRadius = "5px";
  offsetInputHeight.style.borderRadius = "5px";
  offsetInputWidth.style.borderRadius = "5px";

  chrome.runtime.sendMessage({ action: "getSettings" }).then((data) => {
    offsetInputX.value = data.settings.offsetX;
    offsetInputY.value = data.settings.offsetY;
    offsetInputWidth.value = data.settings.offsetW;
    offsetInputHeight.value = data.settings.offsetH;

    offsetInputX.onchange = () => {
      chrome.runtime
        .sendMessage({
          action: "getSettings",
        })
        .then((data) => {
          data.settings.offsetX = offsetInputX.value;
          chrome.runtime.sendMessage({
            action: "saveSettings",
            settings: {
              ...data,
            },
          });
        });
    };
    offsetInputY.onchange = () => {
      chrome.runtime
        .sendMessage({
          action: "getSettings",
        })
        .then((data) => {
          data.settings.offsetY = offsetInputY.value;
          chrome.runtime.sendMessage({
            action: "saveSettings",
            settings: {
              ...data,
            },
          });
        });
    };

    offsetInputWidth.onchange = () => {
      chrome.runtime
        .sendMessage({
          action: "getSettings",
        })
        .then((data) => {
          data.settings.offsetW = offsetInputWidth.value;
          chrome.runtime.sendMessage({
            action: "saveSettings",
            settings: {
              ...data,
            },
          });
        });
    };

    offsetInputHeight.onchange = () => {
      chrome.runtime
        .sendMessage({
          action: "getSettings",
        })
        .then((data) => {
          data.settings.offsetH = offsetInputHeight.value;
          chrome.runtime.sendMessage({
            action: "saveSettings",
            settings: {
              ...data,
            },
          });
        });
    };
  });
  const p = document.createElement("p");
  p.innerHTML = "X offset";
  document.body.appendChild(p);
  document.body.appendChild(offsetInputX);
  const p2 = document.createElement("p");
  p2.innerHTML = "Y offset";
  document.body.appendChild(p2);
  document.body.appendChild(offsetInputY);
  const p3 = document.createElement("p");
  p3.innerHTML = "Width";
  document.body.appendChild(p3);
  document.body.appendChild(offsetInputWidth);
  const p4 = document.createElement("p");
  p4.innerHTML = "Height";
  document.body.appendChild(p4);
  document.body.appendChild(offsetInputHeight);

  // modeToggle.innerText = "Enable blacklist";

  const listTitle = document.createElement("h2");
  listTitle.style.textAlign = "center";
  document.body.appendChild(listTitle);

  const modeToggle = document.createElement("button");
  modeToggle.style.width = "50%";
  modeToggle.style.borderRadius = "10px";
  modeToggle.style.fontFamily = "Roboto, sans-serif";
  modeToggle.style.fontWeight = "bold";
  modeToggle.style.height = "30px";
  modeToggle.style.position = "relative";
  modeToggle.style.bottom = "10px";
  modeToggle.style.left = "25%";
  document.body.appendChild(modeToggle);

  chrome.runtime.sendMessage({ action: "getSettings" }).then((data) => {
    const mode = data.settings.listMode ?? "blacklist";
    if (mode === "whitelist") {
      modeToggle.style.backgroundColor = "#F7DC6F";
      modeToggle.style.border = "2px solid #F1C40F";
      modeToggle.innerText = "Enable blacklist";
      listTitle.innerText = "Whitelist";
    } else {
      modeToggle.style.backgroundColor = "#A1C9F2";
      modeToggle.style.border = "2px solid #4F7AC7";
      modeToggle.innerText = "Enable whitelist";
      listTitle.innerText = "Blacklist";
    }

    modeToggle.onclick = () => {
      chrome.runtime.sendMessage({ action: "getSettings" }).then((data) => {
        const mode = data.settings.listMode ?? "blacklist";
        if (mode === "blacklist") {
          modeToggle.style.backgroundColor = "#F7DC6F";
          modeToggle.style.border = "2px solid #F1C40F";
          modeToggle.innerText = "Enable blacklist";
          listTitle.innerText = "Whitelist";
        } else {
          modeToggle.style.backgroundColor = "#A1C9F2";
          modeToggle.style.border = "2px solid #4F7AC7";
          modeToggle.innerText = "Enable whitelist";
          listTitle.innerText = "Blacklist";
        }
        chrome.runtime.sendMessage({
          action: "saveSettings",
          settings: {
            ...data,
            settings: {
              ...data.settings,
              listMode: mode === "blacklist" ? "whitelist" : "blacklist",
            },
          },
        });
      });
    };
  });

  const addItemInput = document.createElement("input");
  addItemInput.type = "text";
  // addItemInput.style.position = "relative";
  // addItemInput.style.top = "5%";
  // addItemInput.style.left = "37%";
  // addItemInput.style.transform = "translate(-50%, -50%)";
  addItemInput.style.width = "60%";
  addItemInput.style.padding = "10px";
  addItemInput.style.borderRadius = "10px";
  addItemInput.placeholder = "Add item";

  const addItemButton = document.createElement("button");
  addItemButton.innerHTML = "Add";
  // addItemButton.style.position = "relative";
  addItemButton.style.width = "20%";
  addItemButton.style.height = "30px";
  addItemButton.style.backgroundColor = "#B2FFD6";
  addItemButton.style.borderRadius = "10px";
  addItemButton.style.border = "none";
  addItemButton.style.cursor = "pointer";

  const container = document.createElement("div");
  container.style.position = "relative";
  container.style.width = "100%";
  container.style.height = "10%";
  container.style.display = "flex";
  container.style.gap = "10px";
  // container.style.flexDirection = "column";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";

  document.body.appendChild(container);
  container.appendChild(addItemButton);
  container.appendChild(addItemInput);

  chrome.runtime.sendMessage({ action: "getSettings" }).then((data) => {
    const list = data.settings.list ?? [];
    list.forEach((item) => {
      newItem(false, item);
    });
  });

  addItemButton.onclick = () => {
    if (addItemInput.value === "") return;
    newItem(true);
  };

  async function newItem(fromInput = false, value = null) {
    const item = document.createElement("button");
    // link.href = url.link;
    // link.target = "_blank";
    let textvalue;
    if (fromInput) textvalue = addItemInput.value;
    else textvalue = value;

    item.innerText = textvalue;

    let shouldReturn = false;
    if (fromInput) {
      await chrome.runtime
        .sendMessage({
          action: "getSettings",
        })
        .then((data) => {
          if (data.settings.list.includes(addItemInput.value)) {
            shouldReturn = true;
          }
        });
    }

    if (shouldReturn) return;

    item.style.color = "black";
    item.style.left = "40%";
    item.style.position = "relative";
    item.style.marginTop = "10px";
    item.style.backgroundColor = "#c5dbe6";
    item.style.border = "2px solid #45a";
    item.style.borderRadius = "10px";
    item.style.height = "40px";
    item.style.width = "80%";
    item.style.overflowWrap = "break-word";

    const deleteButton = document.createElement("button");
    deleteButton.style.position = "absolute";
    deleteButton.style.right = "-40px";
    deleteButton.style.top = "0px";
    deleteButton.innerText = "X";
    deleteButton.style.backgroundColor = "#EC7694";
    deleteButton.style.border = "none";
    deleteButton.style.borderRadius = "10px";
    deleteButton.style.height = "40px";
    deleteButton.style.width = "30px";
    deleteButton.style.cursor = "pointer";
    item.appendChild(deleteButton);

    deleteButton.onclick = (e) => {
      e.stopPropagation();
      chrome.runtime
        .sendMessage({
          action: "getSettings",
        })
        .then((data) => {
          chrome.runtime.sendMessage({
            action: "saveSettings",
            settings: {
              ...data,
              settings: {
                ...data.settings,
                list: data.settings.list.filter((i) => i !== textvalue),
              },
            },
          });
          item.remove();
        });
    };

    // link.style.fontSizeAdjust = "0.3"
    item.style.transform = "translateX(-50%)";
    // link.style.cursor = "pointer";
    document.body.appendChild(item);
    // list.appendChild(item);

    // item.onclick = () => {
    //   chrome.tabs.create({ url: url.link });
    // };

    if (fromInput) {
      chrome.runtime
        .sendMessage({
          action: "getSettings",
        })
        .then((data) => {
          if (!data.settings.list) data.settings.list = [];
          chrome.runtime.sendMessage({
            action: "saveSettings",
            settings: {
              ...data,
              settings: {
                ...data.settings,
                list: [...data.settings.list, addItemInput.value],
              },
            },
          });
          addItemInput.value = "";
        });
    }
  }
}

function clearPage() {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
}

mainPage();
