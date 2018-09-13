class EventDispatcher {
    constructor() {
        this._eventListeners = this._eventListeners || new Map(); //TODO: See how Map performance compares to Object
    }

    dispatchEvent(eventName, payload) {
        let handlers = this._eventListeners.get(eventName);
        if (!handlers) return;

        handlers.forEach((handler) => {
            try {
                handler.call(this, payload);
            } catch (error) {
                //Throw Error
            }
        });
    }

    addEventListener(eventName, handler) {
        let handlers = this._eventListeners.get(eventName);

        if (!handlers) {
            handlers = new Set(); //TODO: See how Map performance compares to Object
            this._eventListeners.set(eventName, handlers);
        }

        handlers.add(handler);
    }

    removeEventListener(eventName, handler) {
        let handlers = this._eventListeners.get(eventName);

        if (handler) { //Delete a single handler
            handlers.delete(handler);
        } else { //Delete all handlers for eventName if no handler is specified
            this._eventListeners.delete(eventName);
        }
    }

    addEventListenerOnce(eventName, handler) { //TODO: untested

        const once = (payload) => {
            this.removeEventListener(eventName, once);
            handler.call(this, payload);
        };

        this.addEventListener(eventName, once);
    }

    hasEventListener(eventName) {
        return (this._eventListeners.has(eventName) && this._eventListeners.get(eventName).size > 0);
    }
}

export default EventDispatcher;