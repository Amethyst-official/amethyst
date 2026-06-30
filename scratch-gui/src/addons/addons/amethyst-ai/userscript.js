const BUTTON_ID = "amethyst-ai-button";
const CHAT_ID = "amethyst-ai-chat";
const STORAGE_KEY = "amethystAISettings";
const DEFAULT_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const MAX_AGENT_STEPS = 5;
const MUTATING_TOOLS = new Set(["set_actor_value", "set_camera_value", "place_blocks"]);

const CORE_BLOCK_CATALOG = [
  {category: "Motion", opcode: "motion_movesteps", text: "move [STEPS] steps"},
  {category: "Motion", opcode: "motion_movesidewayssteps", text: "move [STEPS] steps [DIRECTION]"},
  {category: "Motion", opcode: "motion_turnyawby", text: "turn yaw by [DEGREES] degrees"},
  {category: "Motion", opcode: "motion_turnpitchby", text: "turn up/down by [DEGREES] degrees"},
  {category: "Motion", opcode: "motion_turnrollby", text: "roll by [DEGREES] degrees"},
  {category: "Motion", opcode: "motion_gotoxy", text: "go to x [X] y [Y] z [Z]"},
  {category: "Motion", opcode: "motion_glidesecstoxy", text: "glide [SECS] secs to x [X] y [Y] z [Z]"},
  {category: "Motion", opcode: "motion_changezby", text: "change z by [DZ]"},
  {category: "Motion", opcode: "motion_setz", text: "set z to [Z]"},
  {category: "Motion", opcode: "motion_zposition", text: "z position"},
  {category: "Looks", opcode: "looks_show", text: "show"},
  {category: "Looks", opcode: "looks_hide", text: "hide"},
  {category: "Looks", opcode: "looks_setmodelcolor", text: "set model color to [COLOR]"},
  {category: "Camera", opcode: "scene3d_setcameraposition", text: "set camera position x [X] y [Y] z [Z]"},
  {category: "Camera", opcode: "scene3d_pointcameraat", text: "point camera at x [X] y [Y] z [Z]"},
  {category: "Camera", opcode: "scene3d_turncameraupdownby", text: "turn camera up/down by [DEGREES]"},
  {category: "Camera", opcode: "scene3d_turncameraleftrightby", text: "turn camera left/right by [DEGREES]"},
  {category: "Camera", opcode: "scene3d_setcamerafov", text: "set camera fov to [FOV]"},
  {category: "Camera", opcode: "scene3d_setcamerasmoothingduration", text: "set camera smoothing duration to [SECONDS]"},
  {category: "Camera", opcode: "scene3d_followthisactor", text: "make camera follow this actor"},
  {category: "Camera", opcode: "scene3d_stopfollowing", text: "stop camera following"},
  {category: "Environment", opcode: "scene3d_setenvironmentpreset", text: "set environment to [PRESET]"},
  {category: "Environment", opcode: "scene3d_setskycolor", text: "set sky color to [COLOR]"},
  {category: "Environment", opcode: "scene3d_setgroundcolor", text: "set ground color to [COLOR]"},
  {category: "Environment", opcode: "scene3d_setfogamount", text: "set fog amount to [AMOUNT]"},
  {category: "Environment", opcode: "scene3d_setsunangle", text: "set sunlight angle direction [AZIMUTH] height [ELEVATION]"},
  {category: "Environment", opcode: "scene3d_setsuncolor", text: "set sun color to [COLOR]"},
  {category: "Environment", opcode: "scene3d_setkeylight", text: "set sunlight brightness to [BRIGHTNESS]"},
  {category: "Environment", opcode: "scene3d_setambientlight", text: "set ambient brightness to [BRIGHTNESS]"},
  {category: "Environment", opcode: "scene3d_switchbackdrop", text: "change stage to [BACKDROP]"},
  {category: "Environment", opcode: "scene3d_nextbackdrop", text: "next stage"},
  {category: "Mouse", opcode: "mouse_showcursor", text: "show mouse"},
  {category: "Mouse", opcode: "mouse_hidecursor", text: "hide mouse"},
  {category: "Mouse", opcode: "mouse_setmode", text: "set mouse mode to [MODE]"},
  {category: "Mouse", opcode: "mouse_lock", text: "lock mouse"},
  {category: "Mouse", opcode: "mouse_unlock", text: "unlock mouse"},
  {category: "Events", opcode: "event_whenflagclicked", text: "when green flag clicked"},
  {category: "Control", opcode: "control_forever", text: "forever"},
  {category: "Control", opcode: "control_repeat", text: "repeat [TIMES]"},
  {category: "Control", opcode: "control_if", text: "if [CONDITION] then"},
  {category: "Control", opcode: "control_wait", text: "wait [DURATION] seconds"},
  {category: "Operators", opcode: "operator_add", text: "[NUM1] + [NUM2]"},
  {category: "Operators", opcode: "operator_subtract", text: "[NUM1] - [NUM2]"},
  {category: "Operators", opcode: "operator_hex", text: "hex [VALUE]"},
  {category: "Operators", opcode: "operator_bin", text: "binary [VALUE]"},
  {category: "Variables", opcode: "data_setvariableto", text: "set [VARIABLE] to [VALUE]"},
  {category: "Variables", opcode: "data_changevariableby", text: "change [VARIABLE] by [VALUE]"},
  {category: "Network", opcode: "network_sendrequest", text: "send request [URL]"},
  {category: "Network", opcode: "network_sendapirequest", text: "send api request [URL] [BODY]"},
  {category: "Media Display", opcode: "media_display_seturl", text: "set media display URL to [URL]"},
  {category: "Media Display", opcode: "media_display_play", text: "play media display"},
  {category: "Media Display", opcode: "media_display_pause", text: "pause media display"}
];

