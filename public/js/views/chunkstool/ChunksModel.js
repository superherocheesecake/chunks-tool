import Model from "../../models/Model.js";

export class ChunksModel extends Model{

    constructor() {
        super();

        this._localStorage = false;

        this.attributes = {
            "currentLevel": 0,
            "currentChunk": 0,
            "chunks": {
                "date": "",
                "levels": [
                    [],
                    [],
                    []
                ]
            }
        };
    }

    initialize() {
        this._localStorage = this._isLocalStorageNameSupported();
        this.parse();
    }

    setPoint(index, value) {
        var chunk = this.getCurrentChunk();
        var points = chunk.points;
        points[index].value = value;
        this.dispatchEvent("change", this, {});
        this._save();
    }

    reset(d) {

        var chunk = this.getCurrentChunk();

        d = d || {};
        var dimensions = {
            w: d.w || chunk.width,
            h: d.h || chunk.height
        };

        var points = [];
        //reset points
        for (var y = 0; y < dimensions.h; y++) {
            for (var x = 0; x < dimensions.w; x++) {
                points.push({
                    x: x,
                    y: y,
                    value: y == dimensions.h - 1 ? "a" : ""
                });
            }
        }

        chunk.width = dimensions.w;
        chunk.height = dimensions.h;
        chunk.points = points;

        this._save();
    }

    newChunk() {
        var level = this.getCurrentLevel();
        var chunk = {
            points: [],
            width: 16,
            height: 16
        };
        level.push(chunk);
        this.set("currentChunk", level.length - 1);
        this.reset();
        return chunk;
    }

    saveChunksText() {
        var txt = "";
        var levels = this.get("chunks").levels;
        for (var i = 0; i < levels.length; i++) {
            var blocks = levels[i];
            for (var b = 0; b < blocks.length; b++) {
                var block = blocks[b];
                //start with name
                var str = "level :" + i + ", chunk :" + b + "\n";
                var line = "";
                var l = 0;
                while (l++ < block.width)
                    line += "#";
                str += line + "#\n";

                for (var y = 0; y < block.height; y++) {
                    for (var x = 0; x < block.width; x++) {
                        var index = y * block.width + x;
                        var value = block.points[index].value != "" ? block.points[index].value : " ";
                        str += value;
                    }
                    str += "#\n";
                }
                str += line + "#\n\n";
                txt += str;
            }
        }
        var blob = new Blob([txt], {type: 'text'});
        Utils.WriteBlobToFile("chunk.txt", blob);
    }

    saveChunksJSON() {

        var levels = this.get("chunks").levels;
        var lArr = [];
        for (var i = 0; i < levels.length; i++) {
            var blocks = levels[i];
            var bArr = [];
            for (var b = 0; b < blocks.length; b++) {
                var block = blocks[b];
                var arr = [];

                var hasValue = false;

                for (var y = 0; y < block.height; y++) {
                    var row = [];

                    for (var x = 0; x < block.width; x++) {
                        var index = y * block.width + x;
                        var value = block.points[index].value;
                        hasValue = hasValue || (value != "" && value != " ");
                        row.push(value);
                    }

                    //we wont be appending the initial rows if there's no objects
                    if (hasValue)
                        arr.push(row);

                }
                bArr.push({
                    "width": block.width,
                    "height": block.height,
                    "points": arr
                });
            }

            lArr.push(bArr)
        }

        var data = {
            "levels": lArr
        };

        var blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
        Utils.WriteBlobToFile("chunks.json", blob);
    }

    setChunksJSON(json) {
        if (json.levels) {
            var levels = [];

            json.levels.forEach(level => {
                var chunks = [];
                level.forEach(chunk => {
                    var height = chunk.height;
                    var width = chunk.width;
                    var offset = chunk.height - chunk.points.length;
                    var points = [];
                    for (var y = 0; y < height; y++) {
                        var row = y - offset;
                        for (var x = 0; x < width; x++) {
                            var value = row >= 0 ? chunk.points[row][x] : " ";
                            points.push({
                                "x": x,
                                "y": y,
                                "value": value
                            });
                        }
                    }
                    chunks.push({
                        "width": width,
                        "height": height,
                        "points": points
                    });
                });
                levels.push(chunks);
            });

            this.set("chunks", {"levels": levels});
        }
    }

    setCurrentChunk(value) {
        this.set("currentChunk", value);
    }

    setCurrentLevel(value) {
        this.set("currentChunk", 0);
        this.set("currentLevel", value);
    }

    getCurrentLevel() {
        var chunks = this.get("chunks");
        var level = this.get("currentLevel");
        return chunks.levels[level];
    }

    getCurrentChunk() {
        var chunks = this.get("chunks");
        var currentLevel = this.get("currentLevel");
        var level = chunks.levels[currentLevel];
        if (level.length)
            return level[this.get("currentChunk")];
        else {
            var chunk = this.newChunk();
            return chunk;
        }
    }

    toJSONString() {
        var json = this.toJSON();
        return JSON.stringify(json);
    }

    set() {
        Model.prototype.set.apply(this, arguments);
        this._save();
    }

    parse() {
        this._localStorage = this._isLocalStorageNameSupported();
        if (this._localStorage) {
            try {
                var data = JSON.parse(localStorage.getItem('chunks'));
                if (data)
                    this.attributes = data;
            } catch (e) {
            }
        }
    }

    //-----------------------------------

    _save() {
        if (this._localStorage) {
            localStorage.setItem('chunks', this.toJSONString());
        }
    }

    _isLocalStorageNameSupported() {
        var testKey = 'test', storage = window.localStorage;
        try {
            storage.setItem(testKey, '1');
            storage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

}