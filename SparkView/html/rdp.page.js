window.$id = function (id){
    return document.getElementById(id);
};


function initTimezone(){
    var zone = hi5.DateUtils.getGMT();
    var tzSelect = $id('timezone');
    var ops = tzSelect.options;
    h = ops.length;
    for (var i = 0; i < h; i++){
        if (ops[i].text.indexOf(zone) == 0){
            tzSelect.selectedIndex = i;
            break;
        }
    }

    var kbd = $id('frmConn').querySelector('select[name="keyboard"]');
    if (kbd){
        var layout = svGlobal.Rdp.languageToKeyboard.detect();
        if (layout){
            kbd.value = layout;
        }
    }
}

function initUI(){
	window.removeEventListener('load', initUI, false);
    if (hi5.browser.isTouch && $id('touchrow')){
       	$id('touchrow').style.display = 'table-row';
    }
    
    var dz = $id('dropZone');
    var fc = $id('frmConn');
    if (dz && fc){
    	svGlobal.util.initDragDrop(dz, fc);
    }
    useFullBrowser();
    initTimezone();
    initServers();
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
    
    var remotefx = $id('rfxOpt');
    if (remotefx){
        remotefx.onchange = function(e){
            if (e.target.checked){
                $id('colorOpt').selectedIndex = $id('colorOpt').length - 1;//32 bit color
            }
        };
    }
    var sw = $id('sameWindow');
    if (sw){
    	if (hi5.browser.isiOS || hi5.browser.isIE || hi5.browser.isChromeApp){
    		sw.checked = true;
            if (hi5.browser.isChromeApp){
                $id('sameParent').style.visibility = 'hidden';
            }
    	}
    }
    if (hi5.browser.isChromeApp){
        hi5.chromeapp.convertLink(document.querySelectorAll('.hi5_app'));
    }
    $id('frmConn').onsubmit = connectRDP;
    
    var elms = $id('frmConn').elements;
    var domain = elms['domain'];
    if (domain && !domain.value && hi5.appcfg && hi5.appcfg.domain){
        domain.value = hi5.appcfg.domain;
    }
    
    var shareClip = elms['shareClipboard'];
	var mapClip = elms['mapClipboard'];
    if (shareClip && mapClip){
    	mapClip.onchange = shareClip.onchange = function(e){
    		if (e.target.checked){
    			if (e.target == shareClip){
    				mapClip.checked = false;
    				if (elms['fastCopy']){
    					elms['fastCopy'].checked = false;
    				}
    			}else{
    				shareClip.checked = false;
    			}
    		}
    	};
    }
    var _record = elms['audioRecord'];
    if (_record && !hi5.audio.recordable){
    	_record.disabled = true;
    }
    
    var disconnect = $id('disconnect');
    if (disconnect){
    	disconnect.onclick = function(){
    		var r = svManager.getInstance();
    		if (r){
    			r.close();
    		}
    	};
    }
    
    var leaveJoinedOpen = $id('joinOpen');
    if (leaveJoinedOpen){
    	leaveJoinedOpen.onchange = function(e){
    		var r = svManager.getInstance();
    		if (r){
    			r.setJoinCloseMode(e.target.checked ? 1 : 0);
    		}
    	};
    }

    var last = hi5.storage.get('__RDP_LAST');
    if (last){
        Connection.loadToForm($id('frmConn'), last);
        $id('frmConn').elements['pwd'].focus();
    }
    
    var btnNextScr = $id('nextScr');
    if (btnNextScr){
    	btnNextScr.onclick = function(){
    		svGlobal.monitors = svGlobal.monitors || []; 
    		svGlobal.monitors.push(window.open('monitor.html'));
    	};
    }

    var usb = elms['mapUSB'];
    if (usb && !navigator.usb){
        usb.disabled = true;
    }

    var pin = elms['passwordIsPin'];
    var card = elms['smartCard'];
    if (pin && card){
        pin.onchange = function(e){
            if (e.target.checked && !card.checked){
                card.checked = true;
            }
        };
        card.onchange = function(e){
            if (!e.target.checked && pin.checked){
                pin.checked = false;
            }
        };
    }
}
    
