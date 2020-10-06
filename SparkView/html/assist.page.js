window.$id = function (id){
    return document.getElementById(id);
};

function initUI(){
	(function checkBrowser(){
	    if (hi5.browser.isChromeApp) return;
	    
	    var msg = '';
	    try { 
	        document.createElement('canvas').getContext('2d');
	    } catch (e) {
	        msg = 'This browser does not support Canvas.\n\n';
	    };
	    
	    
	    var noWebSocket = !('WebSocket' in window) && !('MozWebSocket' in window);
	    var userAgent = navigator.userAgent;
	    var isFirefox = userAgent.indexOf('Firefox') != -1;
	        
	    if (noWebSocket){
	        msg += "This browser doesn't support WebSocket.\n\n";
	        if (isFirefox){
	            msg += 'Please update to Firefox 6 or later.\n\n';
	        }
	        else if (userAgent.indexOf('Opera') != -1){
	            msg += 'Please open "opera:config#Enable WebSockets" (type it in the link field) make "Enable WebSockets" selected and restart Opera.\n\n';
	        }
	        else if (userAgent.indexOf('MSIE') != -1){
	            msg += 'Please install Google Chrome Frame.\n\n';
	        }
	    }
	    
	    if (msg.length > 0)
	        hi5.notifications.notify(msg);
	    
	})();

    var gw = $id('gateway'); 
    var h = gw.value;
    if (!h){
        h = hi5.tool.queryToObj().gateway;//gateway value in the url
        if (!h && !hi5.browser.isChromeApp){
            h = window.location.host;
            if (!h) h = 'localhost';
        }

        gw.value = h || "www.remotespark.com:8080";
    }

    var touchRow = $id('touchrow'); 
    if (hi5.browser.isTouch && touchRow){
        touchRow.style.display = 'table-row';
    }
    
    (function initDragDrop(){
    	var dropZone = $id('dropZone');
    	var form = $id('frmConn');
        var savedColor = dropZone.style.backgroundColor;
    	
        if (!('FileReader' in window)) {
            return;
        }


        function fileOpen(e) {
        	loadFromFile(e.target.files);
        }

        var elm = hi5.$('rdpfile');
        if (elm) {
            elm.addEventListener('change', fileOpen, false);
        }

        function handleFileSelect(evt) {
            cancelDefault(evt);
            dropZone.style.backgroundColor = savedColor;

            var files = evt.dataTransfer.files; // FileList object.
            loadFromFile(files);
        }

        function handleDragOver(evt) {
            cancelDefault(evt);
            dropZone.style.backgroundColor = 'yellow';
        }

        function handleDragLeave(evt) {
            cancelDefault(evt);
            dropZone.style.backgroundColor = savedColor;
        }

        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('dragleave', handleDragLeave, false);
        dropZone.addEventListener('drop', handleFileSelect, false);

    })();
    
    var info = $id('joinSelect');
    if (info){
        info.onchange = function(e){
            svManager.getInstance().setJoinMode(e.target.value);
        };
    }
    
    var control =$id('requestControl');
    if (control){
        control.onclick = function(e){
            svManager.getInstance().requestControl();
        };
    }
    
    if (hi5.browser.isChromeApp){
        hi5.chromeapp.convertLink(document.querySelectorAll('.hi5_app'));
    }

    //$id('frmConn').onsubmit = remoteAssist;
    
	var chatWin = $id('chatWindow');
	if (chatWin){
		var chat = $id('reqChat');
		if (chat){
			chat.onclick = function(e){
				if (chatWin){
					chatWin.style.display = 'block';
				}
			};
		}
		var btnCloseChat = $id('closeChat');
		if (btnCloseChat){
			btnCloseChat.onclick = function(e){
				chatWin.style.display = 'none';
			};
		}
	}
    
}
    
window.addEventListener('load', initUI, false);

function loadFromFile(files){
    if (files.length != 1) {
        hi5.notifications.notify('Please choose one invitation file only');
        return;
    }

    var f = files[0];
    var name = f.name;
    var index = name.lastIndexOf('.');
    var ext = (index != -1) ? name.substring(index + 1).toLowerCase() : '';
    var isRdp = ext == 'msrcincident' || ext == 'xml';
    if (!isRdp) {
        hi5.notifications.notify({'msg': 'Sorry, Please choose .msrcIncident file only'});
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        var result = e.target.result;
        if (!result) return;
        console.log(result);
        remoteAssist(result);
    };

    reader.readAsText(f);
}

function remoteAssist(xml){

	var gw = $id('gateway').value;
    var protocol = ('https:' == location.protocol) ? 'wss://' : 'ws://';
    
    $id('login').style.display = 'none';
    
    var r = new svGlobal.Rdp(protocol + gw + '/RDP?invitation=' + encodeURIComponent(xml) 
    		+ '&pwd=' + encodeURIComponent($id('password').value) + '&expert=' + $id('expert').value);
    
    r.onclose = function(){
        r.hide();
        $id('login').style.display = 'block';
    };
    
    r.addSurface(new svGlobal.LocalInterface());
    
    r.onerror = function(e){
        console.log(e.name + ':' + e.message);
    };

    r.run();
    return false;
};
