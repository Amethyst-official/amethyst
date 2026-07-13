import './import-first';

import React from 'react';
import {compose} from 'redux';
import AppStateHOC from '../lib/app-state-hoc.jsx';
import TWEmbedFullScreenHOC from '../lib/tw-embed-fullscreen-hoc.jsx';
import TWStateManagerHOC from '../lib/tw-state-manager-hoc.jsx';
import runAddons from '../addons/entry';
import {Theme} from '../lib/themes/index.js';

import GUI from './render-gui.jsx';
import TWWindchimeSubmitter from '../containers/tw-windchime-submitter.jsx';
import render from './app-target';

const getProjectId = () => {
    // For compatibility reasons, we first look at the hash.
    // eg. https://turbowarp.org/embed.html#1
    const hashMatch = location.hash.match(/#(\d+)/);
    if (hashMatch !== null) {
        return hashMatch[1];
    }
    // Otherwise, we'll recreate what "wildcard" routing does.
    // eg. https://turbowarp.org/1/embed
    const pathMatch = location.pathname.match(/(\d+)\/embed/);
    if (pathMatch !== null) {
        return pathMatch[pathMatch.length - 1];
    }
    return '0';
};

const projectId = getProjectId();
const urlParams = new URLSearchParams(location.search);
const isAmethystExport = urlParams.has('amethyst_export');

let vm;

const postToParent = message => {
    if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, '*');
    }
};

const loadExportedProject = data => {
    if (!vm || !data || data.type !== 'amethyst-export-project') {
        return;
    }

    const projectData = data.projectData;
    if (!(projectData instanceof ArrayBuffer)) {
        postToParent({
            type: 'amethyst-export-project-error',
            message: 'Export did not include valid project data.'
        });
        return;
    }

    vm.quit();
    vm.clear();
    vm.loadProject(projectData)
        .then(() => {
            if (data.title) {
                document.title = data.title;
            }
            vm.start();
            if (data.autoplay || urlParams.has('autoplay')) {
                vm.greenFlag();
            }
            postToParent({
                type: 'amethyst-export-project-loaded'
            });
        })
        .catch(error => {
            postToParent({
                type: 'amethyst-export-project-error',
                message: error && error.message ? error.message : `${error}`
            });
        });
};

const onVmInit = _vm => {
    vm = _vm;
    if (isAmethystExport) {
        window.addEventListener('message', event => {
            loadExportedProject(event.data);
        });
        postToParent({
            type: 'amethyst-export-player-ready'
        });
    }
};

const onProjectLoaded = () => {
    if (urlParams.has('autoplay') && !isAmethystExport) {
        vm.start();
        vm.greenFlag();
    }
};

const Embed = props => (
    <React.Fragment>
        <GUI {...props} />
        <TWWindchimeSubmitter />
    </React.Fragment>
);

const WrappedGUI = compose(
    AppStateHOC,
    TWStateManagerHOC,
    TWEmbedFullScreenHOC
)(Embed);

render(<WrappedGUI
    isEmbedded
    projectId={projectId}
    onVmInit={onVmInit}
    onProjectLoaded={onProjectLoaded}
    routingStyle="none"
    theme={Theme.light}
/>);

if (urlParams.has('addons')) {
    runAddons();
}
