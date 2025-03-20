<img src="public/img/logo_title.png" height="96px">

MosaicSlicer is a browser-based 3D printing slicer. Everything runs completely within your web browser, and nothing is sent to any servers or cloud services. It uses [CuraEngine](https://github.com/ading2210/CuraEngine) for the slicer backend and is mostly compatible with existing [Cura](https://github.com/Ultimaker/Cura) printer profiles.

![image](https://github.com/user-attachments/assets/31d7d8b6-306e-481f-9486-f7aa40606e74)

Note: MosaicSlicer is alpha quality software and probably has behavior that is slightly different from Cura. Please double check the generated G-code files in another G-code viewer before printing anything.

## Features
- All print settings from Cura are available
- Compatible with most existing Cura printer and material profiles
- Can slice multiple parts at once
- 3d viewer with build plate
- Works on Chromium and Firefox
- A browser extension can be installed for offline usage

### Notable Missing Features:
- Support for multiple extruders
- Editing printer machine settings
- Saving modified settings
- G-code preview

## Building

This build process has been tested to work on Linux and MacOS.

Make sure you have all submodules cloned:

```
$ git submodule update --init --progress
```

Compile CuraEngine:

```
$ scripts/build_cura.sh
```

Bundle Resources:

```
$ scripts/bundle_resources.sh
```

Install JS dependencies:

```
$ npm i
```

Bundle JS with Webpack:

```
$ npm run build:prod
```

The final output will be in `dist/`

## License

This program was written by [ading2210](https://github.com/ading2210) and [simplyrohan](https://github.com/simplyrohan). It is licensed under the [GNU APL v3](https://www.gnu.org/licenses/agpl-3.0.en.html).

```
ading2210/MosaicSlicer - A browser-based 3D printing slicer
Copyright (C) 2025 ading2210

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```