window.addEventListener('load', initUI, false);

function initServers(){
    var gw = $id('gateway'); 
    var h = gw.value;
    if (!h){
        gw.value = hi5.browser.getHost() || "www.remotespark.com";
    }

    var server = $id('server');
    
    var save = $id('save');
    var clear = $id('clear');
    var remove = $id('delete');
    
    if (!Connection.hasStorage){
        save.style.visibility='hidden';
        clear.style.visibility='hidden';
        remove.style.visibility='hidden';
        return;
    }
    
    loadServers().onchange = function(){
        var key = server.value;
        Connection.loadToForm($id('frmConn'), key);
    };
    
    save.onclick = function(){
        if (server.value.length < 1){
            hi5.notifications.notify('Please enter computer name.');
            return null;
        }

        Connection.saveForm($id('frmConn'));
        loadServers();
    };

    clear.onclick = function(){
        if (hi5.ui.confirm('All saved data will be removed?')){
            Connection.clear();
            loadServers();
            server.value = '';
        }
    };
    
    remove.onclick = function(){
        var key = $id('server').value;
        if (key.length < 1){
            hi5.notifications.notify('Please select a computer first.');
            return;
        }
        Connection.remove(key);
        loadServers();
        server.value = '';
    };
    
    //syncronize computers with gateway, remove following two lines and serverListCallback if you don't want to do so.
    if (!hi5.browser.isChromeApp){
        var addr = (('https:' == location.protocol) ?  'wss://' : 'ws://') + gw.value + '/LIST';
        getServers(addr, serverListCallback);
    }
}

function loadServers(){
    var svrs = Connection.getAll();
    var srvs = $id('server');
    var ops = $id('server').options;
    ops.length = 0;
    for (var i = 0, l = svrs.length; i < l; i++){
        ops[i] = new Option(svrs[i]);       
    }
    return srvs;    
}

function useFullScreen(){
    $id('width').value = screen.width;
    $id('height').value = screen.height;
};

function useFullBrowser(){
    $id('width').value = 0;
    $id('height').value = 0;
};


