# Save Files

Amethyst uses `.amx` as its native project format direction.

`.amx` is not Scratch `.sb3`.

> Status: save/load is still being stabilized. Treat important projects as experimental and keep backups.

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

## User Warning

Until save/load is fully stable, warn users not to rely on a single `.amx` file for important work.

Suggested wording:

```text
Amethyst projects are still experimental. Keep backup copies while save/load is being improved.
```
