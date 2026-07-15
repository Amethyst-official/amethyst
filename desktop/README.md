# Amethyst Desktop

Desktop shell for Amethyst.

This folder builds the Electron desktop app. The desktop app is the current home for paid pre-built binaries and desktop-only export features, especially single-file offline HTML export.

Licensed under the GPLv3.0. See LICENSE for more information.

Parts of this repository are based on upstream desktop packaging work and [LLK/scratch-desktop](https://github.com/LLK/scratch-desktop). Keep those credits and licenses intact in the root legal docs.

## Website

The website source code is in the `docs` folder.

## Development

This folder still follows the original Electron package layout. Install dependencies using:

```bash
npm ci
```

Then fetch extra library, packager, and extension files:

```bash
npm run fetch
```

To build the webpack portions in src-renderer-webpack for development builds, run this:

```bash
npm run webpack:compile
```

You can also run this instead for source file changes to immediately trigger rebuilds:

```bash
npm run webpack:watch
```

Once you have everything compiled and fetched, start a development Electron instance with:

```bash
npm run electron:start
```

To create the unpacked Windows test build:

```bash
npm run electron:package:dir
```

On Windows, the test executable is created at:

```text
dist/win-unpacked/Amethyst.exe
```

Due to the security requirements mandated by custom extensions existing, the desktop app is significantly more complicated than the web editor.

 - **src-main** is what runs in Electron's main process. There is no build step; this code is included as-is. `src-main/entrypoint.js` is the entry point to the entire app.
 - **src-renderer-webpack** runs in an Electron renderer process to make the editor work. This is built by webpack as **dist-renderer-webpack**.
 - **src-renderer** also runs in an Electron renderer process, but without webpack. This is used for things like the privacy policy window.
 - **src-preload** runs as preload scripts in an Electron renderer process. They export glue functions to allow renderer and main to talk to each other in a somewhat controlled manner.
 - **dist-library-files** and **dist-extensions** contain additional static resources managed by `npm run fetch`

In Linux, The app icon won't work in the development version, but it will work in the packaged version.

We've found that development can work pretty well if you open two terminals side-by-side and run `npm run webpack:watch` in one and `npm run electron:start` in the other. You can refresh the windows with ctrl+R or cmd+R for renderer file changes to apply, and manually restart the app for main file changes to apply.

## Linux sandbox helper error

On some Linux distributions, Electron will crash with the message `The SUID sandbox helper binary was found, but is not configured correctly. Rather than run without sandboxing I'm aborting now. You need to make sure that /home/.../amethyst-desktop/node_modules/electron/dist/chrome-sandbox is owned by root and has mode 4755.`. Notably this can happen on Debian 10 and earlier and Ubuntu 24.04 and later.

For development, you can run these commands to enable unprivileged user namespaces until you reboot:

```bash
# Enable unprivileged user namespaces.
sudo sysctl -w kernel.unprivileged_userns_clone=1

# Stop AppArmor from preventing unprivileged user namespace creation by default.
# If your distribution does not use AppArmor then you can ignore the error.
sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
```

There are ways to make this permanent, but we don't think you should be making permanent kernel configuration changes just to develop this app. This error won't happen in the final .deb package, Flathub, or Snap Store releases.

## Final production-ready builds

The development version of the app will be larger and slower than the final release builds.

Build an optimized version of the webpack portions with:

```bash
npm run webpack:prod
```

Then to package up the final Electron binaries, use either our build script `release-automation/build.mjs` (see [release-automation/README.md](release-automation/README.md)) or the [electron-builder CLI](https://www.electron.build/cli). Either way the final builds are saved in the `dist` folder. Here are some examples using the electron-builder CLI directly:

```bash
# You can also do manual builds with electron-builder's CLI, for example:
# Windows installer
npx electron-builder --windows nsis --x64
# macOS DMG
npx electron-builder --mac dmg --universal
# Linux Debian
npx electron-builder --linux deb
```

You can typically only package for a certain operating system while on that operating system.

## Desktop HTML Export

Desktop export takes an editable `.amx` project and creates one offline `.html` playback file.

Current export rules:

 - `.amx` is the editable project format.
 - `.html` is the exported playback format.
 - The exported HTML is not meant to be edited by users.
 - The generated HTML bundles the Amethyst player runtime.
 - Project data is embedded as base85 chunks to avoid one giant base64 string.
 - Export is desktop-only for now.

Before shipping a public desktop binary, test export with:

 - a blank/simple project
 - a project with scripts
 - a project with model actors
 - a project with camera and environment blocks
 - a larger model-heavy project
 - internet disabled

## Code signing policy

The upstream desktop project used free code signing provided by [SignPath.io](https://about.signpath.io/), certificate by [SignPath Foundation](https://signpath.org/). Amethyst has not set up production desktop signing yet.

 * Approvers:
   * [GarboMuffin](https://github.com/GarboMuffin)
 * Amethyst signing and privacy policy details still need to be finalized before wide desktop release.

## Advanced customizations

The desktop shell lets you configure custom JS and CSS without rebuilding the app.

Find Amethyst Desktop's data path by using the list below or by clicking "?" in the top right corner, then "Desktop Settings", then "Open User Data", then opening the highlighted folder, or refer to this list:

 - Windows (except Microsoft Store): `%APPDATA%/amethyst-desktop`
 - macOS (except Mac App Store): `~/Library/Application Support/amethyst-desktop`
 - Linux (except Flatpak and Snap): `~/.config/amethyst-desktop`

Create the file `userscript.js` in this folder to configure custom JS. Create the file `userstyle.css` in this folder to configure custom CSS. Completely restart Amethyst Desktop (including all windows) to apply.

## Uninstall

Desktop uninstall docs still need to be written before a polished public release.
