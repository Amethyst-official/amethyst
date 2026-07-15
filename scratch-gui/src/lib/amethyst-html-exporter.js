const DEFAULT_TITLE = 'Amethyst Game';
const DEFAULT_RUNTIME_URL = 'https://amethyst3d.pages.dev/embed.html';
const EXPORT_FORMAT_VERSION = 1;

const escapeHTML = value => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizeTitle = title => {
    const withoutExtension = String(title || '')
        .replace(/\.(?:amx|html)$/i, '')
        .trim();
    return withoutExtension || DEFAULT_TITLE;
};

const getHTMLExportFilename = projectFilename => `${normalizeTitle(projectFilename).substring(0, 100)}.html`;

const formatBytes = bytes => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const blobToArrayBuffer = blob => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
});

const projectDataToArrayBuffer = projectData => {
    if (projectData instanceof Blob) {
        return blobToArrayBuffer(projectData);
    }
    if (projectData instanceof ArrayBuffer) {
        return projectData;
    }
    if (ArrayBuffer.isView(projectData)) {
        return projectData.buffer.slice(
            projectData.byteOffset,
            projectData.byteOffset + projectData.byteLength
        );
    }
    throw new Error('Unsupported Amethyst export data');
};

const getBase85EncodeCharacter = n => {
    n += 0x2a;
    if (n === 0x3c) return 0x28;
    if (n === 0x3e) return 0x29;
    return n;
};

const encodeBase85 = bytes => {
    const originalLength = bytes.length;
    let dataView;

    if (originalLength % 4 === 0) {
        dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    } else {
        const padded = new Uint8Array(Math.ceil(originalLength / 4) * 4);
        padded.set(bytes);
        dataView = new DataView(padded.buffer);
    }

    const encoded = new Uint8Array(Math.ceil(originalLength / 4) * 5);
    let encodedIndex = 0;

    for (let i = 0; i < dataView.byteLength; i += 4) {
        let n = dataView.getUint32(i, true);
        encoded[encodedIndex++] = getBase85EncodeCharacter(n % 85);
        n = Math.floor(n / 85);
        encoded[encodedIndex++] = getBase85EncodeCharacter(n % 85);
        n = Math.floor(n / 85);
        encoded[encodedIndex++] = getBase85EncodeCharacter(n % 85);
        n = Math.floor(n / 85);
        encoded[encodedIndex++] = getBase85EncodeCharacter(n % 85);
        n = Math.floor(n / 85);
        encoded[encodedIndex++] = getBase85EncodeCharacter(n % 85);
    }

    return new TextDecoder().decode(encoded);
};

const buildProjectChunkScripts = projectBytes => {
    const chunkSize = 1024 * 64;
    const chunks = [];
    for (let i = 0; i < projectBytes.length; i += chunkSize) {
        const chunk = projectBytes.subarray(i, i + chunkSize);
        chunks.push(
            `<script data-amethyst-project="${encodeBase85(chunk)}">` +
            `decodeProjectChunk(${chunk.length})</script>`
        );
    }
    return chunks.join('\n');
};

const buildAmethystExportHTML = async ({
    projectData,
    title,
    amethystVersion = 'unknown',
    offlineRuntime = null,
    runtimeUrl = DEFAULT_RUNTIME_URL,
    fallbackRuntimeUrl = runtimeUrl === DEFAULT_RUNTIME_URL ? null : DEFAULT_RUNTIME_URL
}) => {
    const cleanTitle = normalizeTitle(title);
    const projectBuffer = await projectDataToArrayBuffer(projectData);
    const projectBytes = projectBuffer.byteLength;
    const projectBytesView = new Uint8Array(projectBuffer);
    const projectPaddedBytes = Math.ceil(projectBytes / 4) * 4;
    const projectChunkCount = Math.ceil(projectBytes / (1024 * 64));
    const projectChunkScripts = buildProjectChunkScripts(projectBytesView);
    const payload = JSON.stringify({
        app: 'Amethyst',
        format: 'amx',
        exportFormatVersion: EXPORT_FORMAT_VERSION,
        exportedAt: new Date().toISOString(),
        amethystVersion,
        title: cleanTitle,
        projectEncoding: 'base85-chunks',
        projectBytes,
        projectPaddedBytes,
        projectChunkCount,
        offlineRuntimeHtml: offlineRuntime && offlineRuntime.html ? offlineRuntime.html : null,
        offlineRuntimeBytes: offlineRuntime && offlineRuntime.bytes ? offlineRuntime.bytes : 0,
        offlineRuntimeFileCount: offlineRuntime && offlineRuntime.fileCount ? offlineRuntime.fileCount : 0,
        runtimeUrl,
        fallbackRuntimeUrl
    })
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="google" value="notranslate">
<title>${escapeHTML(cleanTitle)}</title>
<style>
html,
body {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #11131a;
    color: #ffffff;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}
#player {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
    background: #11131a;
}
#status {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 24px;
    background: #11131a;
    color: #ffffff;
    z-index: 2;
}
#status[hidden] {
    display: none;
}
.panel {
    width: min(560px, calc(100vw - 48px));
    padding: 28px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 16px;
    background: rgba(22, 24, 34, 0.92);
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
}
.brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
    color: #cfc8ff;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