const PROVIDER_PRESETS = {
  openai: {
    name: "OpenAI compatible",
    baseUrl: DEFAULT_ENDPOINT,
    model: "gpt-4.1-mini"
  },
  deepseek: {
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat"
  },
  anthropic: {
    name: "Anthropic",
    baseUrl: "https://api.anthropic.com/v1/messages",
    model: "claude-3-5-haiku-latest"
  },
  gemini: {
    name: "Gemini / Google",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-1.5-flash"
  }
};

const DEFAULT_SETTINGS = {
  provider: "openai",
  baseUrl: PROVIDER_PRESETS.openai.baseUrl,
  model: PROVIDER_PRESETS.openai.model,
  apiKey: ""
};

const SAFE_LITERAL_SHADOW_OPCODES = new Set(["math_number", "text", "logic_boolean"]);

const getRuntime = () => window.vm && window.vm.runtime;

const getTargets = () => {
  const runtime = getRuntime();
  return runtime && Array.isArray(runtime.targets) ?
    runtime.targets.filter(target => target && typeof target === "object") :
    [];
};

const getTargetName = target => {
  if (!target) return "unknown";
  if (target.sprite && target.sprite.name) return target.sprite.name;
  if (target.name) return target.name;
  if (target.id) return target.id;
  return "unknown";
};

const loadSettings = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {...DEFAULT_SETTINGS, ...stored};
  } catch (e) {
    return {...DEFAULT_SETTINGS};
  }
};

const saveSettings = settings => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

const collectProjectSnapshot = () => {
  const targets = getTargets();
  return targets.map(target => ({
    id: target.id,
    name: getTargetName(target),
    isStage: Boolean(target.isStage),
    x: Number(target.x || 0),
    y: Number(target.y || 0),
    z: Number(target.z || 0),
    direction: Number(target.direction || 0),
    visible: target.visible !== false,
    currentCostume: target.currentCostume || 0,
    modelAssetId: target.modelAssetId || target.amethystModelAssetId || null
  }));
};

