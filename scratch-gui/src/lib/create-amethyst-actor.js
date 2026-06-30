import {emptySprite} from './empty-assets';
import sharedMessages from './shared-messages';

const arrayBufferToDataUri = (buffer, mimeType) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return `data:${mimeType};base64,${btoa(binary)}`;
};

const fetchModelAsDataUri = model =>
    fetch(model.url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Could not load ${model.name}`);
            }
            return response.arrayBuffer();
        })
        .then(buffer => arrayBufferToDataUri(buffer, 'model/gltf-binary'));

const createAmethystActor = (vm, item, formatMessage) => {
    const beforeTargetIds = vm.runtime.targets.map(target => target.id);
    const soundName = formatMessage(sharedMessages.pop);
    const costumeName = formatMessage(sharedMessages.costume, {index: 1});
    const sprite = emptySprite(item.name, soundName, costumeName);

    return vm.addSprite(JSON.stringify(sprite))
        .then(() => {
            const target = vm.runtime.targets.find(candidate => (
                !beforeTargetIds.includes(candidate.id) &&
                !candidate.isStage
            ));
            if (!target) return null;
            vm.setEditingTarget(target.id);
            if (!item.model) return target;

            return fetchModelAsDataUri(item.model)
                .then(dataUri => {
                    target.setModel3D({
                        id: item.model.id,
                        name: item.model.name,
                        dataUri
                    });
                    vm.runtime.emitProjectChanged();
                    return target;
                });
        });
};

export default createAmethystActor;
