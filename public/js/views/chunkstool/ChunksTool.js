import {ChunksModel} from "./ChunksModel.js";
import {CanvasUtils as Utils} from "../../utils/CanvasUtils.js";

export default class ChunksTool {
    constructor() {

        this._currentControl = "";
        this._invalidated = false;

        this.el = document.createElement("div");
        this.el.className = "ChunksTool";

        this._buffer = null;
        this._chunksModel = null;

        this._resolution = 15;

        this._chunkMap = {
            "platform1": "E",
            "platform2": "F",
            "platform3": "G",
            "ground": "a",
            "trip_block": "s",
            "hole": "x",
            "coin_low": "*",
            "coin_med": "^",
            "coin_high": "~",
            "clear": ""
        };

        this._colorsMap = {
            "": "#ffffff",
            "clear": "#ffffff",
            "platform1": "#fffc8d",
            "platform2": "#7eff36",
            "platform3": "#ff6271",
            "ground": "#cecece",
            "trip_block": "#0d0000",
            "hole": "#000000",
            "coin_low": "#ff0000",
            "coin_med": "#7eff36",
            "coin_high": "#fffc8d",
        };

        this.initialize();
    }

    initialize() {

        this._chunksModel = new ChunksModel();
        this._chunksModel.addEventListener("change", this._onChunksModelChange.bind(this));

        this._buffer = Utils.CreateBuffer();
        this._buffer.resize(1000, 500);
        this._buffer.canvas.onclick = this._onClickCanvas.bind(this);
        this.el.appendChild(this._buffer.canvas);

        var components = document.getElementsByClassName('chunk')[0];
        this.el.appendChild(components);

        this._chunksInput = components.getElementsByTagName('select')[0];
        this._chunksInput.onchange = this._updateCurrentChunk.bind(this);
        this._levelInput = components.getElementsByTagName('select')[1];
        this._levelInput.onchange = this._onLevelChange.bind(this);
        this._widthInput = components.getElementsByTagName('select')[2];
        this._widthInput.onchange = this._updateDimensions.bind(this);
        this._heightInput = components.getElementsByTagName('select')[3];
        this._heightInput.onchange = this._updateDimensions.bind(this);

        this._fileSelectButton = components.getElementsByClassName("open-button")[0].childNodes[1];
        this._fileSelectButton.addEventListener("change", this._onFileSelect.bind(this));
        this._saveButton = components.getElementsByClassName("new-chunk-button")[0];
        this._saveButton.addEventListener("click", this._onNewChunkButton.bind(this));
        this._writeTextButton = components.getElementsByClassName("write-text-button")[0];
        this._writeTextButton.addEventListener("click", this._onWriteTextSelect.bind(this));
        this._writeJSONButton = components.getElementsByClassName("write-json-button")[0];
        this._writeJSONButton.addEventListener("click", this._onWriteJSONSelect.bind(this));
        this._eraseButton = components.getElementsByClassName("erase-button")[0];
        this._eraseButton.addEventListener("click", this._onEraseSelect.bind(this));

        var spans = components.getElementsByTagName('span');
        for (var i = 0; i < spans.length; i++) {
            var span = spans[i];
            span.onclick = this._onElementClick.bind(this);
        }
        this._setControl("ground");
        this._onChunksModelChange();
    }

    draw(time) {
        //put animation frame code here

        if (this._invalidated) {
            this._invalidated = false;

            var chunk = this._chunksModel.getCurrentChunk();

            var gW = chunk.width;
            var gH = chunk.height;
            var rX = this._resolution;
            var rY = this._resolution;

            this._buffer.resize(rX * gW, rY * gH);

            this._bounds = {
                x: 0,
                y: 0,
                w: (gW * rX),
                h: (gH * rY)
            };

            this._buffer.clear();
            this._buffer.ctx.save();
            this._drawPoints(rX, rY, gW, gH);

            this._drawGrid(rX, rY, gW, gH);
        }
    }

    //--------------------------------

    _drawGrid(rX, rY, gW, gH) {

        this._buffer.ctx.beginPath();
        this._buffer.ctx.strokeStyle = "grey";
        this._buffer.ctx.strokeWeight = "1px";
        this._buffer.ctx.rect(0, 0, rX * gW, rY * gH);

        for (var i = 0; i < gW + 1; i++) {
            this._buffer.ctx.beginPath();
            if (i % 4 == 0) {
                this._buffer.ctx.strokeStyle = "black";
                this._buffer.ctx.strokeWeight = "10px";
            } else {
                this._buffer.ctx.strokeStyle = "grey";
                this._buffer.ctx.strokeWeight = "1px";
            }
            this._buffer.ctx.moveTo(i * rX, 0);
            this._buffer.ctx.lineTo(i * rX, gH * rY);
            this._buffer.ctx.stroke();
        }


        for (var i = 0; i < gH; i++) {
            this._buffer.ctx.beginPath();
            if (i % 4 == 0) {
                this._buffer.ctx.strokeStyle = "black";
                this._buffer.ctx.strokeWeight = "10px";
            } else {
                this._buffer.ctx.strokeStyle = "grey";
                this._buffer.ctx.strokeWeight = "1px";
            }
            this._buffer.ctx.moveTo(0, i * rY);
            this._buffer.ctx.lineTo(gW * rX, i * rX);
            this._buffer.ctx.stroke();
        }

    }

