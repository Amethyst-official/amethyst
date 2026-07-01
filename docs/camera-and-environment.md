# Camera And Environment

The 3D stage is controlled by camera state and environment state.

Camera controls decide what the player sees. Environment controls decide what the world around the actors looks like.

## Camera State

The camera has these core values:

```text
position  where the camera is
target    where the camera looks
fov       camera zoom / field of view
smoothing how long camera changes take
follow    optional actor-follow behavior
```

Position and target are both 3D points:

```text
x, y, z
```

## Position vs Target

Think of the camera like a person holding a phone:

- position is where the person is standing
- target is what the phone is pointed at

Example:

```text
camera position: x 260, y 180, z 420
camera target:   x 0,   y 20,  z 0
```

This puts the camera away from the center and points it toward the scene.

## Camera Blocks

### Set Camera Position

Moves the camera.

Useful for:

- cutscenes
- fixed camera angles
- top-down views
- moving to another area

### Point Camera At

Changes where the camera looks.

Useful for:

- looking at the player
- looking at an object
- focusing on a door, enemy, or goal

### Turn Camera Left/Right

Rotates the camera view horizontally.

### Turn Camera Up/Down

Rotates the camera view vertically.

### Set Camera Zoom

Changes field of view.

Lower value:

- more zoomed in
- more cinematic

Higher value:

- wider view
- more game-like

### Set Camera Smoothing Duration

Makes camera movement slide instead of snapping instantly.

Example:

```text
set camera smoothing duration to 0.35
```

This means camera changes take about 0.35 seconds.

## Follow Camera

Follow camera is useful for player-controlled games.

Blocks:

- `make camera follow this actor`
- `stop camera following`
- `set camera follow distance to`
- `set camera follow height to`

When follow is active, manual orbit and normal camera state should not fight it.

## Mouse Camera Modes

Mouse modes:

```text
normal
first person
third person
```

### Normal

Normal mode is for editing and regular orbit controls.

### First Person

First-person mode is for games where the camera acts like the player's eyes.

It may request pointer lock. Browsers usually require a user click before pointer lock works.

### Third Person

Third-person mode keeps the camera behind or around an actor.

Useful for:

- platformers
- adventure games
- character controllers

## Debug Mode

Debug mode should help creators understand the camera.

Useful debug information:

- camera position
- camera target
- camera direction
- field of view
- follow enabled?
- mouse mode
- selected actor position

Debug mode should be visual, but not noisy.

## Environment State

Environment values control the scene background and lighting.

Core values:

```text
sky color
ground color
fog amount
sunlight direction
sunlight height
sun color
sun brightness
ambient brightness
stage/backdrop entry
```

## Environment Blocks

### Set Environment Preset

Applies a preset:

- sunny
- sunset
- night
- space
- studio

Presets are shortcuts. Creators can still change individual settings after applying one.

### Set Sky Color

Changes the background sky color.

### Set Ground Color

Changes the ground color.

### Set Fog Amount

Adds fog over distance.

Small values are subtle. Large values can hide far-away objects.

### Set Sunlight Angle

Changes the direction and height of the sun.

Direction is horizontal rotation. Height is vertical angle.

### Set Sun Color

Changes directional light color.

Examples:

- white for daytime
- orange for sunset
- blue/purple for night or fantasy scenes

### Set Sunlight Brightness

Controls the main directional light.

### Set Ambient Brightness

Controls the general fill light.

Ambient light keeps shadows from becoming totally black.

## Stages And Backdrops

Amethyst uses 3D stage/backdrop entries, not classic 2D backdrops.

A stage/backdrop entry should store:

- background settings
- camera settings
- environment settings
- name

Blocks:

- `change stage to`
- `next stage`

## HDRI And Custom Backgrounds

Planned/early background modes:

- procedural sky
- user-drawn/custom image
- HDRI or panorama

HDRI support is more complex because it affects both background and lighting/reflections.

## Common Problems

### The camera will not move

Check:

- Is follow camera active?
- Is first-person mode active?
- Is third-person mode active?
- Is smoothing making movement appear delayed?
- Is another script setting camera position every frame?

### The scene is too dark

Try:

- increase ambient brightness
- increase sunlight brightness
- set sun color to white
- use studio preset

### Fog hides everything

Lower fog amount or switch to a clearer preset.
