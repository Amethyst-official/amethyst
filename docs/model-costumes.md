# Model Costumes

Amethyst replaces the old 2D costume idea with 3D model costumes.

In Scratch, a sprite can switch between costumes. In Amethyst, an actor should be able to switch between model costumes.

> Status: early. The workflow exists in pieces and is still being cleaned up.

## What A Model Costume Is

A model costume is a 3D asset attached to an actor.

It can include:

- mesh geometry
- materials
- textures
- local transforms
- display name
- future pivot/editing metadata

Supported first:

```text
.glb
.gltf
```

GLB is recommended because it can package geometry, materials, and textures into one file.

## Actor And Costume Relationship

An actor can have multiple model costumes.

Example:

```text
Actor: Player
  Costume 1: robot-idle.glb
  Costume 2: robot-run.glb
  Costume 3: robot-damaged.glb
```

The long-term goal is to keep this as close as possible to the original Scratch costume list:

- select a costume
- duplicate a costume
- rename a costume
- delete a costume
- import a costume
- edit a costume
- switch costumes with blocks

## Importing Models

Recommended test flow:

1. Select an actor.
2. Open the costume/model tab.
3. Import a `.glb` file.
4. Confirm it appears in the costume list.
5. Confirm it appears in the preview.
6. Confirm the actor renders in the 3D stage.

If the model does not show:

- Try a simple GLB cube/sphere first.
- Check if the actor is hidden.
- Check if the actor is far away from the camera.
- Check if the model scale is huge or tiny.
- Check browser console errors.
- Try a GLB with embedded textures.

## Good GLB Export Settings

When exporting from Blender or another model tool:

- Prefer `.glb`.
- Embed textures.
- Apply transforms before export when possible.
- Keep texture sizes reasonable.
- Keep polygon count low for browser performance.
- Put the model origin near the useful center of the object.
- Avoid unsupported material tricks.

## Pivots

A pivot is the point an object rotates around.

For kids, the rule should be simple:

```text
Move the pivot dot to where the part should spin.
```

Examples:

- A door pivots at the hinge.
- An arm pivots at the shoulder.
- A wheel pivots at its center.
- A turret pivots at its base.

Future model editing should allow creators to set pivots visually instead of typing numbers.

## Model Editing Direction

The model editor should be simple and kid-friendly.

Good tools:

- select a part
- move a part
- rotate a part
- scale a part
- set pivot point
- color a part
- reset part transform
- duplicate simple primitive parts

Avoid in v1:

- full mesh sculpting
- skeleton editing
- UV editing
- advanced material node editing
- Blender-level workflows

Amethyst should help kids build simple game actors without forcing them to leave the app.

## Coloring Models

Model coloring should work at two levels:

- whole-model color
- selected-part color

Useful behavior:

- keep original material color as the reset value
- show a color swatch
- allow clear/reset color
- avoid destroying imported material data

If a model uses complex materials or textures, recoloring may not look perfect.

## Common Problems

### The model imports but looks invisible

Possible causes:

- transparent material
- wrong camera position
- huge scale
- tiny scale
- missing texture
- unsupported material
- model origin far from geometry

### The model is black

Possible causes:

- no light
- broken material
- missing texture
- environment lighting bug

### The model is enormous

The file may be exported in meters or another unit scale. Use actor scale or future model-editing scale tools.

### Textures are missing

Use GLB with embedded textures. Loose `.gltf` files can depend on external `.bin` and texture files.

## Block Behavior

Looks/model blocks should eventually cover:

- switch model costume
- next model costume
- set model color
- clear model color
- show actor
- hide actor
- set scale

Motion blocks should move the actor, not the raw model mesh.

Model-editing tools should edit the costume/model data, not secretly change the actor's world position.
