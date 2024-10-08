
/**
 * @param r : Rdp object 
 */
function startGatewayAgent(r){
    var isSSL = r.protocol == 'wss';

    function startAgent(){
        var downloadRef = document.getElementById('agentSetup');
        downloadRef.href = r.getAgentLink();

        function continueOnError(){
            r.onagentmessage = function(data) {};//let r.run() know it's handled.
            r.run();
        }

        var sgAgentElm = document.getElementById('sgAgentInfo');
        if (!sgAgentElm){
            continueOnError();
            return;
        }

        var legacy = document.getElementById('legacyAgentInfo');
        if (legacy){
            legacy.style.display = 'none';
        }

        function onAgentClose() {
            connectAgent(8095);            
        };


        function showAgentDlg(fnClose){
            var sgAgentDlg = new hi5.ui.Lightbox(sgAgentElm);
            sgAgentDlg.show();
            sgAgentDlg.onclose = fnClose;
            var btnContinue = document.getElementById('btnAgentContinue');
            if (btnContinue){
                btnContinue.onclick = function(){
                    sgAgentDlg.dismiss();
                }
            }
        }

        var url = 'sparkagent';
        var hidden = false;
        if (hi5.appcfg.agent) {
            if (hi5.appcfg.agent.scheme){
                url = hi5.appcfg.agent.scheme;
            }
            hidden = hi5.appcfg.agent.hidden == true;
        }

        url += '://none?hidden=' + hidden;

        if (isSSL){
            url += '&scheme=https';
        }

        hi5.browser.launchApp(url, 
            function(){//success
                svGlobal.logger.info("Agent launched");
                onAgentClose();
            }, 
            function(){//error
                svGlobal.logger.info("Agent may not installed");
                //The agent is slow to start sometimes, so double check here
                setTimeout(
                    function() {
                        checkAgentStatus(
                            function() {
                                showAgentDlg(function(){
                                    hi5.browser.launchApp(url, 
                                        function(){//success
                                            onAgentClose();
                                        }, 
                                        function(){//error
                                            svGlobal.logger.warn("Failed to launch the agent, continue");
                                            continueOnError();
                                        }
                                    );
                                });
                            }
                        );
                    }, 777
                );
            }
        );
    }
 
    function connectAgent(port){
        // Connect to agent directly(HTTP or agent has root a trusted certificate).
        var url = (isSSL ? "wss" : "ws") + "://localhost:" + port;
        var _connected = false;

        var ws = new WebSocket(url);
        ws.binaryType = "arraybuffer";
        
        r.onagentmessage = function(data){
            // Received message from the gateway channel and send it to the agent
            if (ws && ws.readyState == ws.OPEN) {
                ws.send(data);
            } else {
                svGlobal.logger.warn('xxxx: ' + ws.readyState);
            }
        };

        r.onagentclose = function(){
            if (ws && _connected){
                ws.close();
            }
        };

        ws.onopen = function() {
            _connected = true;
            svGlobal.logger.info("connected to the agent on " + this.url);

            if (!r.hasScanner() && !r.running()) {//// With scanner, rdp should be connected after the user selects the preferred DS
                r.run();
            }

            if (r.setAgentStatus){
                r.setAgentStatus(1);
            }

            var versionReq = new Uint8Array(2);
            versionReq[0] = 5;
            versionReq[1] = 1;
            ws.send(versionReq);

            if (r.hasScanner()) {
                var hs = new Uint8Array(2);
                hs[0] = 0x04;
                hs[1] = 0x01;
                
                ws.send(hs);
            }
        };
    
        ws.onmessage = function (e) { 
            // Received data (a byte array) from the Agent
            if (r) {
                r.writeAgent(e.data);
            }
        };
    
        ws.onclose = function () {
            if (r) {
                r.onagentmessage = null;
                if (r.setAgentStatus){
                    r.setAgentStatus(0);
                }
            }
            if (ws){
                ws = null;
                if (!_connected) {
                    if (port >= 8097){//last try (8095-8097)
                        hi5.notifications.notify('Failed to connect to the Agent. Please make sure the Agent is running. Local hardware redirection will be disabled.');
                    }else{
                        svGlobal.logger.info('Failed to connect to the agent on port ' + port);
                        connectAgent(port + 1);
                    }
                } else {
                    hi5.notifications.notify('Agent was disconnected. Please make sure the Agent is running. Local hardware redirection will be disabled.');
                }
            }
        };
    
        ws.onerror = function (evt) {
            svGlobal.logger.warn("Error", evt);
            if (ws) {
                ws.close();
            }

            if (!r.hasScanner() && !r.running()) {//// With scanner, rdp should be connected after the user selects the preferred DS
                r.run();
            }
        };

    }


    function checkAgentStatus(failCallback) {
        svGlobal.logger.info('Checking agent status, ssl:' + isSSL);
        //check if agent is already running
        var host = (isSSL ? "wss" : "ws") + "://localhost";
        var wsAddrs = [host + ":8095", host + ":8096", host + ":8097"];
        hi5.tool.scanAnyGood(wsAddrs, 
            function(url){
                svGlobal.logger.info("agent is already running on " + url);
                var idx = url.lastIndexOf(":") + 1;
                var port = parseInt(url.substring(idx));
                connectAgent(port);
            }, 
            function(){
                svGlobal.logger.info("agent is not running, start..");
                failCallback();
            }
        );
    }

    checkAgentStatus(startAgent);

}
