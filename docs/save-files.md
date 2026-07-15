# Save Files

Amethyst uses `.amx` as its native project format.

`.amx` is not Scratch `.sb3`.

> Status: save/load is active, but the format is still young. Keep backups for serious projects while the editor is changing quickly.

## Why A New Format

Scratch projects are built around a 2D stage and 2D costumes.

Amethyst needs to store 3D-specific data:

- model actors
- model costumes
- GLB/GLTF assets
- 3D transforms
- camera settings
- environment settings
- model-editing data
- future pivot/part data

Trying to round-trip normal Scratch files would make the first version fragile and confusing.

## Intended Contents

An `.amx` project should store:

```text
project metadata
actors
scripts
variables
lists
sounds
models
model costumes
actor transforms
stage/backdrop entries
camera settings
environment settings
media assets
future model-editing metadata
```

## Actor Data

Actors should store:

```text
name
id
x
y
z
rotation x/y/z or yaw/pitch/roll
scale
visible
current model costume
model costume list
scripts
variables if actor-local
lists if actor-local
```

## Model Costume Data

Model costumes should store:

```text
name
asset id
file type
preview data if needed
model-local transform edits
pivot data
part colors
part transforms
```

## Stage Data

Stage/backdrop entries should store:

```text
name
background mode
sky color
ground color
fog amount
custom image or HDRI data
camera position
camera target
camera fov
camera smoothing
lighting values
```

## Scripts

Scripts should preserve block stacks for:

- actors
- stage/backdrop
- variables
- lists
- broadcasts
- custom blocks

The VM should remain responsible for block execution.

## Asset Data

Assets may include:

- GLB files
- GLTF files and related files
- sounds
- custom background images
- HDRI/panorama files
- uploaded media display files

Prefer storing model assets by asset id and referencing them from actor/model costume data.

## Compatibility

Do not assume:

```text
.amx -> .sb3
.sb3 -> .amx
```

Scratch compatibility can be explored later, but it is not a v1 requirement.

## Desktop HTML Export

The desktop app can export an `.amx` project into a single offline `.html` file.

That exported HTML is a playback bundle, not the native project format.

```text
.amx -> .html
```

Do not treat exported HTML as an editable project source. Users should edit the `.amx` in Amethyst and export a fresh HTML file when they want a playable build.

Current exporter direction:

- only desktop exposes the export flow
- the generated file is one `.html`
- the Amethyst player runtime is bundled into the file
- the `.amx` project payload is embedded in base85 chunks
- chunking avoids one huge base64 payload and reduces browser crash risk
- exported files are intended to open offline

## Versioning

The format should include a version field.

Example:

```json
{
  "format": "amethyst",
  "version": 1
}
```

This lets future versions migrate older project files instead of guessing.

## Reliability Checklist

Save/load should be considered healthy only when this works:

- create an actor
- assign a model
- add scripts
- set actor `x`, `y`, `z`
- change camera settings
- change environment settings
- save `.amx`
- reload `.amx`
- actor appears with model
- scripts remain
- camera remains
- environment remains
- model costume list remains

Export should be considered healthy only when this works:

- save a project as `.amx`
- export single-file `.html` from desktop
- disconnect internet or block network
- open exported `.html`
- actor models appear
- scripts run
- camera settings load
- environment settings load
- no `.sb3` wording appears in the export path

## User Warning

Until save/load and export are fully battle-tested, warn users to keep the editable `.amx` and backups. Do not tell users to edit exported HTML.

Suggested wording:

```text
Amethyst projects are still evolving. Keep backup copies, and keep the original .amx after exporting HTML.
```
