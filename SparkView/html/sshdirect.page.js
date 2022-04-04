window.onload = function() {

    var info = document.getElementById('joinSelect');
    if (info){
        info.onchange = function(e){
            svManager.getInstance().setJoinMode(e.target.value);
        };
    }

    var control =document.getElementById('requestControl');
    if (control){
        control.onclick = function(e){
            svManager.getInstance().requestControl();
        };
    }

    //here are three ways to create a Rdp instance:
    var q = location.search;
    var args;
    if (q.length > 0){
        q = q.substring(1);
        args = hi5.tool.queryToObj(q);
    }else{
    	args = svGlobal.util.getServerArgs();
        q = hi5.browser.obj2url(args);
    }
    // q += "&terminalType=xterm&mapClipboard=on";

    var p = (args['useSSL'] == 'true' || 'https:' == location.protocol) ? 'wss://' : 'ws://';
    var w = args['width'] || window.innerWidth;
    var h = args['height'] || window.innerHeight;
    var gw = args['gateway'] || location.host || 'localhost';
    var ssh = new svGlobal.SSH(p + gw + '/SSH?' + q, w, h);
    ssh.addSurface(new svGlobal.LocalInterface());
    ssh.run();

};
