const amethystOwnedTranslations = {
    'tw.cantUseCloud': (
        'Cloud variables will not work globally unless this project is exported with a compatible Amethyst packager ' +
        'or hosted by a compatible service.'
    ),
    'tw.desktopCloud': (
        'In the desktop app, cloud variables sync between all Amethyst desktop windows on this computer.'
    ),
    'tw.gui.crashMessage.description': 'Sorry, Amethyst crashed. Refresh the page to try again.',
    'tw.menuBar.package': 'Export single-file HTML',
    'tw.settingsModal.storeProjectOptionsHelp': (
        'Stores the selected settings in the project so they will be automatically applied when Amethyst loads this ' +
        'project. Warp timer and disable compiler will not be saved.'
    )
};

const addAdditionalTranslations = editorMessages => {
    if (editorMessages.en) {
        Object.assign(editorMessages.en, amethystOwnedTranslations);
    }
};

export default addAdditionalTranslations;
