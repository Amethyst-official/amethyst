# Block Reference

This page documents Amethyst-specific blocks and categories. Original Scratch/TurboWarp-style blocks still exist where they make sense for 3D projects.

> Status: this reference follows the current early-development editor. Names and behavior may change.

## Motion

Motion blocks control actor position, rotation, and movement.

Important 3D blocks:

- `go to x y z`
- `glide secs to x y z`
- `change z by`
- `set z to`
- `z position`
- turn yaw by
- turn pitch by
- turn roll by
- move steps left/right

Use `x`, `y`, and `z` as real 3D coordinates. The old 2D stage bounds should not be treated as the limit of the world.

## Looks And Model Blocks

Looks is being adapted from 2D costumes into 3D model behavior.

Model-related behavior includes:

- showing and hiding actors
- switching model costumes
- setting model color
- clearing model color
- changing size/scale

The long-term goal is for the costume tab to feel like Scratch, but with model costumes instead of bitmap/vector costumes.

## Camera

Camera blocks control what the player sees.

### `set camera position x y z`

Moves the camera to a 3D position.

### `point camera at x y z`

Sets the camera target.

### `turn camera left/right by`

Rotates the camera target horizontally around the current camera position.

### `turn camera up/down by`

Rotates the camera target vertically around the current camera position.

### `set camera zoom to`

Sets the camera field of view. Lower values feel more zoomed in. Higher values feel wider.

### `set camera smoothing duration to`

Makes camera movement interpolate over time. This is useful for cinematic camera motion.

### `make camera follow this actor`

Makes the camera follow the current actor.

### `stop camera following`

Returns camera control to normal camera blocks and orbit controls.

## Environment

Environment blocks control the 3D stage world.

### `set environment to`

Applies a preset such as sunny, sunset, night, space, or studio.

### `set sky color to`

Changes the procedural sky/background color.

### `set ground color to`

Changes the ground color.

### `set fog amount to`

Adds distance fog. Larger values make distant objects fade more.

### `set sunlight angle direction height`

Moves the main sun/directional light.

### `set sun color to`

Changes sunlight color.

### `set sunlight brightness to`

Changes the main directional light brightness.

### `set ambient brightness to`

Changes the general scene light.

### `change stage to`

Switches to another 3D stage/backdrop entry.

### `next stage`

Moves to the next 3D stage/backdrop entry.

## Mouse

Mouse blocks help creators build first-person and third-person controls.

### `show mouse`

Shows the cursor.

### `hide mouse`

Hides the cursor.

### `set mouse mode to`

Modes:

- `normal`
- `first person`
- `third person`

### `set mouse sensitivity to`

Changes how strongly mouse movement affects camera/mouse-controlled views.

### `set third person distance to`

Changes camera distance in third-person mode.

### `grab mouse`

Requests pointer lock when supported by the browser.

### `release mouse`

Exits pointer lock.

### Mouse reporters

- `mouse down?`
- `left/middle/right mouse down?`
- `mouse x`
- `mouse y`
- `mouse z`
- `mouse movement x`
- `mouse movement y`
- `mouse mode`

## Operators

Amethyst adds extra conversion helpers:

- decimal to hex
- decimal to binary
- hex to decimal
- binary to decimal

These belong in Operators because they transform values.

## Network

> Status: experimental and browser-safe.

Network blocks are intentionally lower in the toolbox and require confirmation.

Creator warning:

```text
Do not listen to anyone who told you to use this. Only use Network if you know what you are doing.
```

Blocks include:

- `I understand Network blocks`
- `network enabled?`
- `send request`
- `send api request`
- response text
- response status
- response ok?
- JSON get
- JSON set
- JSON valid?
- JSON stringify

Browser restrictions still apply. CORS, mixed content, and site permissions can block requests.

## Media Display

> Status: experimental.

Media Display turns an actor into a 3D plane that can show image or video content.

Blocks include:

- `set image url`
- `set video url`
- `set uploaded media`
- `set media size`
- `play media`
- `pause media`
- `restart media`
- media time
- media duration
- media loaded?

This category is for 3D display surfaces, not old 2D costumes.

## Events

Events keep the Scratch-style project model alive:

- green flag
- key pressed
- broadcasts
- clone events
- actor clicked events
- 3D actor click helpers

## Control

Control blocks are mostly unchanged:

- wait
- repeat
- forever
- if
- if/else
- wait until
- repeat until
- clones
- stop

There is no built-in physics engine in v1. Gravity, collisions, and platformer behavior should be scripted or added later as optional libraries.

## Variables And Lists

Variables and lists remain core to Amethyst projects. They are still the easiest way to store game state.

Examples:

- player health
- score
- current level
- inventory
- dialogue state
- camera mode

## My Blocks

My Blocks should be used for reusable game logic:

- move player
- update camera
- spawn enemy
- reset level
- play cutscene

Keep custom blocks kid-friendly. If a child cannot guess what the block does from the label, the label is too clever.
