const Cast = require('../util/cast');

const defaultMediaDisplay = () => ({
    type: 'image',
    source: '',
    name: '',
    width: 180,
    height: 120,
    playing: false,
    revision: 0
});

class Scratch3MediaDisplayBlocks {
    constructor (runtime) {
        this.runtime = runtime;
    }

    getPrimitives () {
        return {
            media_setimageurl: this.setImageUrl,
            media_setvideourl: this.setVideoUrl,
            media_setuploaded: this.setUploaded,
            media_setsize: this.setMediaSize,
            media_play: this.play,
            media_pause: this.pause,
            media_restart: this.restart,
            media_time: this.time,
            media_duration: this.duration,
            media_loaded: this.loaded
        };
    }

    _getTarget (util) {
        if (!util || !util.target || util.target.isStage) return null;
        return util.target;
    }

    _ensureMedia (target) {
        if (!target.mediaDisplay) {
            target.mediaDisplay = defaultMediaDisplay();
        }
        return target.mediaDisplay;
    }

    _commit (target) {
        target.mediaDisplay.revision = (target.mediaDisplay.revision || 0) + 1;
        if (this.runtime.requestRedraw) this.runtime.requestRedraw();
        if (this.runtime.requestTargetsUpdate) this.runtime.requestTargetsUpdate(target);
    }

    _setSource (type, source, name, util) {
        const target = this._getTarget(util);
        if (!target) return;
        const media = this._ensureMedia(target);
        media.type = type;
        media.source = Cast.toString(source);
        media.name = Cast.toString(name || '');
        media.playing = false;
        this._commit(target);
    }

    setImageUrl (args, util) {
        this._setSource('image', args.URL, '', util);
    }

    setVideoUrl (args, util) {
        this._setSource('video', args.URL, '', util);
    }

    setUploaded (args, util) {
        this._setSource('image', args.SOURCE, args.NAME, util);
    }

    setMediaSize (args, util) {
        const target = this._getTarget(util);
        if (!target) return;
        const media = this._ensureMedia(target);
        media.width = Math.max(1, Cast.toNumber(args.WIDTH));
        media.height = Math.max(1, Cast.toNumber(args.HEIGHT));
        this._commit(target);
    }

    play (args, util) {
        const target = this._getTarget(util);
        if (!target) return;
        const media = this._ensureMedia(target);
        media.playing = true;
        this._commit(target);
    }

    pause (args, util) {
        const target = this._getTarget(util);
        if (!target) return;
        const media = this._ensureMedia(target);
        media.playing = false;
        this._commit(target);
    }

    restart (args, util) {
        const target = this._getTarget(util);
        if (!target) return;
        const media = this._ensureMedia(target);
        media.playing = true;
        media.restartToken = (media.restartToken || 0) + 1;
        this._commit(target);
    }

    time (args, util) {
        const target = this._getTarget(util);
        return target && target.mediaDisplay ? target.mediaDisplay.currentTime || 0 : 0;
    }

    duration (args, util) {
        const target = this._getTarget(util);
        return target && target.mediaDisplay ? target.mediaDisplay.duration || 0 : 0;
    }

    loaded (args, util) {
        const target = this._getTarget(util);
        return Boolean(target && target.mediaDisplay && target.mediaDisplay.loaded);
    }
}

Scratch3MediaDisplayBlocks.defaultMediaDisplay = defaultMediaDisplay;

module.exports = Scratch3MediaDisplayBlocks;
