var __svi18n = {
    noauth: 'Sie sind nicht dazu berechtigt.',
    wait: 'Bitte warten Sie während die Verbindung aufgebaut wird ...',
    errorDecompress: 'Fehler beim Dekomprimieren der Daten.',
    logError: 'Der Anmeldevorgang ist fehlgeschlagen.',
    remoteApp: {
        warn: 'Warnung: Dies ist das übergeordnete Fenster der folgenden RemoteApps:',
        close: 'Bitte beenden Sie die Anwendung über das Datei-Menü der Anwendung.'
    },
    info: {
        'closed': 'Die Verbindung wurde geschlossen!',
        'recording': 'Ihre Sitzung wird aufgezeichnet und überwacht.',
        'menucopy': 'Das Einfügen ist über das Bearbeiten-Menü des Remote-Computers nicht möglich, aber Sie können Strg+V oder das Bearbeiten-Menü des Browsers verwenden.',
        'restart': 'Bitte starten Sie das Gateway neu.',
        'files': 'Meine Dateien',
        'info': 'Informationen',
        'joinsession': 'Sitzung %1 beigetreten, von %2 %3',//%1 sessionId, %2 hostname, %3 user name
        'exitsession': 'Sitzung %1 wurde beendet, von %2 %3',
        'givecontrol': 'Sie haben die Steuerung.',
        'nocontrol': 'Sie haben keine Steuerung mehr.',
        'title': '%1 %2 @ %3',//title of request contrl, %1 user name, %2 number ID, %2 host name
        'recontrol': 'Steuerung anfragen.',
        'touchremoting': 'Touch-Remoting ist aktiviert.',
        'printready': 'Klicken Sie hier, um das Dokument auf lokalen Geräten zu drucken.',
        'reconnecting': 'Die Verbindung wird wiederhergestellt ...',
        'copy': 'Verwenden Sie Strg+C oder das Bearbeiten-Menü des Browsers, um Inhalte zu kopieren.<br>Für Bilder verwenden Sie das Menü „Bild kopieren“ oder markieren Sie das Bild und kopieren Sie es.<br>Verwenden Sie „Einfügen spezial - Geräteunabhängige Bitmap“ in MS Office, wenn Sie ein Bild aus dem IE kopieren.',
        'copyWarning': 'Bitte verwenden Sie den Kopierdialog, um Bilder/Inhalte zu kopieren.',
        'reqjoin': 'Beitritt anfragen.',
        'recready': 'Die aufgezeichnete Datei ist fertig. Bitte klicken Sie mit der rechten Maustaste und speichern Sie den Link.',
        'sessionPaused': 'Ihre Sitzung wurde vom Administrator pausiert.',
        'sessionResumed': 'Ihre Sitzung wurde fortgesetzt.',
        'autoresume': 'Beachten Sie, dass Ihre Sitzung unterbrochen ist. Wenn Sie auf \„Ja\“ klicken, wird Ihre Sitzung fortgesetzt.',
        'user': 'Anmelden als: ',
        'password': 'Passwort: ',
        'copylable': 'Kopieren',
        'download': 'Dateien herunterladen',
        'fileReady': 'Fertig herutergeladen',
        'imgCopyDownload': 'Bitte kopieren Sie das Bild (über das Kontextmenü) oder speichern Sie es, wenn Ihre Anwendung das HTML-Format nicht unterstützt.',
        'userCopy': 'Der Text konnte nicht in die lokale Zwischenablage kopiert werden. Bitte kopieren Sie es erneut über das Kontextmenü.',
        'succeeded': 'Aktion erfolgreich.',
        'digit6': 'Muss eine 6-stellige Zahl sein.',
        'TwainNotSupported': 'Der ausgewählte Scanner unterstützt das TWAIN-Protokoll nicht. TWAIN-basierte Datenquelle konnte nicht verwendet werden.',
        'noUSBConnected': 'Angeschlossenes USB-Gerät konnte nicht gefunden werden.',
        'noUSBMapped': 'Es wurde kein USB-Gerät für den Redirect ausgewählt.',
        'scardAuth': 'Smartcard-Authentifizierung wird durchgeführt. Bitte warten …',
        'newVersion': 'Neue Version verfügbar',
        'updateAgent': 'Bitte laden Sie den neuen Gateway-Agent herunter und installieren Sie ihn.'
    },
    errorCode: {
        '1': 'Die Unterbrechung der Verbindung wurde von einem Verwaltungstool auf dem Server in einer anderen Sitzung eingeleitet.',
        '2': 'Die Unterbrechung der Verbindung war auf eine erzwungene Abmeldung zurückzuführen, die von einem Verwaltungsprogramm auf dem Server in einer anderen Sitzung initiiert wurde.',
        '3': 'Der Timer für die Begrenzung der Leerlaufsitzung auf dem Server ist verstrichen.',
        '4': 'Der Timer für das aktive Sitzungslimit auf dem Server ist abgelaufen.',
        '5': 'Ein anderer Benutzer hat sich mit dem Server verbunden, wodurch die aktuelle Verbindung unterbrochen werden musste.',
        '6': 'Der Server hat keine Speicherressourcen mehr.',
        '7': 'Der Server hat die Verbindung verweigert.',
        '9': 'Der Benutzer kann keine Verbindung zum Server herstellen, da er nicht über ausreichende Zugriffsrechte verfügt.',
        'A': 'Der Server akzeptiert keine gespeicherten Benutzeranmeldedaten und verlangt, dass der Benutzer seine Anmeldedaten für jede Verbindung eingibt.',
        'B': 'Die Unterbrechung der Verbindung wurde von einem Verwaltungstool auf dem Server eingeleitet, das in der Sitzung des Benutzers läuft.',
        'C': 'Die Trennung der Verbindung wurde durch die Abmeldung des Benutzers von seiner Sitzung auf dem Server ausgelöst.',
        //Protocol-independent licensing codes:
        '100': 'In der Lizenzierungskomponente der Terminaldienste ist ein interner Fehler aufgetreten.',
        '101': 'Es konnte kein Terminalserver-Lizenzserver zur Bereitstellung einer Lizenz gefunden werden.',
        '102': 'Es sind keine Client-Zugangslizenzen für den Remote-Computer verfügbar.',
        '103': 'Der Remote-Computer hat eine ungültige Lizenzierungsmeldung vom Client erhalten.',
        '104': 'Die vom Client gespeicherte Client-Zugangslizenz wurde geändert.',
        '105': 'Die vom Client gespeicherte Client-Zugangslizenz hat ein ungültiges Format.',
        '106': 'Netzwerkprobleme haben dazu geführt, dass das Lizenzierungsprotokoll nicht mehr funktioniert.',
        '107': 'Der Client hat das Lizenzierungsprotokoll vorzeitig beendet.',
        '108': 'Eine Lizenzierungsnachricht wurde falsch verschlüsselt.',
        '109': 'Die vom Client gespeicherte Client-Zugangslizenz konnte nicht aktualisiert oder erneuert werden.',
        '10A': 'Der Remote-Computer ist nicht für die Annahme von Remote-Verbindungen lizenziert',
        'connection': 'Verbindung zum Gateway fehlgeschlagen!',
        'pwdmatch': 'Passwörter stimmen nicht überein',
        //error code from server
        'S0': 'Neue RemoteApp oder neuer Desktop gefunden. Bitte aktualisieren Sie Ihre Liste.',
        'S1': 'Die Lizenz ist abgelaufen.',
        'S2': 'Sie müssen sich zuerst anmelden.',
        'S3': 'Die Verbindung wurde vom Server getrennt.',
        'S4': 'Kontrollanfrage wurde abgelehnt.',
        'S6': 'Beitrittsanfrage wurde abgelehnt.',
        'S7': 'Das Passwort ist nicht korrekt.',
        'S8': 'Die Fernsteuerung wurde aufgrund von Gruppenrichtlinieneinstellungen verweigert.',
        'S9': 'Der Benutzer ist bereits unter Fernkontrolle.',//37
        'S10': 'Die Fernsteuerung der Benutzersitzung wurde beendet.',//302
        'S11': 'Statusaktualisierung des Drucks: ',
        'S100': 'Ihr Passwort läuft in Kürze ab. Verbleibende Tage: ',
        'S3000': 'Ungültiger Benutzer.',
        'S3001': 'Kein Zugriffsrecht.',
        'S3002': 'PDF-Datei konnte nicht erzeugt werden.',
        'S3003': 'PDF-Konverter nicht gefunden.',
        'S3004': 'Unbekannter Hostname: ',
        'S3005': 'Fehler:',
        'S3006': 'Falscher Benutzername oder falsches Passwort!',
        'S3007': 'Datei nicht gefunden.',
        'S3008': 'Datei kann nicht abgespielt werden.',
        'S3009': 'Akzeptiert nur Verbindungen von localhost. Sie können localhost, 127.0.0.1, den Hostnamen oder die lokale IP-Adresse nutzen.',
        'S3010': 'Sitzung nicht gefunden oder kann nicht verbunden werden.',
        'S3011': 'Die maximale Anzahl der gleichzeitigen Benutzer ist erreicht.',
        'S3012': 'Zeitüberschreitung der Benutzersitzung.',
        'S3014': 'Ungültiger Symlink.',
        'S3015': 'Falsches Symlink-Passwort.',
        'S3016': 'Es ist nicht genügend freier Speicherplatz vorhanden.',
        'S3017': 'Keine Verbindung zum Remote-Computer möglich: Der Computer ist nicht verfügbar oder Remote Desktop ist nicht aktiviert.',
        'S3018': 'Datei ist gesperrt.',
        'S3019': 'Die maximale Anzahl der gleichzeitigen Notfallbenutzer ist erreicht.',
        'S3020': 'Die maximale Anzahl von Notfalllizenztagen ist erreicht.',
        'S3021': 'Falscher Authentifizierungscode.',
        // browser compability
        'B01': 'Die USB-Redirection ist nur in Google Chrome verfügbar.',
    },
    serverStatus: {
        '401': 'Der Zielcomputer wird lokalisiert.',
        '402': 'Der Zielcomputer wird für den Einsatz vorbereitet.',
        '403': 'Der Zielcomputer wird auf die Annahme einer Fernverbindung vorbereitet.',
        '404': 'Der Client wird an den Zielcomputer weitergeleitet.',
        '501': 'Das Image der virtuellen Maschine des Ziels wird gerade geladen.',
        '502': 'Die virtuellen Maschine des Ziels wird aus dem Ruhezustand oder dem Hibernation-Modus wiederhergestellt.',
        '503': 'Die virtuellen Maschine des Ziels wird gebootet.'
    },
    file: {
        'zero': 'Dateigröße ist 0, wird ignoriert.',
        'slice': 'FileReader unterstützt kein Slice.',
        'uploadDone': 'Hochladen der Datei beendet. Bitte aktualisieren Sie den freigegebenen Datenträger unter „Mein Computer“.',
        'folder': 'Ordner',
        '1': 'Ungültiges Verzeichnis.',
        '2': 'Kein Verzeichnis.'
    },
    player: {
        'noinput': 'Keine Eingabe gefunden.',
        'fmterror': 'Ungültiges Dateiformat.'
    },
    template: {
        'filecontainer': '<div id="total" class="progressback" style="display: none">\
                        Upload …<div class="progressfront"></div>\
                    </div>\
                    <div class="th"><button id="__sv_position__">Ihre Position:</button> <span id="parentPath"></span><input type="file" id="uploadfile" name="upload" multiple /> \
                        <input type="button" id="__cancelUpload" style="visibility:hidden" value="Upload abbrechen"><span id="__diskSpace"></span><input id="__sv_folder_name_" placeholder="Ordnername" ><img id="__sv_folder__" src="' + getLibPath('resource.js') + 'folder.png" align="center" name="folder" title="Neuer Ordner"></div>\
                    <table id="filelist" summary="Datei-Liste">\
                    <thead>\
                        <tr>\
                        <th scope="col">Name</th>\
                        <th scope="col">Typ</th>\
                        <th scope="col">Größe</th>\
                        <th scope="col">Änderungsdatum</th>\
                        <th scope="col">Aktion</th>\
                        </tr>\
                    </thead>\
                    <tbody>\
                        <tr>\
                            <td></td>\
                            <td></td>\
                            <td align="right"></td>\
                            <td></td>\
                            <td><img id="__sv_download__" src="' + getLibPath('resource.js') + 'download.png" title="Download" name="download"><img id="__sv_view__" src="' + getLibPath('resource.js') + 'view.png" name="view" title="Ansicht"><img id="__sv_del__" src="' + getLibPath('resource.js') + 'del.png" name="delete" title="Löschen"></td>\
                        </tr>\
                    </tbody>\
                    </table>',
        'login': 'Geben Sie Ihre Zugangsdaten ein:<br>\
            <form id="frmLogin">\
            <input type="text" placeholder="Benutzername" id="loginUser"/><br>\
            <input type="password" placeholder="Passwort" id="loginPassword" autocomplete="off"/><br>\
            <input type="text" placeholder="Domain" id="loginDomain"/>\
            <input type="submit" value="Login" id="loginConnect"/>\
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
        notvnc: 'Ungültiger RFB-Server.',
        securityError: 'Sicherheitstyp wird nicht unterstützt.',
        authError: 'Authentifizierung fehlgeschlagen.'
    }
};
__svi18n.template.init();
//console.log('strings-en loaded');