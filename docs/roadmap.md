# Roadmap

This roadmap is a working direction, not a promise.

Amethyst is early. The priority is to make the editor, `.amx` files, 3D actors, and desktop HTML export reliable enough for a first public desktop release.

## Now

Focus:

- reliable web editor startup
- stable 3D stage rendering
- model actors rendering correctly
- basic GLB/GLTF import
- multiple model costumes per actor
- camera blocks
- environment blocks
- mouse blocks
- `.amx` save/load reliability
- desktop single-file offline HTML export reliability
- 64-bit Electron desktop packaging
- clear docs
- clean Amethyst branding with legal credits intact

## Next

After the basics feel solid:

- better model costume UI
- better model preview
- simple model editing tools
- visual pivot editing
- part selection overlay
- model part coloring
- custom stage/background UI polish
- HDRI/panorama background improvements
- better debug mode
- desktop release checklist polish
- larger exported-HTML stress tests
- more complete block examples
- beginner tutorials

## Later

Useful later features:

- 32-bit Electron packaging
- experimental Tauri x64 packaging
- optional physics library
- optional controller/gamepad helpers
- project templates
- richer model import diagnostics
- better asset management
- AmethystAI project-editing tools with safer approval flow
- extension/plugin system cleanup

## Not Planned For v1

These should not be implied by UI or docs as finished v1 features:

- built-in physics engine
- Scratch `.sb3` round-tripping
- cloud sharing
- marketplace
- multiplayer
- skeleton/bone editing
- advanced mesh sculpting
- full Blender-style modeling
- education curriculum

## Product Principles

Amethyst should feel like:

```text
Scratch, but for simple 3D games.
```

Not:

```text
Blender inside Scratch.
Unity with blocks.
An official Scratch product.
```

## Technical Principles

- Keep the VM alive for scripts and block execution.
- Use Three.js for 3D rendering.
- Keep 3D rendering behind clear stage/model boundaries.
- Keep block labels kid-friendly.
- Do not add advanced systems before save/load and model rendering are reliable.
- Keep legal credits intact.

## Documentation Roadmap

Docs still needed:

- model editing deep dive
- `.amx` format details after implementation stabilizes
- desktop export troubleshooting guide
- complete block examples
- first game tutorial
- model import troubleshooting guide with screenshots
- AmethystAI safety and setup guide
- 32-bit Electron and Tauri build guides after those targets work
