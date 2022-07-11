var __svi18n = {
        noauth: 'Sorry, you are not authorized',
        wait: 'Please wait while connecting...',
        errorDecompress: 'Error on decompressing data.',
        logError: 'The logon process failed.',
        remoteApp: {
            warn: 'Warning: This is the parent window of following RemoteApps:',
            close: "Please quit the application from application's File menu."
        },
        info: {
            'closed': 'Connection was closed!',
            'recording': 'You session is recorded and monitored.',
            'menucopy': "Pasting is unavailable via remote computer's Edit menu, but you can use Ctrl+V or browser's Edit menu",
            'restart': 'Please restart gateway.',
            'files': 'My Files',
            'info': 'Information',
            'joinsession': 'Session %1 joined, from %2 %3',//%1 sessionId, %2 hostname, %3 user name
            'exitsession': 'Session %1 exited, from %2 %3',
            'givecontrol': 'You have the control.',
            'nocontrol': "You don't have control any more.",
            'title': '%1 %2 @ %3',//title of request contrl, %1 user name, %2 number ID, %2 host name
            'recontrol': 'Requesting control',
            'touchremoting': 'Touch remoting is enabled',
            'printready': 'Click here to print document to local devices',
            'reconnecting': 'Reconnecting...',
            'copy': 'Use Ctrl+C or browser\'s Edit menu to copy content.<br>For image, use "Copy image" menu or select the image and copy.<br>Use "paste special - Device Independent Bitmap" in Office if you copy image from IE.',
            'copyWarning': 'Please use copy dialog to copy image/content.',
            'reqjoin': 'Requesting joining',
            'recready': 'Recorded file is ready. Please right click and save the link.',
            'sessionPaused': 'You session has been paused by administrator',
            'sessionResumed': 'You session has been resumed',
            'autoresume': 'Be aware that your session is paused. If you click Yes your session will be resumed.',
            'user': 'login as: ',
            'password': 'password: ',
            'copylable': 'Copy',
            'download': 'Download files',
            'fileReady': 'Downloading is ready',
            'imgCopyDownload': 'Please copy image (via context menu) or save it if your application doesn\'t support HTML format',
            'userCopy': 'Failed to copy the followings to local clipboard. Please copy it again via context menu',
            'succeeded': 'Operation succeeded.',
            'digit6': 'It must be a 6 digit number',
            'TwainNotSupported': 'The selected scanner does not supoort TWAIN protocol. Could not use Twain-based DataSource',
            'noUSBConnected': 'Could not find connected USB device',
            'noUSBMapped': 'No USB device was selected to redirect',
            'scardAuth': 'Smart card authentication in progress. Please wait...',
            'newVersion': 'New verson available',
            'updateAgent': 'Please download and install the new gateway agent'
        },
        errorCode: {
            '1': 'The disconnection was initiated by an administrative tool on the server in another session.',
            '2': 'The disconnection was due to a forced logoff initiated by an administrative tool on the server in another session.',
            '3': 'The idle session limit timer on the server has elapsed.',
            '4': 'The active session limit timer on the server has elapsed.',
            '5': 'Another user connected to the server, forcing the disconnection of the current connection.',
            '6': 'The server ran out of available memory resources.',
            '7': 'The server denied the connection.',
            '9': 'The user cannot connect to the server due to insufficient access privileges.',
            'A': 'The server does not accept saved user credentials and requires that the user enter their credentials for each connection.',
            'B': "The disconnection was initiated by an administrative tool on the server running in the user's session.",
            'C': 'The disconnection was initiated by the user logging off his or her session on the server.',
            //Protocol-independent licensing codes:
            '100': 'An internal error has occurred in the Terminal Services licensing component.',
            '101': 'A Terminal Server License Server could not be found to provide a license.',
            '102': 'There are no Client Access Licenses  available for the target remote computer.',
            '103': 'The remote computer received an invalid licensing message from the client.',
            '104': 'The Client Access License stored by the client has been modified.',
            '105': 'The Client Access License stored by the client is in an invalid format',
            '106': 'Network problems have caused the licensing protocol to be terminated.',
            '107': 'The client prematurely ended the licensing protocol.',
            '108': 'A licensing message was incorrectly encrypted.',
            '109': 'The Client Access License stored by the client could not be upgraded or renewed.',
            '10A': 'The remote computer is not licensed to accept remote connections',
            'connection': 'Failed to connect to Gateway!',
            'pwdmatch': 'Passwords don\'t match',
            //error code from server
            'S0': 'New RemoteApp or desktop found. Please refresh your list.',
            'S1': 'License expired.',
            'S2': 'You must log in first.',
            'S3': 'Disconnected by server.',
            'S4': 'Control request was refused',
            'S6': 'Joining request was refused',
            'S7': 'The password is not correct',
            'S8': 'Remote control was denied due to group policy settings',
            'S9': 'The user is already under remote control',//37
            'S10': 'Remote control of the user session has ended.',//302
            'S11': 'Status update of printing: ',
            'S100': 'You password is about to expire. Days left: ',
            'S3000': 'Invalid user.',
            'S3001': 'No access right.',
            'S3002': 'Failed to generate PDF file.',
            'S3003': 'PDF Converter not found.',
            'S3004': 'Unknown host name: ',
            'S3005': 'Error:',
            'S3006': 'Wrong user name or password!',
            'S3007': 'File not found',
            'S3008': 'Failed to play file',
            'S3009': 'Only accept connections from localhost. You can try localhost, 127.0.0.1, host name, or local IP',
            'S3010': 'Session not found or cannot be joined',
            'S3011': 'Maximum number of concurrent users is reached.',
            'S3012': 'User session timeout',
            'S3014': 'Invalid symlink',
            'S3015': 'Wrong symlink password',
            'S3016': 'There is not enough free disk space.',
            'S3017': 'Can not connect to the remote computer: computer is not available or Remote Desktop is not enabled.',
            'S3018': 'File is blocked.',
            'S3019': 'Maximum number of emergency concurrent users is reached.',
            'S3020': 'Maximum number of emergency license days is reached.',
            'S3021': 'Wrong authentication code',
            // browser compability
            'B01': 'The USB redirection is only available in Google Chrome.',
        },
        serverStatus: {
            '401': 'The destination computer is being located.',
            '402': 'The destination computer is being prepared for use.',
            '403': 'The destination computer is being prepared to accept a remote connection.',
            '404': 'The client is being redirected to the destination computer.',
            '501': 'The destination virtual machine image is being loaded.',
            '502': 'The destination virtual machine is being resumed from sleep or hibernation.',
            '503': 'The destination virtual machine is being booted'
        },
        file: {
            'zero': 'File size is 0, ignored ',
            'slice': "FileReader doesn't support slice",
            'uploadDone': 'File uploading finished. Please refresh the shared disk in My Computer.',
            'folder': 'folder',
            '1': 'Invalid directory.',
            '2': 'Not a directory'
        },
        player: {
            'noinput': 'No input found.',
            'fmterror': 'Invalid file format.'
        },
        template: {
            'filecontainer': '<div id="total" class="progressback" style="display: none">\
                            Uploading...<div class="progressfront"></div>\
                        </div>\
                        <div class="th"><button id="__sv_position__">Your Position:</button> <span id="parentPath"></span><input type="file" id="uploadfile" name="upload" multiple /> \
            				<input type="button" id="__cancelUpload" style="visibility:hidden" value="Cancel uploading"><span id="__diskSpace"></span><input id="__sv_folder_name_" placeholder="folder name" ><img id="__sv_folder__" src="' + getLibPath('resource.js') + 'folder.png" align="center" name="folder" title="New folder" ></div>\
                        <table id="filelist" summary="File List">\
                        <thead>\
                            <tr>\
                            <th scope="col">Name</th>\
                            <th scope="col">Type</th>\
                            <th scope="col">Size</th>\
                            <th scope="col">Date modified</th>\
                            <th scope="col">Action</th>\
                            </tr>\
                        </thead>\
                        <tbody>\
                            <tr>\
                                <td></td>\
                                <td></td>\
                                <td align="right"></td>\
                                <td></td>\
                                <td><img id="__sv_download__" src="' + getLibPath('resource.js') + 'download.png" title="Download" name="download"><img id="__sv_view__" src="' + getLibPath('resource.js') + 'view.png" name="view" title="View"><img id="__sv_del__" src="' + getLibPath('resource.js') + 'del.png" name="delete" title="Delete"></td>\
                            </tr>\
                        </tbody>\
                        </table>',
            'login': 'Enter your credentials:<br>\
                <form id= "frmLogin">\
                <input type="text" placeholder="User name" id="loginUser"/><br>\
                <input type="password" placeholder="Password" id="loginPassword" autocomplete="off"/><br>\
                <input type="text" placeholder="Domain" id="loginDomain"/>\
                <input type="submit" value="Submit" id="loginConnect"/>\
                </form>',
            'loaded': false,
            'init': function() {
                var fc = document.getElementById('filecontainer');
                var tp = __svi18n.template;
                if (fc) {
                    fc.innerHTML = tp.filecontainer;
//                    console.log('file container template loaded.');
                }else {
                    if (tp.loaded) return;
                    window.addEventListener('DOMContentLoaded', tp.init, false);
                }
                tp.loaded = true;
            }
        },
        vnc:{
            notvnc: 'Invalid RFB server',
            securityError: 'Security type is not supported',
            authError: 'Failed to authenticate'
        }
};
__svi18n.template.init();
//console.log('strings-en loaded');