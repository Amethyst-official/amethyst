import {
    buildAmethystExportHTML
} from '../../src/lib/amethyst-html-exporter';

describe('amethyst-html-exporter', () => {
    test('embeds project data as base85 chunks instead of one base64 payload', async () => {
        const projectData = new Uint8Array(96 * 1024 + 7);
        for (let i = 0; i < projectData.length; i++) {
            projectData[i] = i % 251;
        }

        const html = await buildAmethystExportHTML({
            projectData,
            title: 'Chunk Test',
            offlineRuntime: {
                html: '<!doctype html><html><body>player</body></html>',
                bytes: 44,
                fileCount: 1
            }
        });

        expect(html).not.toContain('projectBase64');
        expect(html).toContain('"projectEncoding":"base85-chunks"');
        expect(html).toMatch(/<script data-amethyst-project="[!-~]+">decodeProjectChunk\(\d+\)<\/script>/);
        expect(html.match(/data-amethyst-project=/g)).toHaveLength(2);
    });
});