.brand-mark {
    width: 14px;
    height: 14px;
    border-radius: 4px;
    background: #8169ff;
}
.title {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 8px;
}
.detail {
    opacity: 0.8;
    line-height: 1.5;
}
.meta {
    margin-top: 14px;
    color: rgba(255, 255, 255, 0.58);
    font-size: 13px;
    line-height: 1.4;
}
.actions {
    display: none;
    gap: 10px;
    justify-content: center;
    margin-top: 18px;
    flex-wrap: wrap;
}
.actions.visible {
    display: flex;
}
button,
a.button {
    border: 0;
    border-radius: 999px;
    padding: 10px 16px;
    background: #8169ff;
    color: #ffffff;
    font: inherit;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
}
button.secondary,
a.button.secondary {
    background: rgba(255, 255, 255, 0.14);
}
</style>
</head>
<body>
<iframe id="player" title="${escapeHTML(cleanTitle)}"></iframe>
<div id="status">
    <div class="panel">
        <div class="brand"><span class="brand-mark"></span><span>Amethyst HTML Export</span></div>
        <div class="title">Loading ${escapeHTML(cleanTitle)}</div>
        <div class="detail">${
    offlineRuntime ?
        'This file contains your project and the Amethyst player runtime. It works offline.' :
        'This file contains your project and loads the Amethyst web player.'
}</div>
        <div class="meta">Project size: ${escapeHTML(formatBytes(projectBytes))}.${
    offlineRuntime ? ` Runtime size: ${escapeHTML(formatBytes(offlineRuntime.bytes || 0))}.` : ''
} Exported: ${escapeHTML(new Date().toLocaleString())}.</div>
        <div class="actions" id="actions">
            <button id="retry" type="button">Retry</button>
            ${
    offlineRuntime ?
        '' :
        `<a class="button secondary" href="${escapeHTML(runtimeUrl)}" ` +
        'target="_blank" rel="noopener noreferrer">Open player</a>'
}
        </div>
    </div>
