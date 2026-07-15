# Development Guide

This guide is for people working on Amethyst itself.

Amethyst is a coordinated fork of TurboWarp packages. The goal is not to build a clean-room editor. The goal is to keep the Scratch/TurboWarp block-programming feel while replacing the 2D visual assumptions with a 3D actor and stage workflow.

## Local Setup

```powershell
cd scratch-gui
npm install
npm start
```

Open:

```text
http://127.0.0.1:8602/editor.html
```

Build:

```powershell
cd scratch-gui
npm run build
```

## Package Responsibilities

```text
scratch-gui
  Editor UI, stage integration, costume/model UI, addons, project pages.

scratch-vm
  Runtime target state, block primitives, scripts, events, variables, lists, clones, sounds.

scratch-blocks
  Scratch Blocks/Blockly rendering, block shapes, block behavior, generated block outputs.

scratch-render
  Legacy renderer pieces still needed by compatibility code.

scratch-storage
  Asset and project storage helpers.

desktop
  Electron desktop shell, offline export path, release packaging, and desktop-only integration points.
```

## Current 3D Architecture

The editor keeps the VM alive for scripts, events, variables, lists, broadcasts, clones, sounds, and block execution.

The visual direction is different:

- 2D sprite rendering should not be the main actor rendering path.
- 3D actors render through Three.js.
- Actors use `x`, `y`, and `z`.
- Model assets are GLB/GLTF first.
- Camera and environment state live in the 3D scene state.

Important areas:

```text
scratch-gui/src/components/stage-3d/
  Three.js stage, model previews, camera behavior.

scratch-gui/src/lib/scratch3d-scene-blocks.js
  Custom block labels, block definitions, block colors, category-specific block registration.

scratch-gui/src/lib/make-toolbox-xml.js
  Toolbox categories and flyout contents.

scratch-vm/src/blocks/scratch3_scene3d.js
  Camera and environment VM primitives.

scratch-vm/src/blocks/
  Other block primitive changes.

desktop/src-main/
  Electron main process, menus, windows, file dialogs, and desktop-only actions.

desktop/src-renderer-webpack/
  Desktop renderer bundles that wrap the editor and embed/player surfaces.
```

## Design Rules

Keep these rules unless the project direction changes:

- Keep blocks simple enough for kids to understand.
- Prefer clear labels over clever labels.
- Use Three.js for the 3D stage.
- Do not scatter Three.js calls throughout unrelated UI code.
- Keep the old VM/runtime behavior alive where it still supports scripts.
- Do not add built-in physics in v1.
- Do not promise Scratch `.sb3` round-tripping in v1.
- Do not remove required credits or license notices.
- Use Amethyst branding in product UI, but keep legal attribution.

## Adding Blocks

A new block usually needs changes in more than one place:

```text
scratch-gui/src/lib/scratch3d-scene-blocks.js
  Defines block text, shape, color, category mapping, and block JSON.

scratch-gui/src/lib/make-toolbox-xml.js
  Adds the block to the toolbox flyout.

scratch-vm/src/blocks/
  Implements the runtime primitive.

scratch-vm/src/compiler/compat-blocks.js
  May need updates if the compiler/runtime compatibility list cares about the opcode.
```

For custom categories, make sure the block definition color matches the category color. The toolbox category color alone is not enough.

## Camera And Scene State

Camera state should include:

- position
- target
- field of view
- smoothing duration
- follow settings

Manual camera movement, camera blocks, and follow modes must not fight each other. If one system drives the camera continuously, the other systems should not overwrite it every frame.

## Model Guidelines

Supported first:

- `.glb`
- `.gltf`

Be careful with:

- very large models
- external texture paths
- unsupported materials
- huge texture sizes
- odd origins/pivots
- skeleton/bone editing expectations

The model editor should stay kid-friendly. It should help creators adjust pivots, parts, colors, and simple transforms without turning Amethyst into Blender.

## Desktop Export Direction

Desktop export should stay focused on one user-facing output:

```text
.amx -> single offline .html
```

Do not bring back `.sb3` wording in the export flow. Do not make exported HTML an editing format. Users edit `.amx` inside Amethyst, then export a fresh HTML playback file.

The exporter should avoid huge one-string payloads. Use chunked project data and keep the player runtime bundled so the generated file can open offline.

## Save Format Direction

Amethyst should use `.amx` as its native project format.

`.amx` should be 3D-native and does not need to round-trip `.sb3`.

It should store:

- actors
- scripts
- variables
- lists
- sounds
- model assets
- model costumes
- transforms
- camera state
- environment state
- stage/backdrop entries
- future model-editing metadata

## Testing Checklist

Before calling a change done:

- Run `npm run build` in `scratch-gui`.
- Open the editor locally.
- Check the changed category or UI area.
- Verify existing non-rendering blocks still appear.
- Verify no UI says a v1 feature exists when it does not.
- For docs changes, check links and file paths.

For 3D changes:

- Check the stage renders.
- Check camera movement.
- Check model import with a simple GLB.
- Check model visibility.
- Check save/load if the change touches project state.

For desktop export changes:

- Build `scratch-gui`.
- Run the focused exporter unit tests.
- Run `npm run webpack:compile` in `desktop`.
- Run `npm run electron:package:dir` in `desktop`.
- Open `desktop\dist\win-unpacked\Amethyst.exe`.
- Export a simple `.amx` to `.html`.
- Open the exported HTML with network disabled.

## Branding

Use:

```text
Amethyst
```

Acceptable description:

```text
A fork of TurboWarp inspired by Scratch-style block coding.
```

Avoid:

```text
Official Scratch
Scratch app
Scratch 3D
```

Those can create trademark and affiliation confusion.
