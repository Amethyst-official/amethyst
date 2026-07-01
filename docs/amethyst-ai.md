# AmethystAI

AmethystAI is an experimental addon that lets a user connect an AI provider to help edit an Amethyst project.

> Status: experimental. This feature should be off by default and should leave no visible editor trace when disabled.

## Goal

The goal is to make coding easier inside Amethyst.

AmethystAI should eventually be able to:

- understand available blocks
- inspect actors
- inspect stage/backdrop data
- inspect scripts in a machine-readable format
- suggest blocks
- place blocks after user approval
- edit actor values after user approval
- edit camera/environment values after user approval
- explain project behavior

## Provider Setup

Users should enter their own provider settings.

Supported direction:

- OpenAI-compatible APIs
- DeepSeek-compatible APIs
- Anthropic
- Gemini/Google

Settings should include:

```text
provider
base URL
API key
model name
```

API keys must be user-provided. Do not hardcode keys.

## Safety Model

AmethystAI should not silently mutate projects.

Project-changing actions should require approval.

Examples of actions that need approval:

- place blocks
- delete blocks
- change actor position
- change actor model
- change camera values
- change environment values
- edit project metadata
- send network requests on behalf of the project

Read-only actions can be automatic:

- list actors
- list blocks
- inspect stage state
- inspect selected actor
- explain script behavior

## Agent Tools

The AI should receive a clear list of tools instead of guessing.

Useful tools:

```text
list_blocks
list_actors
get_selected_actor
get_actor_state
set_actor_value
get_stage_state
set_camera_value
set_environment_value
get_scripts
place_blocks
draft_script
explain_project
```

Mutation tools should return a pending action that the user can approve or reject.

## Tool Approval UI

When the AI proposes a tool call, the UI should show:

- what tool will run
- what actor/stage it affects
- old value if available
- new value
- approve button
- reject button

No approval button means no real agent. The user needs control.

## System Prompt

The system prompt should tell the AI:

- this is Amethyst, a 3D block coding editor
- use Scratch-style kid-friendly logic
- prefer blocks over raw code
- explain changes simply
- ask before destructive changes
- use tools for project edits
- do not claim unsupported features exist
- network actions are sensitive

The prompt should include the current block inventory or a way to request it.

## Loop Agent Behavior

A mature agent should work in a loop:

1. Understand request.
2. Inspect project.
3. Plan changes.
4. Propose tool calls.
5. Wait for approval when mutating.
6. Apply approved changes.
7. Inspect result.
8. Explain what changed.

It should stop if tools fail instead of pretending the project changed.

## Browser vs Desktop

Current web version should stay browser-safe.

Browser limitations:

- CORS applies
- local file access is limited
- pointer/security permissions apply
- secrets must be handled carefully

Future desktop version may allow deeper local access, but that should be designed separately with stronger safety rules.

## What Not To Do

Do not:

- ship a default API key
- hide network/API calls
- mutate projects without approval
- expose secrets to project scripts
- pretend every provider has the same API shape
- leave AmethystAI UI visible when the addon is disabled
- make the agent sound more capable than its tools allow

## Current Documentation Gap

Before AmethystAI is treated as user-ready, add:

- setup screenshots
- provider examples
- exact tool schema
- approval-flow screenshots
- privacy warning
- troubleshooting guide