</div>
<script>
var amethystProjectDecodeBuffer = new ArrayBuffer(${projectPaddedBytes});
var amethystProjectBuffer = null;
var amethystProjectDecodeIndex = 0;
var getBase85DecodeValue = function (code) {
    if (code === 0x28) code = 0x3c;
    if (code === 0x29) code = 0x3e;
    return code - 0x2a;
};
var base85Decode = function (str, outBuffer, outOffset) {
    var view = new DataView(outBuffer, outOffset, Math.floor(str.length / 5 * 4));
    for (var i = 0, j = 0; i < str.length; i += 5, j += 4) {
        view.setUint32(j, (
            getBase85DecodeValue(str.charCodeAt(i + 4)) * 85 * 85 * 85 * 85 +
            getBase85DecodeValue(str.charCodeAt(i + 3)) * 85 * 85 * 85 +
            getBase85DecodeValue(str.charCodeAt(i + 2)) * 85 * 85 +
            getBase85DecodeValue(str.charCodeAt(i + 1)) * 85 +
            getBase85DecodeValue(str.charCodeAt(i))
        ), true);
    }
};
var decodeProjectChunk = function (size) {
    base85Decode(
        document.currentScript.getAttribute('data-amethyst-project'),
        amethystProjectDecodeBuffer,
        amethystProjectDecodeIndex
    );
    document.currentScript.remove();
    amethystProjectDecodeIndex += size;
};
</script>
${projectChunkScripts}
<script>
(function () {
    'use strict';

    var exportData = ${payload};
    var iframe = document.getElementById('player');
    var status = document.getElementById('status');
    var actions = document.getElementById('actions');
    var retry = document.getElementById('retry');
    var playerOrigin = '*';
    var posted = false;
    var loaded = false;
    var runtimeIndex = 0;
    var timeoutId = null;
    var isOfflineRuntime = !!exportData.offlineRuntimeHtml;
    var runtimeUrls = [exportData.runtimeUrl];
    if (exportData.fallbackRuntimeUrl && exportData.fallbackRuntimeUrl !== exportData.runtimeUrl) {
        runtimeUrls.push(exportData.fallbackRuntimeUrl);
    }

    var setPlayerOrigin = function () {
        try {
            playerOrigin = new URL(runtimeUrls[runtimeIndex], location.href).origin;
        } catch (e) {
            playerOrigin = '*';
        }
    };

    var getProjectBuffer = function () {
        if (amethystProjectBuffer) {
            return amethystProjectBuffer;
        }
        if (amethystProjectDecodeIndex !== exportData.projectBytes) {
            throw new Error('Project payload is incomplete.');
        }
        amethystProjectBuffer = amethystProjectDecodeBuffer.slice(0, exportData.projectBytes);
        amethystProjectDecodeBuffer = null;
        return amethystProjectBuffer;
    };

    var postProject = function () {
        if (!iframe.contentWindow) return;
        var buffer = getProjectBuffer();
        iframe.contentWindow.postMessage({
            type: 'amethyst-export-project',
            title: exportData.title,
            projectData: buffer,
            autoplay: true
        }, playerOrigin);
        posted = true;
    };

    var setStatus = function (title, detail, showActions) {
        status.hidden = false;
        status.querySelector('.title').textContent = title;
        status.querySelector('.detail').textContent = detail;
        actions.className = showActions ? 'actions visible' : 'actions';
    };

    var loadRuntime = function () {
        posted = false;
        loaded = false;
        if (timeoutId) clearTimeout(timeoutId);
        setStatus(
            'Loading ' + exportData.title,
            isOfflineRuntime ?
                'This file contains your project and the Amethyst player runtime. It works offline.' :
                'This file contains your project and loads the Amethyst web player.',
            false
        );
        if (isOfflineRuntime) {
            iframe.removeAttribute('src');
            iframe.srcdoc = exportData.offlineRuntimeHtml;
            timeoutId = setTimeout(function () {
                if (loaded) return;
                setStatus(
                    'Player did not respond',
                    'The bundled Amethyst player did not start. Export again from a newer Amethyst Desktop build.',
                    true
                );
            }, 12000);
            return;
        }
        setPlayerOrigin();
        iframe.src = runtimeUrls[runtimeIndex] + (runtimeUrls[runtimeIndex].indexOf('?') === -1 ? '?' : '&') +
            'amethyst_export=1&autoplay=1';
        timeoutId = setTimeout(function () {
            if (loaded) return;
            setStatus(
                'Player did not respond',
                'Check your internet connection, then retry. ' +
                    'This first Amethyst desktop export format uses the online Amethyst player.',
                true
            );
        }, 12000);
    };

    var tryFallbackRuntime = function () {
        if (posted || runtimeIndex >= runtimeUrls.length - 1) return;
        runtimeIndex++;
        setStatus('Trying backup player', 'Trying the online Amethyst player...', false);
        loadRuntime();
    };

    window.addEventListener('message', function (event) {
        var data = event.data || {};
        if (data.type === 'amethyst-export-player-ready') {
            postProject();
        } else if (data.type === 'amethyst-export-project-loaded') {
            loaded = true;
            if (timeoutId) clearTimeout(timeoutId);
            status.hidden = true;
        } else if (data.type === 'amethyst-export-project-error') {
            setStatus(
                'Could not load project',
                data.message || (
                    'The Amethyst player reported an export loading error. ' +
                    'Export again from a newer Amethyst Desktop build.'
                ),
                true
            );
        }
    });

    iframe.addEventListener('load', function () {
        setTimeout(function () {
            if (!posted) postProject();
        }, 500);
    });

    retry.addEventListener('click', function () {
        loadRuntime();
    });

    loadRuntime();
    setTimeout(tryFallbackRuntime, 4000);
}());
</script>
</body>
</html>
`;
};

export {
    DEFAULT_RUNTIME_URL,
    EXPORT_FORMAT_VERSION,
    buildAmethystExportHTML,
    getHTMLExportFilename
};