const collectBlocksSummary = () => {
  const targets = getTargets();
  return targets.map(target => {
    const blocks = target.blocks && target.blocks._blocks ? target.blocks._blocks : {};
    const opcodes = Object.values(blocks)
      .filter(block => block && block.opcode)
      .map(block => block.opcode);
    return {
      target: getTargetName(target),
      blockCount: opcodes.length,
      opcodes: opcodes.slice(0, 80)
    };
  });
};

const collectBlockCatalog = () => {
  const byOpcode = new Map();
  for (const block of CORE_BLOCK_CATALOG) {
    byOpcode.set(block.opcode, block);
  }

  const blockly = window.ScratchBlocks || window.Blockly;
  if (blockly && blockly.Blocks) {
    for (const opcode of Object.keys(blockly.Blocks)) {
      if (!byOpcode.has(opcode) && !opcode.startsWith("math_") && !opcode.startsWith("text_")) {
        byOpcode.set(opcode, {
          category: "Live registry",
          opcode,
          text: opcode.replace(/_/g, " ")
        });
      }
    }
  }

  const toolboxBlocks = document.querySelectorAll('xml block[type], [style*="display: none"] block[type]');
  for (const block of Array.from(toolboxBlocks)) {
    const opcode = block.getAttribute("type");
    if (opcode && !byOpcode.has(opcode)) {
      byOpcode.set(opcode, {
        category: "Toolbox",
        opcode,
        text: opcode.replace(/_/g, " ")
      });
    }
  }

  return Array.from(byOpcode.values()).sort((a, b) =>
    `${a.category}:${a.opcode}`.localeCompare(`${b.category}:${b.opcode}`)
  );
};

const collectTargetScripts = targetName => {
  const target = findTargetByName(targetName);
  if (!target) return {error: `Target not found: ${targetName}`};
  const blocks = target.blocks && target.blocks._blocks ? target.blocks._blocks : {};
  return {
    target: getTargetName(target),
    blocks: Object.entries(blocks).map(([id, block]) => ({
      id,
      opcode: block && block.opcode,
      next: block && block.next,
      parent: block && block.parent,
      inputs: block && block.inputs,
      fields: block && block.fields,
      topLevel: Boolean(block && block.topLevel)
    })).slice(0, 200)
  };
};

const buildAgentContext = () => ({
  app: "Amethyst",
  mode: "Scratch-style 3D editor",
  project: {
    actors: collectProjectSnapshot(),
    scripts: collectBlocksSummary()
  },
  blockCatalog: collectBlockCatalog().slice(0, 260),
  "Agent skills": [
    {
      name: "inspect_project",
      description: "Read actors, stage, coordinates, model IDs, and block opcode summaries."
    },
    {
      name: "list_blocks",
      description: "List available Scratch/Amethyst block opcodes, categories, and kid-readable labels."
    },
    {
      name: "inspect_target_scripts",
      description: "Read block IDs, opcodes, inputs, fields, and links for one target."
    },
    {
      name: "set_actor_value",
      description: "Change a target x, y, z, direction, or visible value by returning JSON actions."
    },
    {
      name: "set_camera_value",
      description: "Change simple camera fields when the 3D stage exposes camera state."
    },
    {
      name: "place_blocks",
      description: "place actual blocks on a sprite or backdrop using exact opcodes, literal inputs, fields, and optional SUBSTACK branches."
    },
    {
      name: "draft_script",
      description: "Draft a block script using available block opcodes when the user asks for a plan instead of an edit."
    }
  ],
  actionFormat: {
    note: "Use a bounded loop. To call a tool, reply only with JSON containing agent_tool. To finish, answer normally.",
    toolExample: {
      agent_tool: {
        name: "place_blocks",
        arguments: {
          target: "Sprite1",
          x: 60,
          y: 80,
          blocks: [
            {opcode: "event_whenflagclicked"},
            {opcode: "motion_gotoxy", inputs: {X: 0, Y: 0, Z: 120}}
          ]
        }
      }
    },
    example: {
      actions: [
        {
          type: "set_actor_value",
          target: "Sprite1",
          field: "z",
          value: 80
        }
      ]
    }
  }
});

