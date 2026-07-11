const AbstractWindow = require('./abstract');
const {PACKAGER_NAME} = require('../brand');
const PackagerPreviewWindow = require('./packager-preview');
const prompts = require('../prompts');
const FileAccessWindow = require('./file-access-window');

class PackagerWindow extends AbstractWindow {
  constructor (editorWindow) {
    super();

    /** @type {AbstractWindow} */
    this.editorWindow = editorWindow;

    this.window.setTitle(PACKAGER_NAME);
    this.window.on('page-title-updated', (event) => {
      event.preventDefault();
    });

    this.ipc.on('import-project-with-port', (event) => {
      const port = event.ports[0];
      if (this.editorWindow.window.isDestroyed()) {
        port.postMessage({
          error: true
        });
        return;
      }
      this.editorWindow.window.webContents.postMessage('export-project-to-port', null, [port]);
    });

    this.ipc.on('alert', (event, message) => {
      event.returnValue = prompts.alert(this.window, message);
    });

    this.ipc.on('confirm', (event, message) => {
      event.returnValue = prompts.confirm(this.window, message);
    });

    this.ipc.handle('check-drag-and-drop-path', (event, path) => {
      FileAccessWindow.check(path);
    });

    this.window.webContents.on('did-finish-load', () => {
      // We can't do this from the preload script
      this.window.webContents.executeJavaScript(`
        window.alert = (message) => PromptsPreload.alert(message);
        window.confirm = (message) => PromptsPreload.confirm(message);
        document.title = 'Amethyst Packager';

        const noticeId = 'amethyst-packager-warning';
        const disabledTargets = /\\b(windows|macos|mac|linux|electron|nw\\.js|appimage|deb|dmg|exe|installer)\\b/i;

        const injectAmethystPackagerNotice = () => {
          if (!document.getElementById(noticeId)) {
            const style = document.createElement('style');
            style.textContent = \`
              #\${noticeId} {
                position: sticky;
                top: 0;
                z-index: 2147483647;
                padding: 10px 14px;
                border-bottom: 2px solid #16141a;
                background: #8169ff;
                color: #fff;
                font: 700 13px/1.35 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
              }

              .amethyst-packager-disabled-target {
                opacity: 0.45 !important;
                cursor: not-allowed !important;
              }
            \`;
            document.head.appendChild(style);

            const notice = document.createElement('div');
            notice.id = noticeId;
            notice.textContent = 'Amethyst export is experimental. Single-file HTML is the only intended test target right now; native executable packaging still uses the old TurboWarp/Scratch packager path and is disabled until the Amethyst 3D runtime exporter is rebuilt.';
            document.body.prepend(notice);
          }
        };

        const replaceVisibleBranding = () => {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          const nodes = [];
          while (walker.nextNode()) {
            nodes.push(walker.currentNode);
          }
          for (const node of nodes) {
            node.nodeValue = node.nodeValue
              .replace(/TurboWarp Packager/g, 'Amethyst Packager')
              .replace(/TurboWarp/g, 'Amethyst');
          }
        };

        const disableNativeTargets = () => {
          for (const option of document.querySelectorAll('option')) {
            if (disabledTargets.test(option.textContent || '') && !/html|zip/i.test(option.textContent || '')) {
              option.disabled = true;
              option.textContent = option.textContent.includes('disabled')
                ? option.textContent
                : \`\${option.textContent} (disabled for Amethyst 3D)\`;
            }
          }

          for (const label of document.querySelectorAll('label, button, [role="button"]')) {
            const text = label.textContent || '';
            if (disabledTargets.test(text) && !/html|zip/i.test(text)) {
              label.classList.add('amethyst-packager-disabled-target');
              label.title = 'Disabled until the Amethyst 3D runtime exporter replaces the old TurboWarp/Scratch packaging path.';
              const input = label.querySelector('input');
              if (input) {
                input.disabled = true;
              }
            }
          }
        };

        const patchPackagerUi = () => {
          injectAmethystPackagerNotice();
          replaceVisibleBranding();
          disableNativeTargets();
        };

        patchPackagerUi();
        new MutationObserver(patchPackagerUi).observe(document.documentElement, {
          childList: true,
          subtree: true
        });

        // Electron will try to clone the last value returned here, so make sure it doesn't try to clone a function
        void 0;
      `);
    });

    this.window.webContents.on('did-create-window', (newWindow) => {
      const childWindow = new PackagerPreviewWindow(this.window, newWindow);
      childWindow.protocol = this.protocol;
    });

    this.loadURL('tw-packager://./standalone.html');
    this.show();
  }

  getPreload () {
    return 'packager';
  }

  getDimensions () {
    return {
      width: 700,
      height: 700
    };
  }

  isPopup () {
    return true;
  }

  getBackgroundColor () {
    return '#111111';
  }

  handleWindowOpen (details) {
    if (details.url === 'about:blank') {
      return {
        action: 'allow',
        outlivesOpener: true,
        overrideBrowserWindowOptions: PackagerPreviewWindow.getBrowserWindowOverrides()
      };
    }
    return super.handleWindowOpen(details);
  }

  onBeforeRequest (details, callback) {
    const parsed = new URL(details.url);
    if (parsed.origin === 'https://extensions.turbowarp.org') {
      return callback({
        redirectURL: `tw-extensions://./${parsed.pathname}`
      });
    }

    return super.onBeforeRequest(details, callback);
  }

  static forEditor (editorWindow) {
    new PackagerWindow(editorWindow);
  }
}

module.exports = PackagerWindow;
