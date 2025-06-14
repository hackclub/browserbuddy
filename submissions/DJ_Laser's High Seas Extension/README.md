# DJ_Laser's High Seas Tracker

### Track your doubloons across both major browsers

![Extension popup appearing on search.nixos.org](https://cloud-5xi5me6k7-hack-club-bot.vercel.app/1screenshot_from_2024-12-28_16-30-49.png)

![Extension showing hours left on the shop](https://cloud-5xi5me6k7-hack-club-bot.vercel.app/3screenshot_from_2024-12-28_16-29-25.png)

## Features

- 🪙 Average and per project statistics on the shipyard
- 💰 Calculated hours worth and hours remaining for items in the shop
- ⚙️ Popup allows you to check your stats while offline
- ❤️ Sync your favorited items across devices
- 📈 Uses raw data for greater accuracy

## Install for both chrome and firefox

[https://github.com/DJ-Laser/highseas-ext/releases/](https://github.com/DJ-Laser/highseas-ext/releases/)

Download the correct file for your browser and import it from the extension settings

## Build Manually

Use the included nix flake by running `nix develop` (or manually install nodejs 22)

Install packages with `npm i --force` (`--force` is needed because `@hackclub/icons` does officially not support react 19)

Build for chrome or firefox with `npm run build` or `npm run build-ff` respectively
