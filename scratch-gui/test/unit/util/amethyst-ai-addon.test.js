import fs from 'fs';
import path from 'path';

const read = file => fs.readFileSync(path.resolve(__dirname, file), 'utf8');

describe('AmethystAI addon', () => {
    test('is registered as the final addon', () => {
        const addonList = read('../../../src/addons/addons.js');
        const manifestEntries = read('../../../src/addons/generated/addon-manifests.js');
        const runtimeEntries = read('../../../src/addons/generated/addon-entries.js');

        expect(addonList).toMatch(/'editor-stepping',\s*'amethyst-ai'\s*\]/);
        expect(manifestEntries).toMatch(/"editor-stepping": _editor_stepping,\s*"amethyst-ai": _amethyst_ai,\s*};/);
        expect(runtimeEntries).toMatch(/"editor-stepping": \(\) => import\([^)]+"..\/addons\/editor-stepping\/_runtime_entry\.js"\),\s*"amethyst-ai": \(\) => import\([^)]+"..\/addons\/amethyst-ai\/_runtime_entry\.js"\),\s*};/);
    });

    test('is experimental and off by default', () => {
        const manifest = read('../../../src/addons/addons/amethyst-ai/_manifest_entry.js');

        expect(manifest).toContain('"name": "AmethystAI"');
        expect(manifest).toContain('"dynamicDisable": true');
        expect(manifest).toContain('"enabledByDefault": false');
        expect(manifest).toContain('"beta"');
        expect(manifest).toContain('"danger"');
    });

    test('hides incompatible addons from the Addons page', () => {
        const settings = read('../../../src/addons/settings/settings.jsx');
        const settingsStore = read('../../../src/addons/settings-store.js');

        for (const addonId of [
            '2d-color-picker',
            'better-img-uploads',
            'bitmap-copy',
            'block-cherry-picking',
            'block-duplicate',
            'disable-stage-drag-select',
            'hide-stage',
            'paint-by-default',
            'paint-skew',
            'paint-snap',
            'pick-colors-from-stage',
            'remove-curved-stage-border',
            'tw-disable-cloud-variables',
            'tw-disable-compiler',
            'tw-disable-vibration',
            'tw-remove-backpack',
            'tw-remove-feedback'
        ]) {
            expect(settings).toContain(`'${addonId}'`);
        }
        expect(settings).toContain('hiddenAmethystIncompatibleAddons.has(id)');
        expect(settingsStore).toContain('disabledAmethystIncompatibleAddons.has(addonId)');
    });

    test('chat UI is compact until opened and removes itself when disabled', () => {
        const userscript = read('../../../src/addons/addons/amethyst-ai/userscript.js');

        expect(userscript).toContain('const BUTTON_ID = "amethyst-ai-button"');
        expect(userscript).toContain('const CHAT_ID = "amethyst-ai-chat"');
        expect(userscript).toContain('addon.self.addEventListener("disabled", update)');
        expect(userscript).toContain('removeAmethystAI();');
        expect(userscript).toContain('createButton();');
        expect(userscript).toContain('button.addEventListener("click", toggleChat)');
    });

    test('chat can send project context to a real OpenAI-compatible API', () => {
        const userscript = read('../../../src/addons/addons/amethyst-ai/userscript.js');

        expect(userscript).toContain('const DEFAULT_ENDPOINT = "https://api.openai.com/v1/chat/completions"');
        expect(userscript).toContain('localStorage.getItem(STORAGE_KEY)');
        expect(userscript).toContain('fetch(endpoint');
        expect(userscript).toContain('Authorization');
        expect(userscript).toContain('buildAgentContext()');
        expect(userscript).toContain('Agent skills');
        expect(userscript).toContain('inspect_project');
    });

    test('project context collection avoids fragile VM target methods', () => {
        const userscript = read('../../../src/addons/addons/amethyst-ai/userscript.js');

        expect(userscript).toContain('const getTargets = () =>');
        expect(userscript).toContain('runtime.targets.filter(target => target && typeof target === "object")');
        expect(userscript).toContain('const getTargetName = target =>');
        expect(userscript).not.toContain('target.getName ? target.getName()');
    });

    test('agent has a block catalog and bounded tool loop', () => {
        const userscript = read('../../../src/addons/addons/amethyst-ai/userscript.js');

        expect(userscript).toContain('const MAX_AGENT_STEPS = 5');
        expect(userscript).toContain('const CORE_BLOCK_CATALOG =');
        expect(userscript).toContain('const collectBlockCatalog = () =>');
        expect(userscript).toContain('const runAgentLoop = async');
        expect(userscript).toContain('for (let step = 0; step < MAX_AGENT_STEPS; step++)');
        expect(userscript).toContain('executeAgentTool');
        expect(userscript).toContain('agent_tool');
    });

    test('agent tools expose project, block, script, and actor edit abilities', () => {
        const userscript = read('../../../src/addons/addons/amethyst-ai/userscript.js');

        for (const toolName of [
            'list_blocks',
            'inspect_project',
            'inspect_target_scripts',
            'set_actor_value',
            'set_camera_value',
            'draft_script',
            'place_blocks'
        ]) {
            expect(userscript).toContain(toolName);
        }
    });

    test('agent can place real validated block stacks on sprites and backdrops', () => {
        const userscript = read('../../../src/addons/addons/amethyst-ai/userscript.js');

        expect(userscript).toContain('const placeBlocksOnTarget = args =>');
        expect(userscript).toContain('const buildBlockStack = (blockSpecs, parentId, topLevel, state) =>');
        expect(userscript).toContain('const createLiteralInput = (inputName, value, parentId, state) =>');
        expect(userscript).toContain('const assertKnownOpcode = opcode =>');
        expect(userscript).toContain('target.blocks.createBlock(block)');
        expect(userscript).toContain('target.blocks.createBlock(shadow)');
        expect(userscript).toContain('vm.setEditingTarget(target.id)');
        expect(userscript).toContain('vm.emitWorkspaceUpdate()');
        expect(userscript).toContain('target.isStage');
        expect(userscript).toContain('place actual blocks on a sprite or backdrop');
        expect(userscript).not.toContain('Real block graph insertion needs the next AmethystAI editing milestone');
    });

    test('mutating agent tools require approval before applying edits', () => {
        const userscript = read('../../../src/addons/addons/amethyst-ai/userscript.js');
        const css = read('../../../src/addons/addons/amethyst-ai/sidebar.css');

        expect(userscript).toContain('const MUTATING_TOOLS = new Set(["set_actor_value", "set_camera_value", "place_blocks"])');
        expect(userscript).toContain('const addApprovalMessage = (chat, tool) =>');
        expect(userscript).toContain('data-approve-tool');
        expect(userscript).toContain('data-cancel-tool');
        expect(userscript).toContain('executeAgentTool(pendingTool)');
        expect(userscript).toContain('Approval required');
        expect(userscript).toContain('Open the editor page before applying project edits.');
        expect(userscript).toContain('if (MUTATING_TOOLS.has(tool.name))');
        expect(userscript).toContain('return {reply: "Approval required", pendingTool: tool}');
        expect(css).toContain('.amethyst-ai-approval');
        expect(css).toContain('.amethyst-ai-approval-actions');
    });
});
