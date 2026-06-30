const test = require('tap').test;
const Network = require('../../src/blocks/scratch3_network');
const compatBlocks = require('../../src/compiler/compat-blocks');

const makeRuntime = () => ({
    requestRedrawCalled: false,
    requestRedraw () {
        this.requestRedrawCalled = true;
    }
});

test('network starts locked behind explicit safety confirmation', t => {
    const runtime = makeRuntime();
    const blocks = new Network(runtime);

    t.equal(runtime.amethystNetwork.confirmed, false);
    t.equal(blocks.isConfirmed(), false);

    blocks.confirmSafety();
    t.equal(runtime.amethystNetwork.confirmed, true);
    t.equal(blocks.isConfirmed(), true);
    t.end();
});

test('network request refuses to run before confirmation', async t => {
    const runtime = makeRuntime();
    const blocks = new Network(runtime);
    let called = false;
    blocks._fetch = () => {
        called = true;
        return Promise.resolve();
    };

    await blocks.sendRequest({METHOD: 'GET', URL: 'https://example.com'});

    t.equal(called, false);
    t.equal(blocks.responseStatus(), 0);
    t.equal(blocks.responseOk(), false);
    t.match(blocks.responseText(), /confirm/i);
});

test('browser-safe request uses fetch and stores response', async t => {
    const runtime = makeRuntime();
    const blocks = new Network(runtime);
    blocks.confirmSafety();
    blocks._fetch = (url, options) => {
        t.equal(url, 'https://example.com/api');
        t.same(options, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: '{"hello":"world"}',
            mode: 'cors',
            credentials: 'omit'
        });
        return Promise.resolve({
            status: 201,
            ok: true,
            text: () => Promise.resolve('{"ok":true}')
        });
    };

    await blocks.sendAPIRequest({
        METHOD: 'POST',
        URL: 'https://example.com/api',
        BODY: '{"hello":"world"}'
    });

    t.equal(blocks.responseStatus(), 201);
    t.equal(blocks.responseOk(), true);
    t.equal(blocks.responseText(), '{"ok":true}');
});

test('browser-safe request rejects local and non-web URLs', async t => {
    const blocks = new Network(makeRuntime());
    blocks.confirmSafety();
    let called = false;
    blocks._fetch = () => {
        called = true;
        return Promise.resolve();
    };

    await blocks.sendRequest({METHOD: 'GET', URL: 'file:///C:/secret.txt'});
    t.equal(called, false);
    t.match(blocks.responseText(), /http/i);

    await blocks.sendRequest({METHOD: 'GET', URL: 'http://localhost:3000/debug'});
    t.equal(called, false);
    t.match(blocks.responseText(), /local/i);

    await blocks.sendRequest({METHOD: 'GET', URL: 'http://192.168.1.1/admin'});
    t.equal(called, false);
    t.match(blocks.responseText(), /local/i);
});

test('json path helpers read and update json text', t => {
    const blocks = new Network(makeRuntime());
    const source = '{"player":{"name":"Noah","hp":10}}';

    t.equal(blocks.jsonGet({PATH: 'player.name', JSON: source}), 'Noah');
    t.equal(blocks.jsonGet({PATH: 'player.hp', JSON: source}), 10);
    t.equal(blocks.jsonIsValid({JSON: source}), true);
    t.equal(blocks.jsonIsValid({JSON: '{bad'}), false);

    const updated = blocks.jsonSet({
        PATH: 'player.hp',
        VALUE: '12',
        JSON: source
    });
    t.equal(JSON.parse(updated).player.hp, 12);
    t.end();
});

test('network blocks are accepted by compiler compatibility layer', t => {
    [
        'network_confirmsafety',
        'network_isconfirmed',
        'network_responsetext',
        'network_responsestatus',
        'network_responseok',
        'network_sendapirequest',
        'network_sendrequest',
        'network_jsonget',
        'network_jsonset',
        'network_jsonvalid',
        'network_jsonstringify'
    ].forEach(opcode => {
        t.ok(compatBlocks.stacked.includes(opcode), `${opcode} is stack-compatible`);
    });

    [
        'network_isconfirmed',
        'network_responsetext',
        'network_responsestatus',
        'network_responseok',
        'network_jsonget',
        'network_jsonset',
        'network_jsonvalid',
        'network_jsonstringify'
    ].forEach(opcode => {
        t.ok(compatBlocks.inputs.includes(opcode), `${opcode} is reporter-compatible`);
    });
    t.end();
});
