/* Porxy Service worker */

const PXY_TAG = '/PXY/';

var _proxies = {};

/**
rewriteUrl('http://127.0.0.1/a.js', 'http://127.0.0.1/PXY/serverId');
rewriteUrl('http://127.0.0.1/a.js', 'http://127.0.0.1/PXY/serverId/');
rewriteUrl('http://127.0.0.1/a.js', 'http://127.0.0.1/PXY/serverId/a.html');

rewriteUrl('http://127.0.0.1/a.js', 'http://127.0.0.1/PXY/https/remotespark.com/443');
rewriteUrl('http://127.0.0.1/a.js', 'http://127.0.0.1/PXY/https/remotespark.com/443/');
rewriteUrl('http://127.0.0.1/a.js', 'http://127.0.0.1/PXY/https/remotespark.com/443/a.html');


rewriteUrl('http://www.myhost.com/a.js', 'http://127.0.0.1/PXY/serverId/a.html');
rewriteUrl('http://www.myhost.com/a.js', 'http://127.0.0.1/PXY/https/remotespark.com/443/a.html');
*/
function rewriteUrl(req, ref){
    req = new URL(req);
    ref = new URL(ref);
    var path = ref.pathname;
    if (!path.startsWith(PXY_TAG) || req.pathname.startsWith('/_pxy_')){
        return req;
    }

    var start = PXY_TAG.length;
    var pos = path.indexOf('/', start);
    
    var isScheme = true;

    if (pos == -1 || pos == path.length - 1){//must be server id or resource like /PXY/_pxy_.js
        isScheme = false;
        if (pos == -1){
            pos = path.length;
        }
    }

    var svrOrScheme = path.substring(start, pos);
    var hostname;
    var port;
    if (isScheme){//second check
        isScheme = 'http' == svrOrScheme || 'https' == svrOrScheme;
        if (isScheme){//third check it has the host/port part
            start = pos + 1;
            pos = path.indexOf('/', start);
            if (pos == -1){//no host part
                isScheme = false;
            }else{//port part
                hostname = path.substring(start, pos);
                start = pos + 1;
                pos = path.indexOf('/', start);
                if (pos == -1){
                    pos = path.length;
                }
                var sPort = path.substring(start, pos);
                port = parseFloat(sPort);
                if (isNaN(port) || !Number.isInteger(port)){//is server
                    isScheme = false;
                }
            }
        }
    }

    //req: http://www.remotespark.com/a.js, ref: http://127.0.0.1/serverId/
    //We don't know the server id of remotepsark.com in this case
    var sameOrigin = req.hostname == ref.hostname;
    if (!sameOrigin){
        isScheme = true;
        svrOrScheme = req.protocol.substring(0, req.protocol.length - 1);
        hostname = req.hostname;
        port = req.port || (req.protocol == 'https:' ? 443 : 80);
    }

    var newOrigin = ref.origin + PXY_TAG + svrOrScheme;
    if (isScheme){
        newOrigin += '/' + hostname + '/' + port;
    }

    return newOrigin + req.pathname + req.search;
}

self.addEventListener('fetch', e => {
    const resp = doRequest(e).catch(e => new Response(null, {status: 502, statusText: 'Bad Gateway'}));
    e.respondWith(resp);
});

