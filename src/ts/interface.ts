/// <reference path="data.ts" />
/// <reference path="dom.ts" />

module manticore.interface {
    class UI {
        catalog: Array<data.Monster>;
    }

    function loadingUI(root, promise) {
        var loading = DOM.div(null, DOM.text("Loading..."))
        root.appendChild(loading);

        promise.then((_) => {
            loading.remove();
        });
    }

    export function initialize(root, 
                               bestiary:Promise<bestiary.Bestiary>,
                               allocator) {
        loadingUI(root, bestiary);
    }
}