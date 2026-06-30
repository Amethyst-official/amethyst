import fs from 'fs';
import path from 'path';

import {getLocalDracoDecoderPath} from '../../../src/lib/scratch3d/local-draco-decoder';

describe('local Draco decoder assets', () => {
    test('uses the bundled Draco decoder path', () => {
        expect(getLocalDracoDecoderPath()).toBe('/static/draco/gltf/');
    });

    test('3D model loaders do not point at the online Google Draco decoder', () => {
        const files = [
            path.resolve(__dirname, '../../../src/components/stage-3d/stage-3d.jsx'),
            path.resolve(__dirname, '../../../src/components/stage-3d/model-preview.jsx')
        ];

        for (const file of files) {
            expect(fs.readFileSync(file, 'utf8')).not.toContain('gstatic.com/draco');
        }
    });

    test('extension picker does not fetch the online extension gallery', () => {
        const extensionLibrary = fs.readFileSync(
            path.resolve(__dirname, '../../../src/containers/extension-library.jsx'),
            'utf8'
        );
        const extensionLibraryItems = fs.readFileSync(
            path.resolve(__dirname, '../../../src/lib/libraries/extensions/index.jsx'),
            'utf8'
        );

        expect(extensionLibrary).not.toContain('extensions.turbowarp.org');
        expect(extensionLibrary).not.toContain('fetchLibrary');
        expect(extensionLibraryItems).not.toContain('extensions.turbowarp.org');
    });

    test('extension picker only shows Amethyst-ready extension cards', () => {
        const extensionLibraryItems = fs.readFileSync(
            path.resolve(__dirname, '../../../src/lib/libraries/extensions/index.jsx'),
            'utf8'
        );
        const visibleList = extensionLibraryItems.match(/const visibleExtensionIds = new Set\(\[([\s\S]*?)\]\);/)[1];

        for (const extensionId of [
            'music',
            'pen',
            'videoSensing',
            'text2speech',
            'translate',
            'procedures_enable_return',
            'custom_extension'
        ]) {
            expect(visibleList).toContain(`'${extensionId}'`);
        }

        for (const extensionId of [
            'faceSensing',
            'makeymakey',
            'microbit',
            'ev3',
            'boost',
            'wedo2',
            'gdxfor',
            'tw'
        ]) {
            expect(visibleList).not.toContain(`'${extensionId}'`);
        }
    });

    test('VM has no online fallback extension URLs', () => {
        const defaultExtensionURLs = fs.readFileSync(
            path.resolve(__dirname, '../../../../scratch-vm/src/extension-support/tw-default-extension-urls.js'),
            'utf8'
        );

        expect(defaultExtensionURLs).not.toContain('extensions.turbowarp.org');
    });
});
