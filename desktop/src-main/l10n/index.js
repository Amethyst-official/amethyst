const englishTranslationsWithContext = require('./en.json');
const settings = require('../settings');

const englishTranslations = {};
for (const [id, message] of Object.entries(englishTranslationsWithContext)) {
  englishTranslations[id] = message.string;
}

let currentLocale;
let currentStrings;

const loadTranslations = () => Object.assign({}, englishTranslations);

const updateLocale = () => {
  currentLocale = 'en';
  currentStrings = loadTranslations();
};

const translate = (id) => currentStrings[id] || id;

const tranlateOrNull = (id) => currentStrings[id] || null;

const getLocale = () => currentLocale;

const getStrings = () => currentStrings;

updateLocale(settings.locale);

module.exports = {
  updateLocale,
  translate,
  tranlateOrNull,
  getLocale,
  getStrings
};
