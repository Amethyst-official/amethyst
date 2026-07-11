/**
 * @fileoverview
 * Utility function to detect locale from the browser setting or paramenter on the URL.
 */

// tw: read language from localStorage
export const LANGUAGE_KEY = 'tw:language';

/**
 * Amethyst temporarily supports English only while 3D block translations catch up.
 * @return {string} the active locale
 */
const detectLocale = () => 'en';

export {
    detectLocale
};
