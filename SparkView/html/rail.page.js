window.onload = function() {

    var ui = new svGlobal.LocalInterface();

    var info = document.getElementById('joinSelect');
    if (info){
        info.onchange = function(e){
            ui.setJoinMode(e.target.value);
        };
    }

    var control =document.getElementById('requestControl');
    if (control){
        control.onclick = function(e){
            ui.requestControl();
        };
    }

    if (typeof window.svOnSurfaceReady == "function"){
        window.svOnSurfaceReady(ui);
    }else if (window.opener && window.opener.svOnSurfaceReady){
        window.opener.svOnSurfaceReady(ui);
    }else{
        //alert("No parent window");
    }
    
};
