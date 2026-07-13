import {
    buildAmethystExportHTML,
    getHTMLExportFilename
} from '../../../src/lib/amethyst-html-exporter';

describe('amethyst-html-exporter', () => {
    test('uses a clean html filename', () => {
        expect(getHTMLExportFilename('My Game.amx')).toBe('My Game.html');
        expect(getHTMLExportFilename('Cool Project')).toBe('Cool Project.html');
        expect(getHTMLExportFilename('')).toBe('Amethyst Game.html');
    });

    test('embeds project data and Amethyst player bootstrap', async () => {
        const html = await buildAmethystExportHTML({
            projectData: new Uint8Array([65, 66, 67]).buffer,
            title: 'A <weird> "game"',
            runtimeUrl: 'https://example.com/embed.html'
        });

        expect(html).toContain('<title>A &lt;weird&gt; &quot;game&quot;</title>');
        expect(html).toContain('"projectBase64":"QUJD"');
        expect(html).toContain('"runtimeUrl":"https://example.com/embed.html"');
        expect(html).toContain('amethyst-export-project');
        expect(html).toContain('iframe');
        expect(html).not.toContain('.sb3');
    });
});