const findTargetByName = name => {
  const targets = getTargets();
  return targets.find(target => {
    const targetName = getTargetName(target);
    return targetName === name ||
      target.id === name ||
      (target.isStage && ["Stage", "Backdrop", "_stage_", "__stage__"].includes(name));
  });
};

const makeAgentBlockId = state => `amethyst_ai_${Date.now().toString(36)}_${state.nextId++}`;

const getKnownOpcodes = () => new Set([
  ...collectBlockCatalog().map(block => block.opcode),
  ...SAFE_LITERAL_SHADOW_OPCODES
]);

const assertKnownOpcode = opcode => {
  if (!opcode || typeof opcode !== "string") {
    throw new Error("Every block needs an opcode.");
  }
  if (!getKnownOpcodes().has(opcode)) {
    throw new Error(`Unknown block opcode: ${opcode}. Call list_blocks before placing blocks.`);
  }
};

const createLiteralInput = (inputName, value, parentId, state) => {
  const id = makeAgentBlockId(state);
  const isNumber = typeof value === "number" || (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value)));
  const isBoolean = typeof value === "boolean";
  const shadow = {
    id,
    opcode: isBoolean ? "logic_boolean" : (isNumber ? "math_number" : "text"),
    inputs: {},
    fields: {},
    next: null,
    topLevel: false,
    parent: parentId,
    shadow: true,
    x: 0,
    y: 0
  };

  if (isBoolean) {
    shadow.fields.BOOL = {
      name: "BOOL",
      value: value ? "TRUE" : "FALSE"
    };
  } else if (isNumber) {
    shadow.fields.NUM = {
      name: "NUM",
      value: String(value)
    };
  } else {
    shadow.fields.TEXT = {
      name: "TEXT",
      value: String(value)
    };
  }

  state.created.push(shadow);
  return {
    name: inputName,
    block: id,
    shadow: id
  };
};

const normalizeField = (name, value) => {
  if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "value")) {
    return {
      name,
      value: String(value.value),
      id: value.id,
      variableType: value.variableType
    };
  }
  return {
    name,
    value: String(value)
  };
};

const buildBlockStack = (blockSpecs, parentId, topLevel, state) => {
  if (!Array.isArray(blockSpecs) || blockSpecs.length === 0) {
    return {first: null, last: null};
  }

  let first = null;
  let previous = null;
  for (const spec of blockSpecs) {
    if (!spec || typeof spec !== "object") {
      throw new Error("Each block spec must be an object.");
    }
    assertKnownOpcode(spec.opcode);

    const id = spec.id || makeAgentBlockId(state);
    const block = {
      id,
      opcode: spec.opcode,
      inputs: {},
      fields: {},
      next: null,
      topLevel: Boolean(topLevel && !previous),
      parent: previous ? previous.id : parentId,
      shadow: false,
      x: Number.isFinite(Number(spec.x)) ? Number(spec.x) : state.x,
      y: Number.isFinite(Number(spec.y)) ? Number(spec.y) : state.y
    };

    const fields = spec.fields || {};
    for (const fieldName of Object.keys(fields)) {
      block.fields[fieldName] = normalizeField(fieldName, fields[fieldName]);
    }

    state.created.push(block);

    const inputs = spec.inputs || {};
    for (const inputName of Object.keys(inputs)) {
      const value = inputs[inputName];
      if (value && typeof value === "object" && value.opcode) {
        const inputStack = buildBlockStack([value], id, false, state);
        block.inputs[inputName] = {
          name: inputName,
          block: inputStack.first,
          shadow: null
        };
      } else {
        block.inputs[inputName] = createLiteralInput(inputName, value, id, state);
      }
    }

    const branches = spec.branches || spec.substacks || {};
    for (const branchName of Object.keys(branches)) {
      const branchStack = buildBlockStack(branches[branchName], id, false, state);
      if (branchStack.first) {
        block.inputs[branchName] = {
          name: branchName,
          block: branchStack.first,
          shadow: null
        };
      }
    }

    if (previous) {
      previous.next = id;
    } else {
      first = id;
    }
    previous = block;
  }

  return {first, last: previous && previous.id};
};

