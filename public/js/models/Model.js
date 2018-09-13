import EventDispatcher from "../events/EventDispatcher.js";

export default class Model extends EventDispatcher {

    constructor() {
        super();
        this.changed = null;
        this.idAttribute = 'id';
    }

    get(attr) {
        return this.attributes[attr];
    }

    set(key, val, options) {
        if (key == null) return this;

        // Handle both `"key", value` and `{key: value}` -style arguments.
        var attrs;
        if (typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }

        options || (options = {});


        // Extract attributes and options.
        var unset = options.unset;
        var silent = options.silent;
        var changes = [];
        var changing = this._changing;
        this._changing = true;

        if (!changing) {
            this._previousAttributes = this._clone(this.attributes);
            this.changed = {};
        }

        var current = this.attributes;
        var changed = this.changed;
        var prev = this._previousAttributes;

        // For each `set` attribute, update or delete the current value.
        for (var attr in attrs) {
            val = attrs[attr];
            if (!_.isEqual(current[attr], val)) changes.push(attr);
            if (!_.isEqual(prev[attr], val)) {
                changed[attr] = val;
            } else {
                delete changed[attr];
            }
            unset ? delete current[attr] : current[attr] = val;
        }

        // Update the `id`.
        if (this.idAttribute in attrs) this.id = this.get(this.idAttribute);

        // Trigger all relevant attribute changes.
        if (!silent) {
            if (changes.length) this._pending = options;
            for (var i = 0; i < changes.length; i++) {
                this.trigger('change:' + changes[i], this, current[changes[i]], options);
            }
        }

        // You might be wondering why there's a `while` loop here. Changes can
        // be recursively nested within `"change"` events.
        if (changing) return this;
        if (!silent) {
            while (this._pending) {
                options = this._pending;
                this._pending = false;
                this.dispatchEvent('change', this, options);
            }
        }
        this._pending = false;
        this._changing = false;
        return this;
    }

    //----------------------------

    _clone(src) {
        let target = {};
        for (let prop in src) {
            if (src.hasOwnProperty(prop)) {
                target[prop] = src[prop];
            }
        }
        return target;
    }

}