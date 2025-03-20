export const tab_strip = document.getElementById("tab-strip");
export const main_tab = document.getElementById("main-tab");
export const settings_tab = document.getElementById("settings-tab");

export const prepare_tab_button = document.getElementById("prepare-tab-button");
export const preview_tab_button = document.getElementById("preview-tab-button");
export const settings_tab_button = document.getElementById("settings-tab-button");

const tab_contents = [main_tab, main_tab, settings_tab];
const tab_buttons = [prepare_tab_button, preview_tab_button, settings_tab_button];
const tab_change_listeners = [];

function switch_tab(tab_index) {
  for (let tab of tab_contents)
    tab.dataset.active = false;
  for (let tab_button of tab_buttons)
    tab_button.dataset.active = false;
  tab_contents[tab_index].dataset.active = true;
  tab_buttons[tab_index].dataset.active = true;
  for (let tab_change_cb of tab_change_listeners)
    tab_change_cb(tab_index);
}

prepare_tab_button.onclick = () => {
  switch_tab(0);
};
preview_tab_button.onclick = () => {
  switch_tab(1);
};
settings_tab_button.onclick = () => {
  switch_tab(2);
};

switch_tab(0);
