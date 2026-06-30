const root = process.env.ROUTING_STYLE === 'hash' ? './' : '/';
const modelRoot = `${root}static/amethyst-models/`;

const icon = (label, shape) => {
    const drawings = {
        cube: [
            '<rect x="24" y="24" width="80" height="80" rx="10" fill="#cc69ff"/>',
            '<path d="M38 36h52l14 14v54H24V50z" fill="#b44ee8"/>',
            '<path d="M38 36v52h52V36z" fill="#d783ff"/>'
        ].join(''),
        sphere: [
            '<circle cx="64" cy="64" r="44" fill="#cc69ff"/>',
            '<ellipse cx="50" cy="47" rx="18" ry="12" fill="#ebb8ff" opacity=".72"/>'
        ].join(''),
        cone: [
            '<path d="M64 18l42 82H22z" fill="#cc69ff"/>',
            '<ellipse cx="64" cy="100" rx="42" ry="14" fill="#a93fdd"/>',
            '<path d="M64 18l12 82H52z" fill="#e0a2ff" opacity=".75"/>'
        ].join(''),
        cylinder: [
            '<ellipse cx="64" cy="32" rx="38" ry="14" fill="#e0a2ff"/>',
            '<path d="M26 32v64c0 8 17 14 38 14s38-6 38-14V32z" fill="#cc69ff"/>',
            '<ellipse cx="64" cy="96" rx="38" ry="14" fill="#ad44df"/>'
        ].join(''),
        plane: [
            '<path d="M18 72l92-36v24L62 74l48 14v24z" fill="#cc69ff"/>',
            '<path d="M62 74l-20 6 20 8 48-14z" fill="#e8b1ff" opacity=".75"/>'
        ].join(''),
        torus: [
            '<circle cx="64" cy="64" r="46" fill="#cc69ff"/>',
            '<circle cx="64" cy="64" r="21" fill="#f7f7fb"/>',
            '<ellipse cx="50" cy="45" rx="22" ry="11" fill="#ebb8ff" opacity=".58"/>'
        ].join(''),
        blank: [
            '<rect x="28" y="28" width="72" height="72" rx="14" fill="none" ',
            'stroke="#cc69ff" stroke-width="8" stroke-dasharray="13 9"/>',
            '<path d="M64 45v38M45 64h38" stroke="#cc69ff" stroke-width="8" stroke-linecap="round"/>'
        ].join('')
    };
    return `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${label}">
            <rect width="128" height="128" rx="24" fill="#f7f0ff"/>
            ${drawings[shape]}
        </svg>`
    )}`;
};

const actor = (id, name, fileName, shape) => ({
    id,
    name,
    tags: ['basics', 'shapes'],
    rawURL: icon(name, shape),
    model: {
        id: `amethyst-builtin-${id}`,
        name: fileName,
        url: `${modelRoot}${fileName}`
    }
});

const amethystActorLibrary = [
    {
        id: 'blank',
        name: 'Blank Actor',
        tags: ['basics', 'blank'],
        rawURL: icon('Blank Actor', 'blank'),
        blank: true
    },
    actor('cube', 'Cube', 'Cube.glb', 'cube'),
    actor('sphere', 'Sphere', 'Sphere.glb', 'sphere'),
    actor('cone', 'Cone', 'Cone.glb', 'cone'),
    actor('cylinder', 'Cylinder', 'Cylinder.glb', 'cylinder'),
    actor('plane', 'Plane', 'Plane.glb', 'plane'),
    actor('torus', 'Torus', 'Torus.glb', 'torus')
];

export {
    amethystActorLibrary
};
