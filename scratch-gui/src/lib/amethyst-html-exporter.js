const DEFAULT_TITLE = 'Amethyst Game';
const DEFAULT_RUNTIME_URL = 'https://amethyst3d.pages.dev/embed.html';

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
    runtimeUrl = DEFAULT_RUNTIME_URL,
    fallbackRuntimeUrl = runtimeUrl === DEFAULT_RUNTIME_URL ? null : DEFAULT_RUNTIME_URL
}) => {
    const cleanTitle = normalizeTitle(title);
    const projectBuffer = await projectDataToArrayBuffer(projectData);
    const projectBase64 = arrayBufferToBase64(projectBuffer);
    const payload = JSON.stringify({
        app: 'Amethyst',
        format: 'amx',
        title: cleanTitle,
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
    max-width: 520px;
}
.title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
}
.detail {
    opacity: 0.8;
    line-height: 1.5;
}
</style>
</head>
<body>
<iframe id="player" title="${escapeHTML(cleanTitle)}"></iframe>
<div id="status">
    <div class="panel">
        <div class="title">Loading ${escapeHTML(cleanTitle)}</div>
        <div class="detail">Starting the Amethyst 3D player...</div>
    </div>
</div>
<script>
(function () {
    'use strict';

    var exportData = ${payload};
    var iframe = document.getElementById('player');
    var status = document.getElementById('status');
    var playerOrigin = '*';
    var posted = false;
    var runtimeIndex = 0;
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

    var loadRuntime = function () {
        posted = false;
        setPlayerOrigin();
        iframe.src = runtimeUrls[runtimeIndex] + (runtimeUrls[runtimeIndex].indexOf('?') === -1 ? '?' : '&') +
            'amethyst_export=1&autoplay=1';
    };

    var tryFallbackRuntime = function () {
        if (posted || runtimeIndex >= runtimeUrls.length - 1) return;
        runtimeIndex++;
        status.querySelector('.detail').textContent = 'Trying the online Amethyst player...';
        loadRuntime();
    };

    window.addEventListener('message', function (event) {
        var data = event.data || {};
        if (data.type === 'amethyst-export-player-ready') {
            postProject();
        } else if (data.type === 'amethyst-export-project-loaded') {
            status.hidden = true;
        } else if (data.type === 'amethyst-export-project-error') {
            status.hidden = false;
            status.querySelector('.title').textContent = 'Could not load project';
            status.querySelector('.detail').textContent = data.message || 'The Amethyst player reported an export loading error.';
        }
    });

    iframe.addEventListener('load', function () {
        setTimeout(function () {
            if (!posted) postProject();
        }, 500);
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
    buildAmethystExportHTML,
    getHTMLExportFilename
};