const placeBlocksOnTarget = args => {
  if (!window.vm || !getRuntime()) {
    return {error: "Open the editor page before applying project edits."};
  }
  const target = findTargetByName(args.target || args.name || "Sprite1");
  if (!target || !target.blocks || typeof target.blocks.createBlock !== "function") {
    return {error: `Target not found or cannot receive blocks: ${args.target || args.name || "Sprite1"}`};
  }

  const state = {
    nextId: 1,
    created: [],
    x: Number.isFinite(Number(args.x)) ? Number(args.x) : 40,
    y: Number.isFinite(Number(args.y)) ? Number(args.y) : 40
  };
  const stack = buildBlockStack(args.blocks, null, true, state);
  if (!stack.first) return {error: "No blocks were provided."};

  for (const shadow of state.created.filter(block => block.shadow)) {
    target.blocks.createBlock(shadow);
  }
  for (const block of state.created.filter(candidate => !candidate.shadow)) {
    target.blocks.createBlock(block);
  }

  const runtime = getRuntime();
  const vm = window.vm;
  if (runtime && runtime.emitProjectChanged) runtime.emitProjectChanged();
  if (vm && typeof vm.setEditingTarget === "function") vm.setEditingTarget(target.id);
  if (vm && typeof vm.emitWorkspaceUpdate === "function") vm.emitWorkspaceUpdate();
  if (runtime && runtime.requestTargetsUpdate) runtime.requestTargetsUpdate();

  return {
    placed: state.created.filter(block => !block.shadow).length,
    target: getTargetName(target),
    isStage: Boolean(target.isStage),
    topBlockId: stack.first
  };
};

const applyAgentActions = text => {
  const match = text.match(/\{[\s\S]*"actions"[\s\S]*\}/);
  if (!match) return [];

  let parsed;
  try {
    parsed = JSON.parse(match[0]);
  } catch (e) {
    return [];
  }
  if (!Array.isArray(parsed.actions)) return [];

  const applied = [];
  for (const action of parsed.actions) {
    if (!action || action.type !== "set_actor_value") continue;
    const target = findTargetByName(action.target);
    if (!target) continue;
    const field = action.field;
    if (!["x", "y", "z", "direction", "visible"].includes(field)) continue;
    target[field] = field === "visible" ? Boolean(action.value) : Number(action.value);
    applied.push(`${action.target}.${field} = ${target[field]}`);
  }

  const runtime = getRuntime();
  if (runtime && runtime.requestTargetsUpdate) runtime.requestTargetsUpdate();
  return applied;
};

