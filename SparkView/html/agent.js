/**
 * @param r : Rdp object 
 */
function startGatewayAgent(r){
    var downloadRef = document.getElementById('agentRef');

    if (navigator.appVersion.indexOf("Win")!=-1) {
        downloadRef.href="sg_agent.exe";
    } else if (navigator.appVersion.indexOf("Mac")!=-1) {
        downloadRef.href="sg_agent.tbz";
    } else if (navigator.appVersion.indexOf("Linux")!=-1) {
        downloadRef.href="sg_agent.rpm";
    };

    //compatible with old version
    var sgAgentElm = document.getElementById('sgAgentInfo') || document.getElementById('smartCardInfo');
    var btnBridgeElm = document.getElementById('btnBridge');
    if (!sgAgentElm || !btnBridgeElm){
        hi5.notifications.notify("Failed to display spark agent dialog, local hardware redirection will be disabled.");
        r.run();
        return;
    }
    var bridgeURL = 'http://127.0.0.1:8095/bridge.html';
    btnBridgeElm.onclick = function(e) {
        window.__agentBridge = window.open(bridgeURL);
    };

    var isSSL = r.protocol == 'wss';
    if (isSSL) {
        if (hi5.browser.isIE) {
            hi5.notifications.notify("Sorry, local hardware redirection is diabled for Microsoft IE, because it doesn't support cross-domain message.");
            r.run();
            return;
        }
    } else {
        var sslOption = document.getElementById('sgAgentSSLOptional');
        if (sslOption){
            sslOption.style.display = 'none';
        }
    }

    var sgAgentDlg = new hi5.ui.Lightbox(sgAgentElm);
    sgAgentDlg.show();

    var _connected = false;
    sgAgentDlg.onclose = function() {
        if (!isSSL) {
            // Connect to agent directly in case SSL is not needed.
            var ws = new WebSocket("ws://127.0.0.1:8095");
            ws.binaryType = "arraybuffer";
            
            r.onagentmessage = function(data){
                // Received message from the gateway channel and send it to SparkGateway Agent
                if (ws && ws.readyState == ws.OPEN) {
                    ws.send(data);
                } else {
                    console.log('xxxx: ' + ws.readyState);
                }
            };
    
            ws.onopen = function() {
                _connected = true;

                if (r.hasScanner()) {
                    var hs = new Uint8Array(2);
                    hs[0] = 0x04;
                    hs[1] = 0x01;
                    
                    r.onagentmessage(hs);
                }
            };
        
            ws.onmessage = function (e) { 
                // Received data (a byte array) from SparkGateway Agent
                if (r) {
                    r.writeAgent(e.data);
                }
            };
        
            ws.onclose = function () {
                // console.log("Agent closed the connection.");
                if (r) {
                    r.onagentmessage = null;
                }
                if (ws){
                    ws = null;
                    if (!_connected) {
                        hi5.notifications.notify('Failed to connect to the Agent. Plase make sure the Agent is running. Local hardware redirection will be disabled.');
                    } else {
                        hi5.notifications.notify('Agent was disconencted. Plase make sure the Agent is running. Local hardware redirection will be disabled.');
                    }
                }
            };
        
            ws.onerror = function (evt) {
                if (ws) {
                    ws.close();
                }

                if (r.hasScanner() && !r.running()) {
                    r.run();
                }
            };

            if (!r.hasScanner()) {
                // With scanner, rdp should be connected after the user selects the preferred DS
                r.run();
            }
            
        } else {
            if (window.__agentBridge){
                // The bridge.html is opened

                // Received message from the gateway channel and send it to SparkGateway Agent
                r.onagentmessage = function(data) {
                    __agentBridge.postMessage(data, bridgeURL);
                }

                window.addEventListener('message', function(e) {
                    // Received data (a byte array) from SparkGateway Agent
                    if (r) {
                        r.writeAgent(e.data);
                    }
                }, false);

                // Send first message to get scanner list
                if (r.hasScanner()) {
                    var hs = new Uint8Array(2);
                    hs[0] = 0x04;
                    hs[1] = 0x01;
                    
                    __agentBridge.postMessage(hs, bridgeURL);
                } else {
                    r.run();
                }
                
            } else {
                hi5.notifications.notify("New tab for bridge.html is not opened. Local hardware redirection will be disabled.");
                r.run();
            }    
        }
   
        // r.run();
    };
}