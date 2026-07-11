import {addLocaleData} from 'react-intl';

import {localeData} from '@turbowarp/scratch-l10n';
import editorMessages from '@turbowarp/scratch-l10n/locales/editor-msgs';
import addAdditionalTranslations from '../lib/tw-translations/index.js';

import {LANGUAGE_KEY} from '../lib/detect-locale.js';

const supportedEditorMessages = {
    en: Object.assign({}, editorMessages.en)
};

addAdditionalTranslations(supportedEditorMessages);
addLocaleData(localeData);

const UPDATE_LOCALES = 'scratch-gui/locales/UPDATE_LOCALES';
const SELECT_LOCALE = 'scratch-gui/locales/SELECT_LOCALE';

const initialState = {
    isRtl: false,
    locale: 'en',
    messagesByLocale: supportedEditorMessages,
    messages: supportedEditorMessages.en
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SELECT_LOCALE:
        return Object.assign({}, state, {
            isRtl: false,
            locale: 'en',
            messagesByLocale: state.messagesByLocale,
            messages: state.messagesByLocale.en
        });
    case UPDATE_LOCALES:
        return Object.assign({}, state, {
            isRtl: false,
            locale: 'en',
            messagesByLocale: {
                en: action.messagesByLocale.en || supportedEditorMessages.en
            },
            messages: action.messagesByLocale.en || supportedEditorMessages.en
        });
    default:
        return state;
    }
};

const selectLocale = function () {
    // tw: store language in localStorage
    try {
        localStorage.setItem(LANGUAGE_KEY, 'en');
    } catch (e) { /* ignore */ }
    return {
        type: SELECT_LOCALE,
        locale: 'en'
    };
};

const setLocales = function (localesMessages) {
    return {
        type: UPDATE_LOCALES,
        messagesByLocale: localesMessages
    };
};
const initLocale = function (currentState) {
    return Object.assign({}, currentState, {
        isRtl: false,
        locale: 'en',
        messagesByLocale: supportedEditorMessages,
        messages: supportedEditorMessages.en
    });
};
export {
    reducer as default,
    initialState as localesInitialState,
    initLocale,
    selectLocale,
    setLocales
};
