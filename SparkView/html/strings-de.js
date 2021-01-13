var __svi18n = {
        noauth: 'Sie haben keine Berechtigung',
        wait: 'Bitte warten Sie - die Verbindung wird aufgebaut',
        errorDecompress: 'Fehler beim entkomprimieren der Daten',
        logError: 'Die Anmeldung ist fehlgeschlagen',
        remoteApp: {
            warn: 'Achtung! Dies ist das Hauptfenster f\u00FCr folgende Remote-Apps:',
            close: 'Bitte beenden Sie die Anwendung \u00FCber das Men\u00FC'
        },
        info: {
            'closed': 'Die Verbindung wurde beendet',
            'recording': 'Ihre Sitzung wird aufgezeichnet und \u00FCberwacht',
            'menucopy': 'Paste sind nicht verf\u00FCgbar in diesem Men\u00FC, versuchen Sie die Tastenkombinationen Strg+V.',
            'restart': 'Bitte starten Sie das Gateway erneut',
            'files': 'Meine Dateien',
            'info': 'Informationen',
            'joinsession': 'Sitzung %1 wurde von %2 %3 betreten',//%1 sessionId, %2 hostname, %3 user name
            'exitsession': 'Sitzung %1 wurde von %2 %3 verlassen',
            'givecontrol': 'Sie haben die Kontrolle',
            'nocontrol': 'Sie haben die Kontrolle abgegeben',
            'title': '%1 %2 @ %3',//title of request contrl, %1 user name, %2 number ID, %2 host name
            'recontrol': 'Kontrolle anfordern',
            'touchremoting': 'Touch Remoting ist aktiviert',
            'printready': 'Your document is ready.',
            'reconnecting': 'Reconnecting...',
            'copy': "Please use Ctrl+C or browser's Edit menu to copy the content:",
            'copyWarning': 'Please use copy dialog to copy image/content.',
            'reqjoin': 'Requesting joining',
            'recready': 'Recorded file is ready. Please right click and save the link.',
            'sessionPaused': 'Ihre Sitzung wurde vom Administrator angehalten',
            'sessionResumed': 'Ihre Sitzung wurde wieder aufgenommen',
            'autoresume': 'Beachten Sie, dass Ihre Sitzung wird unterbrochen. Wenn Sie auf Ja, um Ihre Sitzung wieder aufgenommen werden.',
            'user': 'Anmelden als ',
            'password': 'passwort: ',
            'copylable': 'Kopieren',
            'download': 'Dateien herunterladen',
            'fileReady': 'Der Download ist fertig',
            'imgCopyDownload': 'Please copy image (via context menu) or save it if your application doesn\'t support HTML format',
            'userCopy': 'Failed to copy the followings to local clipboard. Please copy it again via context menu',
            'succeeded': 'Operation erfolgreich.',
            'digit6': 'Es muss eine 6-stellige Nummer sein',
            'TwainNotSupported': 'The selected scanner does not supoort TWAIN protocol. Could not use Twain-based DataSource'
        },
        errorCode: {
            '1': 'Die Verbindungsunterbrechung wurde von einem Administrationstool einer anderen Sitzung auf dem Server ausgel\u00F6st.',
            '2': 'Die Verbindungsunterbrechung wurde von einer erzwungenen Abmeldung durch ein Administrationstool einer anderen Sitzung auf dem Server ausgel\u00F6st.',
            '3': 'Die maximale inaktive Zeit der Sitzung wurde erreicht.',
            '4': 'TDie maximale aktive Zeit der Sitzung wurde erreicht.',
            '5': 'Ein anderer Nutzer hat sich auf den Server verbunden und so die Unterbrechung Ihrer Sitzung verursacht.',
            '6': 'Der maximal verf\u00FCgbare Speicher des Servers wurde erreicht.',
            '7': 'Verbindung zum Server nicht m\u00F6glich.',
            '9': 'Der Benutzer kann sich nicht auf dem Server anmelden, da ihm die entsprechenden Rechte fehlen.',
            'A': 'Der Server akzeptiert die gespeicherten Benutzerdaten nicht. Benutzer m\u00FCssen ihre Daten bei jeder Anmeldung angeben.',
            'B': 'Die Verbindungsunterbrechung wurde durch ein Administrationstool eines Benutzers in einer anderen Sitzung ausgel\u00F6st.',
            'C': 'Die Verbindungsunterbrechung wurde durch die Abmeldung eines Benutzers ausgel\u00F6st.',
            //Protocol-independent licensing codes:
            '100': 'Ein Fehler in der Terminal Service Lizenzierung ist aufgetreten.',
            '101': 'Es konnte kein Server f\u00FCr Terminal Server Lizenzen gefunden werden.',
            '102': 'F\u00FCr den Remote Computer stehen keine Zugangslizenzen zur Verf\u00FCgung.',
            '103': 'Der Remote Computer hat eine ung\u00FCltige Zugangslizenz vom Benutzer erhalten.',
            '104': 'Die Zugangslizenz des Benutzers wurde ver\u00E4ndert.',
            '105': 'Die Zugangslizenz des Benutzers besitzt ein ung\u00FCltiges Format',
            '106': 'Das Lizenzprotokoll wurde aufgrund von Netzwerkproblemen beendet.',
            '107': 'Der Benutzer hat das Lizenzprotokoll vorzeitig beendet.',
            '108': 'Eine Lizenzierungsnachricht wurde falsch verschl\u00FCsselt.',
            '109': 'Die Zugangslizenz des Benutzers konnte nicht erneuert werden.',
            '10A': 'Der Remote Computer hat keine Berechtigung Remoteverbindungen zuzulassen',
            'connection': 'Verbindung fehlgeschlagen',
            'pwdmatch': 'Passwords don\'t match',
            //error code from server
            'S0': 'Eine neue Remote App wurde gefunden. Bitte aktualisieren Sie Ihre Anwendung.',
            'S1': 'Ihre Lizenz ist abgelaufen.',
            'S2': 'Bitte melden Sie sich zuerst an.',
            'S3': 'Verbindung zum Server unterbrochen.',
            'S4': 'Kontrollanfrage wurde abgelehnt.',
            'S6': "Joining request was refused",
            'S7': 'The password is not correct',
            'S8': 'Remtoe control was denied due to group policy settings',
            'S9': 'The user is already under remote control',//37
            'S10': 'Remote control of the user session has ended.',//302
            'S11': 'Statusaktualisierung des Druckens: ',
            'S100': 'Ihr Passwort läuft bald ab. Tage übrig: ',
            'S3000': 'Ung\u00FCltiger Benutzer.',
            'S3001': 'Keine Zugriffsrechte.',
            'S3002': 'Erstellung der PDF-Datei fehlgeschlagen.',
            'S3003': 'Kein PDF-Converter gefunden.',
            'S3004': 'Unbekannter Host: ',
            'S3005': 'Fehler:',
            'S3006': 'Falscher Benutzername oder Passwort!',
            'S3007': 'Datei nicht gefunden',
            'S3008': 'Datei konnte nicht abgespielt werden',
            'S3009': 'Verbindungen werden nur vom Localhost akzeptiert. Verwenden Sie Localhost, 127.0.0.1, Host Name, oder eine lokale IP-Adresse',
            'S3010': 'Sitzung konnte nicht gefunden werden',
            'S3011': 'Die maximale Zahl gleichzeitiger Benutzer wurde erreicht.',
            'S3012': 'Die Sitzung wurde unterbrochen.',
            'S3014': 'Ungültige Symlink',
            'S3015': 'Falsche Symlink Passwort',
            'S3016': 'Es ist nicht genügend freier Festplattenspeicher。',
            'S3017': 'Eine Verbindung zum Server kann nicht hergestellt werden: der Server ist nicht verfügbar oder Remote Desktop ist nicht aktiviert!',
            'S3018': 'Die Datei ist gesperrt.',
            'S3019': 'Die maximale Zahl gleichzeitiger Benutzer wurde erreicht.',
            'S3020': 'Die maximale Zahl gleichzeitiger Benutzer wurde erreicht.',
            'S3021': 'Falscher Authentifizierungscode'
        },
        serverStatus: {
            '401': 'Der Zielrechner wird lokalisiert.',
            '402': 'Der Zielrechner wird vorbereitet.',
            '403': 'Der Zielrechner wird darauf vorbereitet die Remoteverbindung anzunehmen.',
            '404': 'Der Benutzer wird zum Zielrechner geleitet.',
            '501': 'Die virtuelle Maschine wird geladen.',
            '502': 'Die virtuelle Maschine wird reaktiviert.',
            '503': 'Die virtuelle Maschine wird hochgefahren.'
        },
        file: {
            'zero': 'Dateigr\u00F6\u00dfe ist 0',
            'slice': 'Der Dateimanager unterst\u00FCzt keine Datentrennung',
            'uploadDone': 'Dateiupload beendet. Bitte aktualisieren Sie die Dateiablage.',
            'folder': 'Ordner',
            '1': 'Ung\u00FCltiges Verzeichnis',
            '2': 'Kein Verzeichnis'
        },
        player: {
            'noinput': 'Keine Daten gefunden',
            'fmterror': 'Ung\u00FCltiges Dateiformat'
        },
        template: {
            'filecontainer': '<div id="total" class="progressback" style="display: none">\
                        laden...<div class="progressfront"></div>\
                        </div>\
                        <div class="th"><button id="__sv_position__">Ihre Position:</button> <span id="parentPath"></span><input type="file" id="uploadfile" name="upload" multiple />\
            				<input type="button" id="__cancelUpload" style="visibility:hidden" value="Abbrechen Hochladen"><span id="__diskSpace"></span><input id="__sv_folder_name_" placeholder="Ordnernamen" ><img id="__sv_folder__" src="' + getLibPath('resource.js') + 'folder.png" align="center" name="folder" title="neuer Ordner" ></div>\
                        <table id="filelist" summary="Dateiliste">\
                        <thead>\
                            <tr>\
                            <th scope="col">Name</th>\
                            <th scope="col">Typ</th>\
                            <th scope="col">Gr\u00F6\u00dfe</th>\
                            <th scope="col">\u00c4nderungsdatum</th>\
                            <th scope="col">Aktion</th>\
                            </tr>\
                        </thead>\
                        <tbody>\
                            <tr>\
                                <td></td>\
                                <td></td>\
                                <td align="right"></td>\
                                <td></td>\
                                <td><img id="__sv_download__" src="' + getLibPath('resource.js') + 'download.png" title="Herunterladen" name="download"><img id="__sv_view__" src="' + getLibPath('resource.js') + 'view.png" name="view" title="Anschauen""><img id="__sv_del__" src="' + getLibPath('resource.js') + 'del.png" name="delete" title="löschen"></td>\
                            </tr>\
                        </tbody>\
                        </table>',
            'login': 'Bitte geben Sie Ihre Zugangsdaten ein:<br>\
                <form id= "frmLogin">\
                <input type="text" placeholder="Benutzername" id="loginUser"/><br>\
                <input type="password" placeholder="Passwort" id="loginPassword" autocomplete="off"/><br>\
                <input type="text" placeholder="Domain" id="loginDomain"/>\
                <input type="submit" value="einreichen" id="loginConnect"/>\
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
//console.log('strings-de loaded');
