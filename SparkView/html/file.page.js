window.onload = function(){


	function connectServer(e) {
		e.preventDefault();
		document.getElementById('server').hide();
		var frms = document.getElementById('frmConn').elements;
		var l = frms.length;
		var s = '';
		var gw = '';
		for (var i = 0; i < l; i++) {
			var field = frms[i];
			if ((field.type == 'radio' || field.type == 'checkbox')
					&& !field.checked)
				continue;
			var v = field.value;
			if (v == '')
				continue;
			var n = field.name;
			if (n == 'gateway') {
				gw = v;
				continue;
			}
			if (s != '')
				s += '&';
			s += (n + '=' + encodeURIComponent(v));
		}

		var protocol = ('https:' == location.protocol) ? 'wss://' : 'ws://';

		document.getElementById('login').style.display = 'none';


		var r = new svGlobal.FileService(protocol + gw + '/FILE?' + s);

		r.onclose = function(expected) {
			r.hide();
			document.getElementById('login').style.display = 'block';
		};
		r.addSurface(new svGlobal.LocalInterface());

		r.onerror = function(e) {
			console.log(e.name + ':' + e.message);
		};

		r.onready = function(){
			var elms = document.getElementsByTagName('grammarly-ghost');
			var len = elms.length;
			if (len){
				hi5.notifications.notify("We recommend to disalbe Grammarly entension")
				for (var i = 0, len = elms.length; i < len; i++){
					elms[i].style.visibility = "hidden";
				}
			}
		};

		r.run();

		return false;
	};

	function initProtocol(protocol){
		var frm = document.getElementById('frmConn');
		var portElm = frm.elements['port'];
		if (portElm){
			switch (protocol){
				case "SMB":
					portElm.value = 445;
					document.getElementById('domainZone').style.display = '';
					document.getElementById('shareZone').style.display = '';
					break;
				case "SFTP":
					portElm.value = 22;
					document.getElementById('domainZone').style.display = 'none';
					document.getElementById('shareZone').style.display = 'none';
					break;
			}
		}
	}

	function initUI() {
		var gw = document.getElementById('gateway');
		var h = gw.value;
		if (!h) {
			h = hi5.tool.queryToObj().gateway;// gateway value in the url
			if (!h && !hi5.browser.isChromeApp) {
				h = window.location.host;
				if (!h)
					h = 'localhost';
			}
	
			gw.value = h || "www.remotespark.com";
		}

		var frm = document.getElementById('frmConn');
	
		frm.onsubmit = connectServer;

		var types = frm.elements['type'];
		var portElm = frm.elements['port'];
		if (portElm){
			for (var i =0, len = types.length; i < len; i++){
				types[i].onchange = function(e){
					if (e.target.checked){
						initProtocol(e.target.value);
					}
				};
				if (types[i].checked){
					initProtocol(types[i].value);
				}
			}
		}
	}
	
	initUI();

}