function connectRDP(e){
    e.preventDefault();
    $id('server').hide();
    var frms = $id('frmConn').elements;
    var l = frms.length;
    var s = '';
    var gw = '';
    var w = window.innerWidth, h = window.innerHeight, server_bpp = 16;
    for (var i = 0; i < l; i++){
        var field = frms[i];
        if ((field.type=='radio' || field.type=='checkbox') && !field.checked) continue;
        var v = field.value;
        if (v == '')continue;
        var n = field.name;
        if (n == 'gateway'){
            gw = v;
            continue;
        }
        else if (n == 'width'){
            w = v;
        }
        else if (n == 'height'){
            h = v;
        }
        else if (n == 'server_bpp'){
            server_bpp = v;
        }
        
        if (s != '') s += '&';
        s += (n + '=' + encodeURIComponent(v));
    }
    //s += '&smartCard=on';
    // s += '&name=Admin' + '&waWidth=' + window.innerWidth + '&waHeight=' + window.innerHeight;
    // s += '&monitor=-1&monitorDef=' + encodeURIComponent('-1024:0:-1:767,0:0:1079:799');

    // s += '&monitor=1&monitorDef=' + encodeURIComponent('-1920:100:-1:1179,0:0:1079:1919');
    var protocol = ('https:' == location.protocol) ? 'wss://' : 'ws://';

    if (svGlobal.monitors && svGlobal.monitors.length){//multi monitor
    	var r = new svGlobal.Rdp(protocol + gw + '/RDP?' + s, w, h, server_bpp);
		var surface = new svGlobal.LocalInterface();
		r.addSurface(surface);
		
		for (var i = 0, len = svGlobal.monitors.length; i < len; i++){
            if (!svGlobal.monitors[i].svSurface){
                svGlobal.monitors[i].onload();
            }
			r.addSurface(svGlobal.monitors[i].svSurface);
		}
		
		r.onclose = function(expected){
        	console.log('close, expected:' + expected);
            r.hide();
            $id('login').style.display = 'block';
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
        };
        
		r.run();
		
    	return;
    }
    
    var isRemoteApp = $id('app').checked;
    var newWin = $id('sameWindow') ? !$id('sameWindow').checked : true;//open in new window
    
    if (newWin && !isRemoteApp){//forward to rdpdirect.html
        var opr = window.opener;
        if (opr) {
            var usr = null;
            try {
                usr = opr.__sparkUser;
            }catch (e) {

            }
            if (usr) {
                window.__sparkUser = usr;
            }
        }
        
        var paramType = hi5.appcfg.params || 'object';

        if ('url' == paramType){
            window.open('rdpdirect.html?' + s + '&gateway=' + gw);
        }else{
            var params = hi5.tool.queryToObj(s + '&gateway=' + gw);
            if ('object' == paramType){
                window.__sparkUser = {server: params};
            }else{
                hi5.browser.objToCookie(params);
            }
            window.open('rdpdirect.html');
        }
        return false;
    }
    
    if (!newWin){
        $id('login').style.display = 'none';
    }
    
    hi5.storage.set('__RDP_LAST', $id('server').value);
    hi5.storage.commit();
    var frmConn = $id('frmConn');
    var r = svManager.getInstance(); 
    //s += '&name=xxx';
    if (r == null){
        r = new svGlobal.Rdp(protocol + gw + '/RDP?' + s, w, h, server_bpp);
        r.onexistingapp = foundExistingApp;
    }else{
        var apps = r.getRunninApps();
        var len = apps.length;
        var isApp = $id('app').checked;
        var warn = r.isRemoteApp() && (!isApp); 
        if (warn){
            var s = 'Warning: A RemoteApp session is still active.\n\n';
            for (var i = 0; i < len; i++){
                s += apps[i] + '\n';
            }
            s += '\nPlease open a new Window for new sessions.\n';
            hi5.notifications.notify(s);
            return false;
        }
    }
    
    if (newWin){
        function onSurfaceReady(surface){
            r.addSurface(surface);
            console.log('remoteApp: ' + frmConn['exe'].value + ' arg=' + frmConn['args'].value);
            if (r.running())
                r.startApp(frmConn['exe'].value, frmConn['args'].value, '');
        };
        window.svOnSurfaceReady = onSurfaceReady;
        var rail = window.open('rail.html');
        rail.svOnSurfaceReady = onSurfaceReady;
    }else{
        r.onclose = function(expected){
        	console.log('close, expected:' + expected);
            $id('login').style.display = 'block';
            r.hide();
            if (window.__agentBridge){
                __agentBridge.close();
            }
        };
        var sur = new svGlobal.LocalInterface();
        r.addSurface(sur);
        sur.onremoteappicon = function(win, bitmap){
            if (sur.toolbar && win.isMainWin() && bitmap.getWidth() == 32){
                var id = 'win'+ win.id;
                if (sur.toolbar.querySelector('#' + id)){
                    return;
                }
                var img = sur.toolbar.addButton(bitmap.getDataURL(), function(){
                    win.activate(1);
                });
                img.id = id;
                img.title = win.titleInfo;
                img.style.width = '32px';
                img.style.height = '32px';
                img.addEventListener('mouseover', function(){
                    img.title = win.titleInfo;
                }, false);

                setTimeout(function(){
                    win.activate(1);
                }, 333);
            }
            
        };

        sur.onremoteappclose = function(win){
            if (sur.toolbar){
                var id = 'win'+ win.id;
                var img = sur.toolbar.querySelector('#' + id);
                if (img){
                    sur.toolbar.removeChild(img);
                }
            }
        };
    }
    
    r.onerror = function(e){
        console.log(e.name + ':' + e.message);
    };

    r.onready = function(){
        // r.startPing(2, 2);
    };

    r.onnoresponse = function(){
        console.log('no onnoresponse');
    };

    r.run();
    return false;
}


function serverListCallback(hasNew, connected){
    if (!connected){
        hi5.notifications.notify('Failed to connect to gateway for synchronization.');
        return;
    };
    
    if (!hasNew) return;
    loadServers();
    hi5.notifications.notify('Synchronization finished! new computers added to the list.');
}

