module manticore {
    function makeEl(elName:string) {
        return (attributes, children = []) => {
            var el = document.createElement(elName);
            attributes = attributes || {};
            
            for (var k in attributes) if (attributes.hasOwnProperty(k)) {
                if (k.indexOf("on") === 0) {
                    var eventName = k.slice(2);
                    el.addEventListener(eventName, attributes[k]);
                }
                else {
                    el.setAttribute(k, attributes[k]);
                }
            }
            
            for (var i = 0, j = children.length; i < j; i++) {
                el.appendChild(children[i]);
            }
            
            return el;
        }
     }

    export var DOM = {
        remove: (n:Node) => {
            if (n.parentNode) n.parentNode.removeChild(n);
        },

        empty: (el:HTMLElement) => {
            while (el.children.length) el.removeChild(el.children[0]);
        },

        text: (s:string) => document.createTextNode(s),

        div: makeEl("div"),
        span: makeEl("span"),
        a: makeEl("a"),
        p: makeEl("p"),
        em: makeEl("em"),
        strong: makeEl("strong"),
        
        ul: makeEl("ul"),
        ol: makeEl("ol"),
        li: makeEl("li"),
        
        section: makeEl("section"),
        article: makeEl("article"),
        
        header: makeEl("header"),
        hgroup: makeEl("hgroup"),
        h1: makeEl("h1"),
        h2: makeEl("h2"),

        footer: makeEl("footer"),
        
        form: makeEl("form"),
        button: makeEl("button"),
        input: makeEl("input"),
        label: makeEl("label")
    };
}