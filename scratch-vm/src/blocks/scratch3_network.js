const Cast = require('../util/cast');

const defaultNetworkState = () => ({
    confirmed: false,
    responseText: '',
    responseStatus: 0,
    responseOk: false,
    responseUrl: '',
    error: ''
});

const parseJson = text => {
    try {
        return JSON.parse(Cast.toString(text));
    } catch (e) {
        return null;
    }
};

const coerceJsonValue = value => {
    const text = Cast.toString(value);
    if (text === 'true') return true;
    if (text === 'false') return false;
    if (text === 'null') return null;
    if (text.trim() !== '' && Number.isFinite(Number(text))) return Number(text);
    const parsed = parseJson(text);
    return parsed === null ? text : parsed;
};

const pathParts = path => Cast.toString(path)
    .split('.')
    .map(part => part.trim())
    .filter(Boolean);

const isPrivateIPv4 = hostname => {
    const parts = hostname.split('.');
    if (parts.length !== 4) return false;
    const nums = parts.map(part => Number(part));
    if (nums.some(num => !Number.isInteger(num) || num < 0 || num > 255)) return false;
    return (
        nums[0] === 10 ||
        nums[0] === 127 ||
        (nums[0] === 172 && nums[1] >= 16 && nums[1] <= 31) ||
        (nums[0] === 192 && nums[1] === 168) ||
        (nums[0] === 169 && nums[1] === 254) ||
        (nums[0] === 0)
    );
};

const validateBrowserSafeURL = rawURL => {
    let parsed;
    try {
        parsed = new URL(Cast.toString(rawURL));
    } catch (e) {
        return 'Network URL must be a full http or https address.';
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return 'Network URL must use http or https.';
    }

    const hostname = parsed.hostname.toLowerCase();
    if (
        hostname === 'localhost' ||
        hostname.endsWith('.localhost') ||
        hostname === '::1' ||
        isPrivateIPv4(hostname)
    ) {
        return 'Network URL cannot point to local or private addresses in browser-safe mode.';
    }

    return '';
};

class Scratch3NetworkBlocks {
    constructor (runtime) {
        this.runtime = runtime;
        this._fetch = typeof fetch === 'function' ? fetch.bind(globalThis) : null;
        this._ensureNetworkState();
    }

    getPrimitives () {
        return {
            network_confirmsafety: this.confirmSafety,
            network_isconfirmed: this.isConfirmed,
            network_sendrequest: this.sendRequest,
            network_sendapirequest: this.sendAPIRequest,
            network_responsetext: this.responseText,
            network_responsestatus: this.responseStatus,
            network_responseok: this.responseOk,
            network_jsonget: this.jsonGet,
            network_jsonset: this.jsonSet,
            network_jsonvalid: this.jsonIsValid,
            network_jsonstringify: this.jsonStringify
        };
    }

    getMonitored () {
        return {
            network_responsetext: {
                getId: () => 'network_responsetext'
            },
            network_responsestatus: {
                getId: () => 'network_responsestatus'
            },
            network_responseok: {
                getId: () => 'network_responseok'
            }
        };
    }

    _ensureNetworkState () {
        if (!this.runtime.amethystNetwork) {
            this.runtime.amethystNetwork = defaultNetworkState();
        }
        return this.runtime.amethystNetwork;
    }

    _setResponse (patch) {
        Object.assign(this._ensureNetworkState(), patch);
        if (this.runtime.requestRedraw) this.runtime.requestRedraw();
    }

    confirmSafety () {
        this._ensureNetworkState().confirmed = true;
    }

    isConfirmed () {
        return this._ensureNetworkState().confirmed;
    }

    async sendRequest (args) {
        return this._send(args, null);
    }

    async sendAPIRequest (args) {
        return this._send(args, Cast.toString(args.BODY));
    }

    async _send (args, body) {
        const state = this._ensureNetworkState();
        if (!state.confirmed) {
            this._setResponse({
                responseText: 'Network blocks are locked. Use the safety confirmation block first.',
                responseStatus: 0,
                responseOk: false,
                error: 'not confirmed'
            });
            return;
        }
        if (!this._fetch) {
            this._setResponse({
                responseText: 'Network requests are not available here.',
                responseStatus: 0,
                responseOk: false,
                error: 'fetch unavailable'
            });
            return;
        }

        const method = Cast.toString(args.METHOD || 'GET').toUpperCase();
        const url = Cast.toString(args.URL);
        const urlError = validateBrowserSafeURL(url);
        if (urlError) {
            this._setResponse({
                responseText: urlError,
                responseStatus: 0,
                responseOk: false,
                responseUrl: url,
                error: 'unsafe url'
            });
            return;
        }
        const options = {
            method,
            headers: body === null ? {} : {'Content-Type': 'application/json'},
            mode: 'cors',
            credentials: 'omit'
        };
        if (body !== null && method !== 'GET' && method !== 'HEAD') {
            options.body = body;
        }

        try {
            const response = await this._fetch(url, options);
            const text = await response.text();
            this._setResponse({
                responseText: text,
                responseStatus: response.status,
                responseOk: Boolean(response.ok),
                responseUrl: url,
                error: ''
            });
        } catch (error) {
            this._setResponse({
                responseText: error && error.message ? error.message : 'Network request failed.',
                responseStatus: 0,
                responseOk: false,
                responseUrl: url,
                error: 'request failed'
            });
        }
    }

    responseText () {
        return this._ensureNetworkState().responseText;
    }

    responseStatus () {
        return this._ensureNetworkState().responseStatus;
    }

    responseOk () {
        return this._ensureNetworkState().responseOk;
    }

    jsonGet (args) {
        let value = parseJson(args.JSON);
        if (value === null) return '';
        for (const part of pathParts(args.PATH)) {
            if (value === null || typeof value !== 'object' || !Object.prototype.hasOwnProperty.call(value, part)) {
                return '';
            }
            value = value[part];
        }
        return typeof value === 'object' ? JSON.stringify(value) : value;
    }

    jsonSet (args) {
        const root = parseJson(args.JSON);
        if (root === null || typeof root !== 'object') return '{}';
        const parts = pathParts(args.PATH);
        if (!parts.length) return JSON.stringify(root);
        let cursor = root;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!cursor[part] || typeof cursor[part] !== 'object') cursor[part] = {};
            cursor = cursor[part];
        }
        cursor[parts[parts.length - 1]] = coerceJsonValue(args.VALUE);
        return JSON.stringify(root);
    }

    jsonIsValid (args) {
        return parseJson(args.JSON) !== null;
    }

    jsonStringify (args) {
        return JSON.stringify(Cast.toString(args.TEXT));
    }
}

Scratch3NetworkBlocks.defaultNetworkState = defaultNetworkState;

module.exports = Scratch3NetworkBlocks;