    _drawPoints(rX, rY, gW, gH) {
        var chunk = this._chunksModel.getCurrentChunk();
        var points = chunk.points;
        points.forEach(point => {
            this._buffer.ctx.beginPath();
            var key = this._getToken(point.value);
            this._buffer.ctx.fillStyle = this._colorsMap[key];
            this._buffer.ctx.rect(point.x * rX, point.y * rY, rX, rY);
            this._buffer.ctx.fill();
        });
    }

    _getToken(token) {
        for (var key in this._chunkMap) {
            if (this._chunkMap[key] == token)
                return key;
        }
        return "";
    }

    _onElementClick(e) {
        var element = e.target.className.split(" ")[0];
        this._setControl(element);
    }

    _onLevelChange() {
        var value = this._levelInput.selectedOptions[0].label;
        this._chunksModel.setCurrentLevel(parseInt(value) - 1);
    }

    _onChunksModelChange() {
        this._invalidated = true;

        var chunks = this._chunksModel.getCurrentLevel();

        this._chunksInput.innerHTML = "";
        chunks.forEach((chunk, index) => {
            var option = document.createElement("option");
            option.value = index;
            option.innerHTML = index;
            this._chunksInput.appendChild(option);
        });
        this._chunksInput.selectedIndex = this._chunksModel.get("currentChunk");
        this._levelInput.selectedIndex = this._chunksModel.get("currentLevel");

        var chunk = this._chunksModel.getCurrentChunk();
        for (var i = 0; i < this._widthInput.options.length; i++) {
            if (parseInt(this._widthInput.options[i].value) == chunk.width)
                this._widthInput.selectedIndex = i;
        }
        for (var i = 0; i < this._heightInput.options.length; i++) {
            if (parseInt(this._heightInput.options[i].value) == chunk.height)
                this._heightInput.selectedIndex = i;
        }
    }

    _updateCurrentChunk() {
        var value = this._chunksInput.selectedOptions[0].label;
        this._chunksModel.setCurrentChunk(value);
    }

    _updateDimensions() {
        var width = this._widthInput.selectedOptions[0].label;
        var height = this._heightInput.selectedOptions[0].label;
        this._chunksModel.reset({w: parseInt(width), h: parseInt(height)});
        this._invalidated = true;
    }

    _setControl(str) {
        this._currentControl = str;

        var spans = this.el.getElementsByTagName('span');
        for (var i = 0; i < spans.length; i++) {
            var span = spans[i];
            if (span.classList.contains(str)) {
                span.classList.add("selected");
            } else {
                span.classList.remove("selected");
            }
        }
    }

    onResize(args) {
    }

    onScroll(percentage) {
    }

    onClick(e) {
    }

    _onClickCanvas(e) {

        var chunk = this._chunksModel.getCurrentChunk();

        var x = Math.floor((e.offsetX - this._bounds.x) / this._resolution);
        var y = Math.floor((e.offsetY - this._bounds.y) / this._resolution);
        var index = y * chunk.width + x;
        this._chunksModel.setPoint(index, this._chunkMap[this._currentControl]);

    }

    _onControlsClick(e) {
        this._setControl(e.target.innerHTML);
    }

    _onFileSelect(e) {
        var files = e.target.files;
        var reader = new FileReader();

        reader.addEventListener("load", () => {
            var json = JSON.parse(reader.result);
            this._chunksModel.setChunksJSON(json);
            console.log(json);
        });

        reader.readAsText(files[0]);

    }

    _onNewChunkButton() {
        this._chunksModel.newChunk();
        this._invalidated = true;
    }

    _onWriteTextSelect() {
        this._chunksModel.saveChunksText();
        this._invalidated = true;
    }

    _onWriteJSONSelect() {
        this._chunksModel.saveChunksJSON();
        this._invalidated = true;
    }

    _onEraseSelect() {
        this._chunksModel.reset();
        this._invalidated = true;
    }

    onMouseMove(e) {
    }

    onMouseUp() {
    }

    onMouseDown() {
    }

    getHeight() {
        var height = this.el.getBoundingClientRect().height;
        return height;
    }
}