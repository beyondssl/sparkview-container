window.$id = function (id){
    return document.getElementById(id);
};

function initUI() {
	var gw = $id('gateway'); 
    var h = gw.value;
    if (!h){
        gw.value = hi5.browser.getHost() || "www.remotespark.com";
    }
	$id("formShadow").onsubmit = getInvitation;
};

function shadow() {
	var invitation = getInvitation();
}

var _connected = false;

function getInvitation(e) {
	e.preventDefault();
	$id('submitShadow').disabled = true;

	var elements = document.getElementById('formShadow').elements;
	var server = elements['server'].value;
	var domain = elements['domain'].value;
	var user = elements['user'].value;
	var pwd = elements['pwd'].value;
	var sessionID = elements['sessionID'].value;
	var control = elements['control'].checked;
	var noConsentPrompt = elements['noConsentPrompt'].checked;
	var gateway = elements['gateway'].value;

	var prameters = 'server=' + server +
				'&domain=' + domain +
				'&user=' + user +
				'&pwd=' + pwd +
				'&sessionID=' + sessionID +
				'&control=' + control +
				'&noConsentPrompt=' + noConsentPrompt;

	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/SHADOW', true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function() { // Call a function when the state changes.
		if (this.readyState === XMLHttpRequest.DONE) {
			if (this.status === 200){
				console.log(this.responseText);
				doShadow(this.responseText, control, server, gateway);
			}else if (this.status == 500 && this.responseText){
				hi5.notifications.notify(this.responseText);
			}else{
				hi5.notifications.notify("Connection failed.");
			}
			$id('submitShadow').disabled = false;
		}
	}
	xhr.send(prameters);

};


function doShadow(invitation, control, server, gateway) {
	console.log("====doShadow() invitation=" + invitation);

	var protocol = (location.protocol == 'https:') ? 'wss://' : 'ws://';
	if (!gateway){
		gateway = location.hostname + ':' + location.port;
	}

	$id('shadowInput').style.display = 'none';

	var r = new svGlobal.Rdp(protocol + gateway + '/RDP?invitation=' + 
		encodeURIComponent(invitation) + '&pwd=&expert=Expert&shadow=true&control=' + control + '&server=' + server);

	r.onclose = function() {
		r.hide();
		$id('shadowInput').style.display = 'block';
	};

	r.addSurface(new svGlobal.LocalInterface());

	r.onerror = function(e){
		console.log(e.name + ':' + e.message);
	};

	r.run();
	return false;
};

window.addEventListener('load', initUI, false);


