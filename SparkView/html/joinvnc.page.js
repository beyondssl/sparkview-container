function initUI(){
    var args = hi5.tool.queryToObj();
    var gw = hi5.$("gateway"); 
    var h = gw.value;
    if (!h){
        h = args.gateway;//gateway value in the url
        if (!h){
            h = window.location.host;
            if (!h) h = "localhost";
        }
        gw.value = h;
    }

    var control = hi5.$("requestControl");
    if (control){
        control.onclick = function(e){
            svManager.getInstance().requestControl();
        };
    }

    var elm = hi5.$("sessionId");
    if (args.id){
        elm.value = args.id;
    }
    if (args.id || args.symlink){
        join(location.search.substring(1));
        return;
    }
    elm.focus();


}
window.addEventListener('load', initUI, false);
function join(parameters) {
    var id = hi5.$("sessionId").value;
    var gateway = (("https:" == location.protocol) ?  "wss://" : "ws://") + hi5.$("gateway").value;
    //you can transfer any other parameter here
    var ws = gateway + "/JOIN?";
    ws += parameters ? parameters : "id=" + id + "&name=" + hi5.$("joinas").value;
    var r = new svGlobal.Vnc(ws);
    
    var inputArea = hi5.$("inputArea");

    r.addSurface(new svGlobal.LocalInterface());
    r.onclose = function(){
        r.hide();
        inputArea.style.display = "block";
    };
    r.run();
    inputArea.style.display = "none";
    return false;
}

