# Getting Started

This guide is for people testing Amethyst locally.

Amethyst is still early. Expect some rough edges, especially around complex imported models, exported HTML playback, and new 3D editor tools.

## Run The Editor

From the repository root:

```powershell
cd scratch-gui
npm install
npm start
```

Open:

```text
http://127.0.0.1:8602/editor.html
```

If that port is already busy, the dev server may pick another port. Use the URL printed by the terminal.

## The Basic Flow

1. Open the editor.
2. Select or create an actor.
3. Go to the costume/model area.
4. Add or import a GLB/GLTF model.
5. Use blocks to move the actor in 3D.
6. Use camera blocks or the stage camera controls to view the scene.
7. Save as an `.amx` Amethyst project.
8. If testing the desktop app, export a single-file HTML build and open it offline.

## Actors And Models

In Amethyst, actors are the 3D version of sprites.

An actor can have:

- `x`, `y`, and `z` position.
- Rotation in 3D.
- 3D scale.
- Visibility.
- One or more model costumes.
- Future model-local points and editing data.

An actor without a model may still exist for scripts, variables, sounds, and logic, but it should not be treated as a normal visible 2D sprite.

## Moving In 3D

Use the 3D motion blocks:

- `go to x y z`
- `glide secs to x y z`
- `change z by`
- `set z to`
- `z position`
- yaw, pitch, and roll turn blocks

The user-facing coordinate direction is:

```text
x -> left/right
y -> forward/back
z -> up/down
```

Internally, Three.js may use a different axis convention. Blocks and docs should describe the kid-facing Amethyst convention.

The stage is intended to feel effectively infinite. Actors can move far outside the old 2D Scratch stage size.

## Camera Basics

The camera has two important values:

- Position: where the camera is.
- Target: where the camera points.

Useful camera blocks:

- `set camera position x y z`
- `point camera at x y z`
- `turn camera left/right by`
- `turn camera up/down by`
- `set camera zoom to`
- `set camera smoothing duration to`
- `make camera follow this actor`
- `stop camera following`

Stage modes:

- View mode: normal editing and play view.
- Debug mode: shows camera debug information and camera direction helpers.

## Environment Basics

Environment blocks control the 3D scene around actors:

- sky color
- ground color
- fog amount
- sunlight angle
- sunlight color
- sunlight brightness
- ambient brightness
- stage/backdrop switching

These are 3D stage settings, not 2D backdrops.

## Saving Projects

Amethyst uses `.amx` as its native project format.

`.amx` is not `.sb3`.

The intended save data includes:

- scripts
- actors
- model assets
- model costumes
- actor transforms
- camera settings
- environment settings
- stage/backdrop settings
- future model editing data

Save/load is active and should work for normal Amethyst projects, but keep backups while the format is still changing.

## Desktop HTML Export

The desktop app can export a project into one offline `.html` file.

Use this when you want to share/play a finished Amethyst project without shipping the editor.

Important details:

- export input is `.amx`
- export output is `.html`
- this is not `.sb3` export
- the exported file bundles the player runtime
- project data is embedded as chunked base85 data to avoid huge base64 strings
- the exported file is for playing, not editing

## Common Problems

### A model imports but does not show

Try a simple GLB first. Complex textured GLB files may expose loader, material, path, or size problems.

Check:

- Is the model assigned to the selected actor?
- Is the actor visible?
- Is the actor far away from the camera?
- Is the model extremely large or tiny?
- Is the camera pointing at the actor?

### Camera feels stuck

Check whether camera follow, first-person mode, or third-person mode is active. Those modes intentionally drive the camera continuously.

### Blocks have the wrong color

Hard refresh the browser after block-definition changes. Blockly can keep old block definitions during a running editor session.

### Network blocks do nothing

Network blocks are experimental and browser-safe. Browser CORS rules still apply.

## Build

```powershell
cd scratch-gui
npm run build
```

The build output is produced by `scratch-gui`.
