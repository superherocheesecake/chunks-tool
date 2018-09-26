const BaseView  = require('./BaseView.js');
const ChunksTool = require("./chunkstool/ChunksTool.js");

class MainView extends BaseView {

    constructor(el) {
        super(el);
        this._expanderEl = null;
        this._sketch = null;
        this._cachedSketches = {};
        this.config = {};
        this._menuView = {};

        this._scrollTo = 0;
        this._destScrollTo = 0;

        this.DEFAULT_SKETCH = '';

        this._gui = null;
    }

    //---------------------------------------------------

    initialize() {
        this._start();
         this._addSketch("chunksTool", new ChunksTool())
    }

    /***
     * Update current sketch and smooth scroll
     * @param time
     */
    draw(time) {
        if (this._sketch) this._sketch.draw(time);

        //update smooth scroll
        if (this._expanderEl) {
            this._scrollTo +=
                (this._destScrollTo - this._scrollTo) * 0.1;
            var sP = 1.0 - (window.innerHeight - this._scrollTo) / window.innerHeight;

            if (this._sketch && this._sketch.onScroll)
                this._sketch.onScroll(sP);
        }
    }

    //---------------------------------------------------

    _addSketch(sketchId, sketch) {

        this._sketch = sketch;
        this.el.appendChild(this._sketch.el);

        this._onResize(null);
        this._onScroll(null);
    }

    /**
     * Setups events and loads default sketch
     * @private
     */
    _start() {

        this._setupScroll();
        this._setupWindow();
    }

    /***
     * Adds smooth scroll to page
     * @private
     */
    _setupScroll() {
        this._expanderEl = document.createElement('div');
        this._expanderEl.setAttribute('class', 'expander');
        document.body.appendChild(this._expanderEl);
    }

    _setupWindow() {
        window.onmousedown = this._onMouseDown.bind(this);
        window.onmouseup = this._onMouseUp.bind(this);
        window.onclick = this._onClick.bind(this);
        window.onresize = this._onResize.bind(this);
        window.onscroll = this._onScroll.bind(this);
        window.onmousemove = this._onMouseMove.bind(this);
    }

    _onClick(e) {
        if (this._sketch && this._sketch.onClick)
            this._sketch.onClick(e);
    }

    _onResize() {
        if (this._sketch) {
            this._sketch.onResize(
                window.innerWidth,
                window.innerHeight
            );
        }
        this._expanderHeight = this._sketch.getHeight();
        this._expanderEl.style.height = this._expanderHeight + 'px';
    }

    _onScroll() {
        this._destScrollTo = window.scrollY;
    }

    _onMouseMove(e) {
        if (this._sketch && this._sketch.onMouseMove)
            this._sketch.onMouseMove(e);
    }

    _onMouseDown(e) {
        if (this._sketch && this._sketch.onMouseDown)
            this._sketch.onMouseDown(e);
    }

    _onMouseUp(e) {
        if (this._sketch && this._sketch.onMouseUp)
            this._sketch.onMouseUp(e);
    }

  
    /***
     * Sets dat.gui params if configurated in config.json
     * @param params
     * @private
     */
    _setGUI(params) {

        if (!params)
            return;

        this._gui = new dat.GUI();

        for (var key in params) {
            var value = params[key];
            if (params[key] !== undefined) {
                if (Array.isArray(value) && value.length > 1) {
                    if (value.length == 2)
                        this._gui.add(this._sketch, key).min(value[0]).max(value[1]).listen();
                } else
                    this._gui.add(this._sketch, key, value).listen();
            } else {
                console.error(
                    'Sketch "' +
                    sketch.id +
                    '" has no property "' +
                    key +
                    '"'
                );
            }
        }
    }

    /***
     * Clear controllers from gui and destroy element
     * @private
     */
    _clearGUI() {
        if (this._gui) {
            this._gui.destroy();
            this._gui = null;
        }
    }
}

module.exports = MainView;