function getServers(addr, callback) {
	var notConnected = hi5.appcfg && hi5.appcfg.noConnected === true;
    var ts = Connection.getValue(Connection.KEY_TIMESTAMP);
    ts = (!ts) ? '' : ('?since=' + ts);
    if (notConnected){
   		ts += (ts == '') ? '?' : '&';
   		ts += 'noConnected=true';
    }
    
    
    if (hi5.appcfg && (typeof hi5.appcfg.useWSS == 'boolean')) {
        addr = ((hi5.appcfg.useWSS) ? 'wss' : 'ws') + addr.substring(addr.indexOf('://'));
    }

    var ws = new WebSocket(addr + ts);
    var _connected = false;
    var _hasNew = false;
    ws.onmessage = function(e) {
        _connected = true;
        svGlobal.logger.debug(e.data);
        if (notConnected){
        	Connection.clear();
        }
        var rdpServers = JSON.parse(e.data);
        if (rdpServers.lastModified)
            Connection.setValue(Connection.KEY_TIMESTAMP, rdpServers.lastModified + '');
        var conn = rdpServers.connections;
        if (conn) {
            for (var i = 0, l = conn.length; i < l; i++) {
                var c = conn[i];
                if (Connection.getValue(c.id)) continue;
                Connection.save(c.id, connvertServer(c));
                _hasNew = true;
            }
        }
        ws.close();
    };
    ws.onclose = function(e) {
        callback(_hasNew, _connected);
    };
}


var Connection = {
        KEY_IDS: '__CONNS',
        KEY_TIMESTAMP: '__TIMESTAMP',
        hasStorage: hi5.storage.isAvailable,
        getAll: function() {
            var s = hi5.storage.get(this.KEY_IDS);
            if (!s) return new Array(0);
            return s.split(',');
        },

        saveForm: function(frm) {
            var frms = frm.elements;
            var l = frms.length;
            var obj = new Object();
            var svr = null;
            for (var i = 0; i < l; i++) {
                var field = frms[i];
                if ('button' == field.type) continue;
                var n = field.name || field.id;
                var v = field.value;
                if ('server' == n) {
                    svr = v;
                }
                if (field.type == 'checkbox') {
                    v = field.checked;
                }else if (field.type == 'radio') {
                    if (!field.checked) continue;
                }

                if ('width' == n) {
                    v = parseInt(v, 10);
                    if (v == document.documentElement.clientWidth || v == screen.width)
                        continue;
                }
                

                if ('height' == n) {
                    v = parseInt(v, 10);
                    if (v == document.documentElement.clientHeight || v == screen.height)
                        continue;
                }
                

                if ('pwd' == n) {
                    continue;//don't save password
                }

                obj[n] = v;
            }
            return this.save(svr, obj) ? svr : null;
        },

        save: function(key, obj) {
            if (!key) return false;
            hi5.storage.set(key, JSON.stringify(obj));
            var ids = hi5.storage.get(this.KEY_IDS);
            if (!ids) {
                ids = key;
            }
            else {
                if (ids.split(',').indexOf(key) < 0) {
                    ids = ids + ',' + key;
                }
            }
            hi5.storage.set(this.KEY_IDS, ids);
            hi5.storage.commit();
            return true;
        },

        loadToForm: function(frm, key) {
            if (!key) return false;
            var s = hi5.storage.get(key);
            if (!s) return false;
            var obj = JSON.parse(s);
            var frms = frm.elements;
            for (var i = 0, l = frms.length; i < l; i++) {
                var field = frms[i];
                var type = field.type;
                if (('button' == type) || 'submit' == type) continue;
                var n = field.name || field.id;
                var v = obj[n];
                if (typeof v == 'undefined') {
                    if (n == 'gateway') continue;
                    switch (type) {
                    case 'text': field.value = '';break;
                    case 'checkbox': field.checked = false;
                    case 'radio': field.checked = false;
                    }
                    continue;
                }

                if (n == 'startProgram') {
                    if (field.id == 'shell') {
                        field.checked = (v == true || v == 'shell');
                        field.value = 'shell';//for upgrade, the value is boolean in old version
                    }else {
                        field.checked = (v == field.id);
                    }
                    continue;
                }


                if (type == 'checkbox') {
                    field.checked = v;
                }
                else {
                    field.value = v;
                }

            }
            return true;
        },

        clear: function() {
            var all = this.getAll();
            for (var i = 0, len = all.length; i < len; i++){
                hi5.storage.remove(all[i]);
            }
            hi5.storage.remove(this.KEY_IDS);
            hi5.storage.remove('__RDP_LAST');
            hi5.storage.remove(Connection.KEY_TIMESTAMP);
            hi5.storage.commit();
        },

        remove: function(key) {
            hi5.storage.remove(key);
            var all = this.getAll();
            all.removeElm(key);
            hi5.storage.set(this.KEY_IDS, all.join(','));
            hi5.storage.commit();
        },

        getValue: function(key) {
            return this.hasStorage ? hi5.storage.get(key) : null;
        },

        setValue: function(key, value) {
            hi5.storage.set(key, value);
            hi5.storage.commit();
        }
    };


