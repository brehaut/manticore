module manticore {
    export var DOM:any= {};

    DOM.text = (s:string) => document.createTextNode(s);

    ["div", "span", "a", "p", "em", "strong",
     "section", "article", 
     "header", "hgroup", "h1", "h2",
     "footer",
     "form", "button", "input"].forEach((elName:string) => {
         DOM[elName] = (attributes, ...children) => {
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
     });
     
}