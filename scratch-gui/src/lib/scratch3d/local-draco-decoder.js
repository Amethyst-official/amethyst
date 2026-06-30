const getLocalDracoDecoderPath = () => {
    const root = process.env.ROOT || '/';
    return `${root}static/draco/gltf/`;
};

export {
    getLocalDracoDecoderPath
};
