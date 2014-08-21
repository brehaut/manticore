/// <reference path="types.d.ts" />

// a utility for doing simple ajax requests.
function awaitAjax(url:string, method?:string):Promise<string> {
    return new Promise<any>((resolve, reject) => {
        var req = null;

        if ((<any>window).ActiveXObject) {
	    req = new ActiveXObject('Microsoft.XMLHTTP');
        }        
        else if ((<any>window).XMLHttpRequest) {
	    req = new XMLHttpRequest();
        }
        else {
            reject(new Error("No XMLHttpReqest support"));
        }

        function cleanup() {
            req.onreadystatechange = null;
            req.onerror = null;
            req.ontimeout = null;
            req = null;
        }
        
        req.onreadystatechange = () => {
            if (req.readyState < 4) return;
            
            if (req.status === 200) {
                resolve(req.responseText)
            }
            else {
                reject(req);
            }

            cleanup();            
        };

        req.onerror = reject;
        req.ontimeout = reject;

        req.open(method || "GET", url, true);
        req.send();
    });
}


// implement functors on promises so that .then isnt so gross.
// 
// exchanging one evil (duckwrapping) for another (monkeypatching a core type)
if (typeof Promise.prototype.map == "undefined") {
    Promise.prototype.map = function (fn) {
        return this.then((data) => new Promise((resolve, _) => resolve(fn(data))));
    };
}


    