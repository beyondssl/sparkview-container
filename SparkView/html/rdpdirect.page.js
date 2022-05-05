window.$id = function (id){
    return document.getElementById(id);
};

function connectRDP(args, q, token) {
    var r = null
        oldQ = q;

    //get loadbalance token from gateway
    if (hi5.appcfg.loadbalanceTokenName && !token){
        fetch(location.origin + '/CONTROL?target=gateway')
            .then(function(response){
                response.json()
                    .then(function(data){ 
                        connectRDP(args, q, data.appId);
                    })
                    .catch(function(e){
                        console.error(e);
                    })
            })
            .catch(function(e){
                console.error(e)
            });
        return;
    }

    if (!args.keyboard){
        args.keyboard = svGlobal.Rdp.languageToKeyboard.detect() || 1033;
        if (q) {
            q += '&keyboard=' + args.keyboard;
        }
    }

    var kbd = document.querySelector('select[name="keyboard"]');
    if (kbd){
        kbd.value = args.keyboard;
    }

    if (q && q.length){
        var p = (args['useSSL'] == 'true' || 'https:' == location.protocol) ? 'wss://' : 'ws://';
        var w = args['width'] ? parseInt(args['width']) : window.innerWidth;
        var h = args['height'] ? parseInt(args['height']) : window.innerHeight;
        var s = args['server_bpp'] || args['color'];
        var gw = args['gateway'] || hi5.browser.getHost();
        var color = s ? parseInt(s) : 16;
        
        if (token){
            q += '&' + hi5.appcfg.loadbalanceTokenName + '=' + token;
        }
        r = new svGlobal.Rdp(p + gw + '/RDP?' + q, w, h, color);
    }else{
        if (token){
            args[i5.appcfg.loadbalanceTokenName] = token;
        }
        r = new svGlobal.Rdp2(args);
    }
    var surface = new svGlobal.LocalInterface(); 
    var isMultiMon = svGlobal.monitors && svGlobal.monitors.length;

    r.addSurface(surface);

    if (isMultiMon){//add other monitor layouts
        for (var i = 0, len = svGlobal.monitors.length; i < len; i++){
            if (!svGlobal.monitors[i].svSurface){
                svGlobal.monitors[i].onload();
                // svGlobal.monitors[i].svSurface.detectMonitor();
            }
			r.addSurface(svGlobal.monitors[i].svSurface);
		}
    }

    r.onclose = function(expected){
        if (window.__agentBridge){
            __agentBridge.close();
        }
        if (svGlobal.monitors){
            for (var i = 0, len = svGlobal.monitors.length; i < len; i++){
                if (svGlobal.monitors[i]){
                    svGlobal.monitors[i].close();
                }
            }
        }

        if (hi5.appcfg && hi5.appcfg.closeOnDisconn) {
            window.close();
        }
    };

    r.run();
    return false;
}

window.onload = function() {
    
    var info = document.getElementById('joinSelect');
    if (info){
        info.onchange = function(e){
            svManager.getInstance().setJoinMode(e.target.value);
        };
    }

    var control = document.getElementById('requestControl');
    if (control){
        control.onclick = function(e){
            svManager.getInstance().requestControl();
        };
    }
    var q = location.search,
        args = null;
    if (q.length){//arguments from the url
        q = q.substring(1);
        args = hi5.tool.queryToObj(q);
    }else{
        //arguments from the parent window
        args = svGlobal.util.getServerArgs();
    }

    if (args && !args.gateway){
        args.gateway = hi5.browser.getHost();
    }

    if (args.multiMon != 'on'){
        connectRDP(args, q);
    }else{//multiMon
        var elm = document.getElementById('mutiMonitor');
        if (elm){
            elm.style.display = 'block';
            elm = document.getElementById('connectMultiMonitor');
            if (elm){
                elm.onclick = function(){
                    connectRDP(args, q);
                }
            }
            var btnNextScr = document.getElementById('nextScr');
            if (btnNextScr){
                btnNextScr.onclick = function(){
                    svGlobal.monitors = svGlobal.monitors || []; 
                    svGlobal.monitors.push(window.open('monitor.html'));
                };
            }
        }
    }
    
    // if (window.devicePixelRatio < 1 || (window.devicePixelRatio > 1 && window.devicePixelRatio < 2)){
    //     hi5.notifications.notify('Please make sure the zoom level of your browser is 100%');
    // }
    
};

