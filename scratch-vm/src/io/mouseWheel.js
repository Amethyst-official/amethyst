class MouseWheel {
    constructor (runtime) {
        /**
         * Reference to the owning Runtime.
         * @type{!Runtime}
         */
        this.runtime = runtime;
    }

    /**
     * Mouse wheel DOM event handler.
     * @param  {object} data Data from DOM event.
     */
    postData (data) {
        if (!this.runtime.scratch3dMouse) {
            this.runtime.scratch3dMouse = {
                visible: true,
                locked: false,
                mode: 'normal',
                sensitivity: 1,
                thirdPersonDistance: 240,
                deltaX: 0,
                deltaY: 0,
                wheelDirection: 0,
                wheelUntil: 0,
                revision: 0
            };
        }
        const deltaY = Number(data.deltaY || 0);
        this.runtime.scratch3dMouse.wheelDirection = deltaY < 0 ? -1 : deltaY > 0 ? 1 : 0;
        this.runtime.scratch3dMouse.wheelUntil = deltaY === 0 ? 0 : Date.now() + 150;
        this.runtime.scratch3dMouse.revision = (this.runtime.scratch3dMouse.revision || 0) + 1;

        const matchFields = {};
        if (deltaY < 0) {
            matchFields.KEY_OPTION = 'up arrow';
        } else if (deltaY > 0) {
            matchFields.KEY_OPTION = 'down arrow';
        } else {
            return;
        }

        this.runtime.startHats('event_whenkeypressed', matchFields);
    }
}

module.exports = MouseWheel;