function startExitingApp(id){
    var r = svManager.getInstance();
    function onSurfaceReady(surface){
        r.addSurface(surface);
        r.startExitingApp(id);
    };
    window.svOnSurfaceReady = onSurfaceReady;
    var page = (hi5.appcfg && hi5.appcfg.page && hi5.appcfg.page.rail) ? hi5.appcfg.page.rail : 'rail.html'; 
    var rail = window.open(page);
    rail.svOnSurfaceReady = onSurfaceReady;
    var target = document.getElementById(id);
    var p = target.parentNode;
    p.removeChild(target);
    p = p.parentNode;
    if (p.getElementsByTagName("input").length == 0){
        p.dismiss();//it's a svGlobal.util.lightbox
    }
}

function foundExistingApp(apps){
    var s = "";
    for (var i = 0, l = apps.length; i < l; i++){
        var win = apps[i].win;
        var id = win.id;
        var title = apps[i].title;
        if (!title){
            continue;
        }
        s += '<p><input type="button" id="' + id + '" onclick="startExitingApp(' + id + ')" value="' + title + '"/></p>';
    }
    if (!s) return;
    var div = document.createElement("div");
    div.style.backgroundColor = "white";
    div.style.padding = "2em";
    div.innerHTML = "<h3>Applications are still running in this session:</h3><p>Please open and quite out them from the appplicaiton's File menu</p>" + s;
    document.documentElement.appendChild(div);
    var dlg = hi5.Lightbox(div);
    dlg.show();
}

//Network testing
function NetworkChecker(gateway){
	var total = 0, sentPackages = 0; receivedPackages = 0;
	
	var TESTING_TIMES = 10;
	this.connected = false;
	this.getAverage = function(){
		return total / receivedPackages;
	};
	
	var _me = this;
	
	this.start = function(){
		var ws = new WebSocket(gateway + '/ECHO?');
		_me.connected = false;
		

		function getTestData(_id){
			return {id: _id, time: new Date().getTime(), duration: 0};
		}

		ws.onopen = function(e){
			_me.connected = true;
			ws.send(JSON.stringify(getTestData(1)));
			sentPackages++;
		};

		ws.onmessage = function(e){
			var obj = JSON.parse(e.data);
			var current = new Date().getTime();
			var duration = current - obj.time;
			var id = obj.id;
			console.log('Reply from ' + gateway + ' id: ' + id + ' time=' + duration + 'ms');

			total += duration;
			receivedPackages++;
			if (obj.id < TESTING_TIMES){
				ws.send(JSON.stringify(getTestData(id + 1)));
				sentPackages++;
			}else{
				ws.close();
			}
		};

		ws.onclose = function(e){
			if (receivedPackages > 0){
				console.log('Sent: ' + sentPackages + ' Received: ' + receivedPackages +  ' Average: ' + total / receivedPackages + 'ms');
			}else{
				if (_me.connected){
					console.warn("Connected but no data was received.");
				}else{
					console.error('Connection failed!');
				}
			}
			if (_me.onfinished){
				_me.onfinished();
			}
		};
	};
	
}
