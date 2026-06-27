import * as THREE from 'three';

import {normalizeModelForStage} from '../../../src/lib/scratch3d/model-normalizer';

describe('normalizeModelForStage', () => {
    test('centers and scales a model into a visible Scratch3D actor size', () => {
        const root = new THREE.Group();
        const geometry = new THREE.BoxGeometry(2, 4, 6);
        const mesh = new THREE.Mesh(geometry);
        mesh.position.set(10, 20, 30);
        root.add(mesh);

        const actor = normalizeModelForStage(root);
        const box = new THREE.Box3().setFromObject(actor);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        expect(Math.round(Math.max(size.x, size.y, size.z))).toEqual(120);
        expect(Math.abs(center.x)).toBeLessThan(0.001);
        expect(Math.abs(center.y)).toBeLessThan(0.001);
        expect(Math.abs(center.z)).toBeLessThan(0.001);
    });

    test('leaves empty models safe to render', () => {
        const actor = normalizeModelForStage(new THREE.Group());

        expect(actor).toBeInstanceOf(THREE.Group);
        expect(actor.scale.x).toEqual(1);
        expect(actor.children.length).toEqual(1);
    });
});