const parseAgentTool = text => {
  const match = text.match(/\{[\s\S]*"agent_tool"[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    return parsed.agent_tool || null;
  } catch (e) {
    return null;
  }
};

const executeAgentTool = tool => {
  if (!tool || !tool.name) return {error: "Missing tool name"};
  const args = tool.arguments || {};
  switch (tool.name) {
  case "list_blocks": {
    const category = args.category && String(args.category).toLowerCase();
    const blocks = collectBlockCatalog()
      .filter(block => !category || block.category.toLowerCase() === category)
      .slice(0, 260);
    return {blocks};
  }
  case "inspect_project":
    return buildAgentContext().project;
  case "inspect_target_scripts":
    return collectTargetScripts(args.target || args.name || "Sprite1");
  case "set_actor_value": {
    if (!getRuntime()) return {error: "Open the editor page before applying project edits."};
    const actionText = JSON.stringify({
      actions: [{
        type: "set_actor_value",
        target: args.target,
        field: args.field,
        value: args.value
      }]
    });
    return {applied: applyAgentActions(actionText)};
  }
  case "set_camera_value": {
    const runtime = getRuntime();
    if (!runtime) return {error: "Open the editor page before applying project edits."};
    const camera = runtime && (runtime.scene3DCamera || runtime.amethystCamera || runtime.camera3D);
    if (!camera) return {error: "Camera state is not exposed to AmethystAI yet. Use camera blocks in a draft_script instead."};
    if (!["x", "y", "z", "pitch", "yaw", "roll", "fov"].includes(args.field)) {
      return {error: `Camera field not allowed: ${args.field}`};
    }
    camera[args.field] = Number(args.value);
    return {applied: [`camera.${args.field} = ${camera[args.field]}`]};
  }
  case "place_blocks":
    try {
      return placeBlocksOnTarget(args);
    } catch (error) {
      return {error: error.message};
    }
  case "draft_script":
    return {
      draft: {
        target: args.target || "selected actor",
        blocks: Array.isArray(args.blocks) ? args.blocks : [],
        note: "Use place_blocks when the user wants real blocks added to the project."
      }
    };
  default:
    return {error: `Unknown tool: ${tool.name}`};
  }
};

const createElement = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
};

const addMessage = (chat, role, text) => {
  const messages = chat.querySelector("[data-messages]");
  const message = createElement("div", `amethyst-ai-message ${role}`);
  message.textContent = text;
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
};

const addApprovalMessage = (chat, tool) => {
  const messages = chat.querySelector("[data-messages]");
  const message = createElement("div", "amethyst-ai-message assistant amethyst-ai-approval");
  const pendingTool = tool;
  message.innerHTML = `
    <div class="amethyst-ai-approval-title">Approval required</div>
    <div class="amethyst-ai-approval-copy">AmethystAI wants to edit this project.</div>
    <pre></pre>
    <div class="amethyst-ai-approval-actions">
      <button type="button" data-approve-tool>Approve</button>
      <button type="button" data-cancel-tool>Cancel</button>
    </div>
  `;
  message.querySelector("pre").textContent = JSON.stringify(pendingTool, null, 2);
  message.querySelector("[data-approve-tool]").addEventListener("click", () => {
    const result = executeAgentTool(pendingTool);
    message.querySelector("[data-approve-tool]").disabled = true;
    message.querySelector("[data-cancel-tool]").disabled = true;
    addMessage(chat, "assistant", result.error ? `Edit failed: ${result.error}` : `Edit applied: ${JSON.stringify(result)}`);
    refreshContext(chat);
  });
  message.querySelector("[data-cancel-tool]").addEventListener("click", () => {
    message.querySelector("[data-approve-tool]").disabled = true;
    message.querySelector("[data-cancel-tool]").disabled = true;
    addMessage(chat, "assistant", "Edit canceled.");
  });
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
};

const providerToRequest = (settings, prompt) => {
  const context = buildAgentContext();
  const system = [
    "You are AmethystAI, an agent inside a Scratch-style 3D programming app for kids.",
    "Be concise and practical. Prefer simple blocks and safe project edits.",
    "You know the available blocks from blockCatalog. Use exact opcodes when drafting scripts or placing blocks.",
    "You can run tools by replying only with JSON: {\"agent_tool\":{\"name\":\"tool_name\",\"arguments\":{}}}.",
    `You may use up to ${MAX_AGENT_STEPS} tool calls. Use inspect/list tools before editing when unsure.`,
    "You can place actual blocks on a sprite or backdrop with place_blocks. Use it when the user asks you to code for them.",
    "For place_blocks, pass target, optional x/y, and blocks. Each block may have opcode, inputs, fields, and branches such as SUBSTACK.",
    "Use literal input values for simple numbers/text/booleans; the app will create the needed shadow blocks.",
    "Mutating tools require user approval. Send the tool request, then wait for the user to approve it in Amethyst.",
    "Allowed edit tools are intentionally narrow: actor values, exposed camera values, and adding new block stacks.",
    "Do not delete or rewrite existing scripts yet. When done, reply normally with what changed.",
    JSON.stringify(context, null, 2)
  ].join("\n\n");

  const provider = settings.provider;
  const endpoint = settings.baseUrl || DEFAULT_ENDPOINT;
  if (provider === "anthropic") {
    return {
      endpoint,
      headers: {
        "content-type": "application/json",
        "x-api-key": settings.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: {
        model: settings.model,
        max_tokens: 900,
        system,
        messages: [{role: "user", content: prompt}]
      },
      parse: data => data.content && data.content[0] && data.content[0].text
    };
  }

  if (provider === "gemini") {
    const base = endpoint.replace(/\/$/, "");
    return {
      endpoint: `${base}/models/${encodeURIComponent(settings.model)}:generateContent`,
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": settings.apiKey
      },
      body: {
        systemInstruction: {parts: [{text: system}]},
        contents: [{role: "user", parts: [{text: prompt}]}]
      },
      parse: data => data.candidates && data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.map(part => part.text || "").join("\n")
    };
  }

  return {
    endpoint,
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`
    },
    body: {
      model: settings.model,
      messages: [
        {role: "system", content: system},
        {role: "user", content: prompt}
      ],
      temperature: 0.2
    },
    parse: data => data.choices && data.choices[0] && data.choices[0].message &&
      data.choices[0].message.content
  };
};

const sendToProvider = async (settings, prompt) => {
  const {endpoint, headers, body, parse} = providerToRequest(settings, prompt);
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error && data.error.message ? data.error.message : `API request failed (${response.status})`);
  }
  return parse(data) || "The model returned an empty response.";
};

const runAgentLoop = async (settings, userPrompt, onStep) => {
  const toolTranscript = [];
  let finalReply = "";

  for (let step = 0; step < MAX_AGENT_STEPS; step++) {
    const loopPrompt = [
      userPrompt,
      "",
      "Tool transcript so far:",
      toolTranscript.length ? toolTranscript.join("\n") : "No tools used yet.",
      "",
      "Either call one agent_tool as JSON or give the final answer."
    ].join("\n");

    const reply = await sendToProvider(settings, loopPrompt);
    finalReply = reply;
    const tool = parseAgentTool(reply);
    if (!tool) break;
    if (MUTATING_TOOLS.has(tool.name)) {
      return {reply: "Approval required", pendingTool: tool};
    }

    const result = executeAgentTool(tool);
    const line = `Step ${step + 1} ${tool.name}: ${JSON.stringify(result).slice(0, 4000)}`;
    toolTranscript.push(line);
    if (onStep) onStep(line);
  }

  return {reply: finalReply};
};

const readSettingsFromForm = chat => ({
  provider: chat.querySelector("[data-provider]").value,
  baseUrl: chat.querySelector("[data-base-url]").value.trim(),
  model: chat.querySelector("[data-model]").value.trim(),
  apiKey: chat.querySelector("[data-api-key]").value.trim()
});

const fillSettingsForm = (chat, settings) => {
  chat.querySelector("[data-provider]").value = settings.provider;
  chat.querySelector("[data-base-url]").value = settings.baseUrl;
  chat.querySelector("[data-model]").value = settings.model;
  chat.querySelector("[data-api-key]").value = settings.apiKey;
};

const refreshContext = chat => {
  const context = chat.querySelector("[data-context]");
  const agentContext = buildAgentContext();
  context.textContent = JSON.stringify({
    project: agentContext.project,
    blockCatalogCount: agentContext.blockCatalog.length,
    tools: agentContext["Agent skills"].map(tool => tool.name)
  }, null, 2);
};

const createChat = () => {
  const existing = document.getElementById(CHAT_ID);
  if (existing) return existing;

  const settings = loadSettings();
  const chat = createElement("section", "amethyst-ai-chat");
  chat.id = CHAT_ID;
  chat.setAttribute("aria-label", "AmethystAI chat");
  chat.innerHTML = `
    <div class="amethyst-ai-chat-header">
      <div>
        <div class="amethyst-ai-title">AmethystAI</div>
        <div class="amethyst-ai-status">Mature loop agent</div>
      </div>
      <button class="amethyst-ai-icon-button" type="button" data-close title="Close">x</button>
    </div>
    <div class="amethyst-ai-settings">
      <select data-provider title="Provider">
        <option value="openai">OpenAI compatible</option>
        <option value="deepseek">DeepSeek</option>
        <option value="anthropic">Anthropic</option>
        <option value="gemini">Gemini / Google</option>
      </select>
      <input data-base-url type="text" placeholder="Base URL" title="Base URL">
      <input data-model type="text" placeholder="Model" title="Model">
      <input data-api-key type="password" placeholder="API key" title="API key">
      <button class="amethyst-ai-small-button" type="button" data-save>Save</button>
    </div>
    <div class="amethyst-ai-messages" data-messages></div>
    <details class="amethyst-ai-context">
      <summary>Context</summary>
      <pre data-context></pre>
    </details>
    <form class="amethyst-ai-compose" data-compose>
      <textarea data-prompt placeholder="Ask AmethystAI to inspect blocks, plan scripts, and make safe 3D edits..."></textarea>
      <button type="submit">Send</button>
    </form>
  `;

  document.body.appendChild(chat);
  fillSettingsForm(chat, settings);
  refreshContext(chat);
  addMessage(chat, "assistant", "Enter your provider settings, then ask me to inspect blocks, draft scripts, or make safe 3D edits.");

  chat.querySelector("[data-close]").addEventListener("click", () => chat.remove());
  chat.querySelector("[data-save]").addEventListener("click", () => {
    const nextSettings = readSettingsFromForm(chat);
    saveSettings(nextSettings);
    addMessage(chat, "assistant", `Saved ${PROVIDER_PRESETS[nextSettings.provider].name} settings locally in this browser.`);
  });
  chat.querySelector("[data-provider]").addEventListener("change", event => {
    const current = readSettingsFromForm(chat);
    const preset = PROVIDER_PRESETS[event.target.value];
    fillSettingsForm(chat, {
      ...current,
      provider: event.target.value,
      baseUrl: preset.baseUrl,
      model: preset.model
    });
  });
  chat.querySelector("[data-compose]").addEventListener("submit", async event => {
    event.preventDefault();
    const prompt = chat.querySelector("[data-prompt]");
    const text = prompt.value.trim();
    if (!text) return;

    const settingsNow = readSettingsFromForm(chat);
    if (!settingsNow.apiKey) {
      addMessage(chat, "assistant", "Add your API key first. It stays in this browser's local storage.");
      return;
    }

    saveSettings(settingsNow);
    prompt.value = "";
    refreshContext(chat);
    addMessage(chat, "user", text);
    addMessage(chat, "assistant", "Thinking...");
    const thinking = chat.querySelector("[data-messages]").lastChild;

    try {
      const result = await runAgentLoop(settingsNow, text, stepText => {
        thinking.textContent = `${thinking.textContent}\n${stepText}`;
      });
      thinking.textContent = result.reply;
      if (result.pendingTool) {
        addApprovalMessage(chat, result.pendingTool);
      }
      refreshContext(chat);
    } catch (error) {
      thinking.textContent = `API error: ${error.message}`;
    }
  });

  return chat;
};

const toggleChat = () => {
  const chat = document.getElementById(CHAT_ID);
  if (chat) {
    chat.remove();
  } else {
    createChat();
  }
};

const createButton = () => {
  if (document.getElementById(BUTTON_ID)) return;
  const button = createElement("button", "amethyst-ai-launcher", "AI");
  button.id = BUTTON_ID;
  button.type = "button";
  button.title = "AmethystAI";
  button.addEventListener("click", toggleChat);
  document.body.appendChild(button);
};

const removeAmethystAI = () => {
  const button = document.getElementById(BUTTON_ID);
  const chat = document.getElementById(CHAT_ID);
  if (button) button.remove();
  if (chat) chat.remove();
};

export default async function ({addon}) {
  const update = () => {
    if (addon.self.disabled) {
      removeAmethystAI();
    } else {
      createButton();
    }
  };

  addon.self.addEventListener("disabled", update);
  addon.self.addEventListener("reenabled", update);
  update();
}
