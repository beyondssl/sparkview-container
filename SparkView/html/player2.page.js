var player = null;

function initPlayer(p){
    p.onopened = function(info){
        document.getElementById('playMode').value = 'Normal Mode';
        var fi = document.getElementById('fileInfo');
        fi.innerHTML = 'Size: ' + hi5.tool.bytesToSize(info.size) + ', Video length: ' + (info.length / (1000 * 60)).toFixed(2) + ' minutes';
        document.getElementById('seekbar').style.width = info.width + 'px';
    };
    var seekBar = document.getElementById('seekpos');
    p.onprogress = function(played, total){
        seekBar.style.width = (played / total * 100) + '%'; 
    };
    
    
}
window.addEventListener('load', function(){
    var handler = {};
    handler.addFile = function(f, path){
        if (player){
            player.close();
        }
        var surface = new svGlobal.LocalInterface();
        surface.scaleTo(800, 600);
        player = new svGlobal.Player(surface);
        initPlayer(player);
        player.setSource(f); 
        player.play();
    };
    
    var c = document.getElementById('remotectrl');
    svGlobal.util.initMapDisk(c, handler);
    
    function handleFileSelect(e){
        handler.addFile(e.target.files[0]);
    }
    document.getElementById('rdpv').addEventListener('change', handleFileSelect, false);
    /*document.getElementById('playserver').addEventListener('click', function(){
        broadcast('/temp/test.rdpv');
    }, false);
    */
    document.getElementById('playserver').addEventListener('change', function(){
    		var selvalue = document.getElementById('playserver').value;
    		if(selvalue=="RDP"){
    			broadcast('/rec/test.rdpv',selvalue);
    		}else if(selvalue =="SSH"){
    			broadcast('/rec/test.sshv',selvalue);
    		}else if(selvalue =="TELNET"){
    			broadcast('/rec/test.telnetv',selvalue);
    		}else if(selvalue =="VNC"){
    			broadcast('/rec/test.vncv',selvalue);
    		}
        
    }, false);
    document.getElementById('play').addEventListener('click', function(){
        player.play();
    }, false);
    
    document.getElementById('pause').addEventListener('click', function(){
        player.pause();
    }, false);

    document.getElementById('stop').addEventListener('click', function(){
        player.close();
    }, false);

    document.getElementById('playMode').addEventListener('click', function(){
        setMode();
    }, false);

    var seekbar = document.getElementById('seekbar');
    seekbar.addEventListener('click', function(e){
    	if (player){
        	var target = e.target;
            var pos = hi5.tool.cumulativePos(target);
        	player.seek(Math.floor(((e.pageX - pos.x) / target.clientWidth) * 100));
    	}
    }, false);
    
}, false);

function setMode(){
    var mode = document.getElementById('playMode');
    var scanMode = mode.value == 'Normal Mode'; 
    player.scan(scanMode);
    
    if (scanMode){
        mode.value = 'Scan Mode';
    }else{
        mode.value = 'Normal Mode';
    }
}

function broadcast(file,playtype){
    var protocol = ('https:' == location.protocol) ? 'wss://' : 'ws://';
    var gateway = window.location.host;
    if (gateway.length < 1) gateway = 'localhost';
    var url = protocol + gateway + '/PLAY?f=' + file;
    if (player){
        player.close();
    }
    //file = ""+file;
    if(playtype=="RDP"){
   		player = new Rdp(url);
   	}else if(playtype=="VNC"){
    		player = new svGlobal.Vnc(url);
    }else if(playtype=="SSH"){
    		player = new svGlobal.SSH(url);
    }else{
  		player = new svGlobal.TELNET(url);
  	}
    initPlayer(player);
    var surface = new svGlobal.LocalInterface();
    surface.scaleTo(800, 600);
    player.addSurface(surface);
    player.run();
}

