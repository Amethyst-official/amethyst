# Amethyst

> Official page for now: https://amethyst3d.pages.dev/  
> This may change later.

Amethyst is a 3D block-coding editor based on TurboWarp, with Scratch-style blocks and Three.js-powered actors.

> Status: early development. The web editor is free and active. The desktop app now builds and is the test path for paid pre-built binaries and desktop-only export features.

Amethyst keeps the simple block-programming feel of Scratch and TurboWarp, but changes the creative target from a 2D sprite stage into a 3D game-making space with model actors, camera controls, environment controls, and a native `.amx` project direction.

## Source Code And Desktop Builds

Amethyst's source code is free, and building from source is free. The paid desktop option is for the pre-built binary distributed by the project, not for access to the source code.

Pre-built desktop builds are intended to be sold through:

```text
https://noahli.gumroad.com/l/amethyst
```

That does not change the source license. Anyone can still clone the repo and build from source.

## What Works Right Now

- A web editor based on the TurboWarp source stack.
- A Three.js 3D stage inside the editor.
- 3D model actors using GLB/GLTF assets.
- Scratch-style XYZ motion blocks.
- Camera blocks for position, target, turns, zoom, follow, and smoothing.
- Environment blocks for sky, ground, fog, sunlight, ambient light, and stages.
- Mouse blocks for cursor visibility, first-person, third-person, lock, and mouse movement values.
- Experimental Network and Media Display categories.
- A model/costume workflow that is replacing the old 2D costume assumptions.
- `.amx` project save/load for Amethyst projects.
- Desktop packaging through the Electron desktop shell.
- Desktop-only single-file HTML export. The export embeds the project payload as base85 chunks and bundles the Amethyst player runtime for offline play.

## Still Changing

- `.amx` save/reload still needs more real-project torture testing.
- Desktop HTML export is working as a first release path, but large/complex projects still need testing.
- Some imported models may fail or render incorrectly, especially complex textured GLB files.
- The model editing tools are early and not a Blender replacement.
- The current desktop build target is 64-bit Electron. 32-bit Electron and Tauri x64 are planned/experimental directions, not release-ready targets.
- Scratch `.sb3` import/export compatibility is not a v1 goal.
- Built-in physics is not planned for v1.

## Quick Start

Install dependencies and start the web editor:

```powershell
git clone https://github.com/Amethyst-official/amethyst.git
cd amethyst\scratch-gui
npm install
npm start
```

Open:

```text
http://127.0.0.1:8602/editor.html
```

Build the editor:

```powershell
cd scratch-gui
npm run build
```

Or from the repository root:

```powershell
.\scripts\build-web.ps1
```

Build the desktop app:

```powershell
cd desktop
npm install
npm run fetch
npm run webpack:compile
npm run electron:package:dir
```

The unpacked Windows executable is created at:

```text
desktop\dist\win-unpacked\Amethyst.exe
```

For a versioned paid-binary ZIP:

```powershell
.\scripts\build-release.ps1
```

That creates:

```text
releases\Amethyst-0.1.<git-commit-count>-win-x64-portable.zip
```

Use this to print the current build name:

```powershell
.\scripts\version.ps1
```

## Project Layout

```text
scratch-gui      Editor UI, stage integration, project pages, addons, HTML export builder
scratch-vm       Block runtime, target state, primitives, project behavior
scratch-blocks   Block definitions, block rendering, Blockly/Scratch Blocks core
scratch-render   Legacy renderer pieces still used by compatibility paths
scratch-storage  Asset and project storage helpers
desktop          Electron desktop shell, offline runtime packaging, desktop-only export entry points
docs             Amethyst documentation
scripts          Root PowerShell helpers for versioning, web builds, desktop builds, and release ZIPs
```

## Documentation

- [Docs Index](docs/README.md)
- [Getting Started](docs/getting-started.md)
- [Block Reference](docs/blocks.md)
- [Model Costumes](docs/model-costumes.md)
- [Camera and Environment](docs/camera-and-environment.md)
- [Save Files](docs/save-files.md)
- [Development Guide](docs/development.md)
- [Build and Deploy](docs/build-and-deploy.md)
- [Roadmap](docs/roadmap.md)
- [AmethystAI](docs/amethyst-ai.md)
- [Legal and Credits](docs/legal.md)

## Roadmap

Near-term priorities:

- Make `.amx` save/load reliable.
- Make desktop single-file HTML export robust with larger `.amx` projects.
- Improve 3D model import and preview behavior.
- Make model costumes feel closer to the original Scratch costume workflow.
- Improve camera, environment, mouse, network, and media block polish.
- Keep removing old 2D assumptions where they confuse the 3D workflow.
- Keep required credits and license notices intact.

Later priorities:

- Better docs and tutorials.
- Better in-app 3D model editing.
- 32-bit Electron and experimental Tauri x64 builds.
- Optional libraries for advanced behavior.

Not planned for v1:

- Built-in physics engine.
- Scratch project round-tripping.
- Cloud sharing.
- Marketplace.
- Multiplayer.
- Full Blender-style mesh editing.

## Legal Short Version

Amethyst is a fork of TurboWarp and Scratch-related open-source projects. It is not affiliated with, endorsed by, or sponsored by Scratch, the Scratch Foundation, MIT, or TurboWarp.

The root license is GPL-3.0 because the main editor distribution includes GPL-licensed components. Some components remain under MPL-2.0 or BSD-3-Clause as noted in [NOTICE.md](NOTICE.md).

Scratch is a project of the Scratch Foundation. TurboWarp is a separate open-source project. Three.js is used for 3D rendering. See [Legal and Credits](docs/legal.md) for more detail.
