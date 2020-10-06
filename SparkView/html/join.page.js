function initUI(){
    var args = hi5.tool.queryToObj();
    var gw = hi5.$('gateway'); 
    var h = gw.value;
    if (!h){
        h = args.gateway;//gateway value in the url
        if (!h){
            h = window.location.host;
            if (!h) h = 'localhost';
        }
        gw.value = h;
    }

    var control = hi5.$('requestControl');
    if (control){
        control.onclick = function(e){
            svManager.getInstance().requestControl();
        };
    }

    if (args.name){
    	hi5.$('joinas').value = args.name;
    }

    var elm = hi5.$('sessionId');
    if (location.search.length > 1){
        elm.value = args.id;
        join(location.search);
        return;
    }
    elm.focus();


}
window.addEventListener('load', initUI, false);
function join(query) {
    var gateway = (('https:' == location.protocol) ?  'wss://' : 'ws://') + hi5.$('gateway').value;
    var ws = gateway + '/JOIN';
    if (query){
    	ws += query;
    }else{
    	//you can transfer any other parameter here
    	ws += '?id=' + hi5.$('sessionId').value + '&name=' + hi5.$('joinas').value;
    }
    if (hi5.appcfg){
        hi5.appcfg.hideLogin = false;
    }
    var r = new svGlobal.Rdp(ws);
    
    var inputArea = hi5.$('inputArea');

    inputArea.style.display = 'none';
    r.addSurface(new svGlobal.LocalInterface());
    r.onclose = function(){
        r.hide();
        inputArea.style.display = 'block';
    };
    r.run();
    return false;
}