async function doRequest(e){
    var url = e.request.url;
    console.log(url, e);
    var index = url.indexOf(PXY_TAG, 8);
    var from = e.request.referrer;

    if (index != -1){//PROXY URL
        console.log("proxy,", url);
        return  fetch(e.request, {referrer: from});
    }

    //req ulr doens't have proxy info, so get it from referrer
    var clientId = e.clientId;

    //Should be PROXY URL if it's from PROXY page.

    if (!from || from.indexOf(PXY_TAG, 8) == -1){
        if (clientId){
            from = _proxies[clientId];
        }
    }

    if (!from){
        console.log("not proxy,", url);
        return  fetch(e.request);
    }

    index = from.indexOf(PXY_TAG, 8);
    if (index == -1){//probably not a proxy url.
        // from = _proxies[clientId];
        console.log("not proxy from,", from);
        return  fetch(e.request, {referrer: from});
    }

    var pxyUrl = rewriteUrl(url, from); //getProxyUrl(from, index, url);

    console.log("proxy ref,", url, from, pxyUrl, clientId);
    console.log('pxy url:' + pxyUrl);


    if (clientId){
        if (!_proxies[clientId]){
            _proxies[clientId] = from;
            console.log("Set ref url: " + from + " for " + clientId);
        }
        return fetch(pxyUrl, {referrer: from});
    }else{//opened in an new window
        return getRedirResp(pxyUrl);
    }
}

function getRedirResp(url){
    const status = 302;//FOUND
    const statusText = "Found";
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Location': url
    };
    return new Response(null, {status, statusText, headers});
}

function getErrResp(status, statusText){
    return new Response(null, {status, statusText});
}

/**
 * 
 * @param {*} ref referrer URL object
 * @param {*} url requst URL object
 * @param {*} clientId 
 */
function parseReferrer(ref, url, clientId){
    var svr = null;
    if (clientId){
        svr = _proxies[clientId];
        if (svr){
            return svr;
        }
    }




    return svr;
}

/**
 * 
 * @param {*} referrer, the refeere url
 * @param {*} index index of "/PXY/"
 * @param {*} url  the request url 
 * @returns taget can be a server id (/PXY/ServerID/), or full adreee like /PXY/https/host/port/
 */
function getProxyUrl(referrer, index, url, clientId){
    var refURL = new URL(referrer);
    var reqURL = new URL(url);

    if (reqURL.pathname.startsWith('/_pxy_')){//proxy resource
        return url;
    }
    

    var wwwAdr = refURL.origin; 
    if (refURL.hostname != reqURL.hostname){//
        return wwwAdr + PXY_TAG
        + reqURL.protocol.substring(0, reqURL.protocol.length - 1)
        + '/' + reqURL.hostname + '/' + (reqURL.port || (reqURL.protocol = 'https:' ? 443 : 80))
        + reqURL.pathname + reqURL.search;
    }

    var start = index + PXY_TAG.length;
    var pos = referrer.indexOf('/', start);

    if (pos == -1){//must be server id or resource
        pos = referrer.indexOf('?', start);
        if (pos == -1){
            pos = referrer.length;
        }
        return wwwAdr + referrer.substring(index, pos) + reqURL.pathname + reqURL.search;
    }

    var svrOrScheme = referrer.substring(start, pos);
    var isScheme = 'http' == svrOrScheme || 'https' == svrOrScheme;
    if (!isScheme){
        return wwwAdr + PXY_TAG + svrOrScheme  + reqURL.pathname + reqURL.search;
    }

    //double check
    //host part
    start = pos + 1;
    pos = referrer.indexOf('/', start);
    if (pos == -1){//no host
        return wwwAdr + PXY_TAG + svrOrScheme  + reqURL.pathname + reqURL.search;
    }
    //port part
    start = pos + 1;
    pos = referrer.indexOf('/', start);
    if (pos == 1){
        pos = referrer.indexOf('?', start);
        if (pos == -1){
            pos = referrer.length;
        }
    }

    var sPort = referrer.substring(start, pos);
    var f = parseFloat(sPort);
    if (isNaN(f) || !Number.isInteger(f)){//is server
        return wwwAdr + PXY_TAG + svrOrScheme + reqURL.pathname + reqURL.search;
    }

    //really http/https
    return wwwAdr + referrer.substring(index, pos) + reqURL.pathname + reqURL.search;

}


function newResponse(status, statusText, body, headers) {
    if (!status){
        status = 200;
    }

    if (!headers){
        headers = {}
    }
    headers['access-control-allow-origin'] = '*'
    return new Response(body, {status, statusText, headers})
  }
  