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

const arrayBufferToBase64 = buffer => {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
};

const blobToArrayBuffer = blob => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
});

const projectDataToArrayBuffer = async projectData => {
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

const buildAmethystExportHTML = async ({
    projectData,
    title,
    amethystVersion = 'unknown',
    runtimeUrl = DEFAULT_RUNTIME_URL,
    fallbackRuntimeUrl = runtimeUrl === DEFAULT_RUNTIME_URL ? null : DEFAULT_RUNTIME_URL
}) => {
    const cleanTitle = normalizeTitle(title);
    const projectBuffer = await projectDataToArrayBuffer(projectData);
    const projectBytes = projectBuffer.byteLength;
    const projectBase64 = arrayBufferToBase64(projectBuffer);
    const payload = JSON.stringify({
        app: 'Amethyst',
        format: 'amx',
        exportFormatVersion: EXPORT_FORMAT_VERSION,
        exportedAt: new Date().toISOString(),
        amethystVersion,
        title: cleanTitle,
        projectBytes,
        runtimeUrl,
        fallbackRuntimeUrl,
        projectBase64
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
        <div class="detail">This file contains your project and loads the Amethyst web player.</div>
        <div class="meta">Project size: ${escapeHTML(formatBytes(projectBytes))}. Exported: ${escapeHTML(new Date().toLocaleString())}.</div>
        <div class="actions" id="actions">
            <button id="retry" type="button">Retry</button>
            <a class="button secondary" href="${escapeHTML(runtimeUrl)}" target="_blank" rel="noopener noreferrer">Open player</a>
        </div>
    </div>
</div>
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

    var base64ToArrayBuffer = function (base64) {
        var binary = atob(base64);
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    };

    var postProject = function () {
        if (!iframe.contentWindow) return;
        var buffer = base64ToArrayBuffer(exportData.projectBase64);
        iframe.contentWindow.postMessage({
            type: 'amethyst-export-project',
            title: exportData.title,
            projectData: buffer,
            autoplay: true
        }, playerOrigin, [buffer]);
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
        setStatus('Loading ' + exportData.title, 'This file contains your project and loads the Amethyst web player.', false);
        setPlayerOrigin();
        iframe.src = runtimeUrls[runtimeIndex] + (runtimeUrls[runtimeIndex].indexOf('?') === -1 ? '?' : '&') +
            'amethyst_export=1&autoplay=1';
        timeoutId = setTimeout(function () {
            if (loaded) return;
            setStatus(
                'Player did not respond',
                'Check your internet connection, then retry. This first Amethyst desktop export format uses the online Amethyst player.',
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
                data.message || 'The Amethyst player reported an export loading error. Export again from a newer Amethyst Desktop build.',
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
