module manticore.event {
    export class Event<T> {
        private handlers: Array<(v:T) => void>;
        constructor () {
            this.handlers = [];
        }

        public trigger(v:T) {
            for (var i = 0, j = this.handlers.length; i < j; i++) {
                this.handlers[i](v);
            }
        }

        public register(handler:(v:T) => void) {
            this.handlers.push(handler);
        }
    }
}