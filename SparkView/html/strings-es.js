var __svi18n = {
        noauth: 'Lo sentimos, no está autorizado',
        wait: 'Por favor espere mientras se conecta...',
        errorDecompress: 'Error al descomprimir los datos.',
        logError: 'El proceso de inicio de sesión ha fallado.',
        remoteApp: {
            warn: 'Warning: Esta es la ventana principal de la siguientes aplicaciones remotas:',
            close: "Por favor, salga de la aplicación desde la opción Salir."
        },
        info: {
            'closed': 'La conexión se ha cerrado.',
            'recording': 'La sesión se está grabando y monitorizando.',
            'menucopy': "La opción Pegar no está disponible a través del menú Editar del equipo remoto, pero puede usar Ctrl+V o el menú Editar del navegador.",
            'restart': 'Por favor, reinicie el gateway.',
            'files': 'Mis archivos',
            'info': 'Información',
            'joinsession': 'La sesión %1 se ha unido, desde %2 %3',
            'exitsession': 'La sesión %1 se ha salido, desde %2 %3',
            'givecontrol': 'Tiene el control.',
            'nocontrol': "Ha dejado de tener el control.",
            'title': '%1 %2 @ %3',
            'recontrol': 'Solicitando el control.',
            'touchremoting': 'Touch remoting está habilitado.',
            'printready': 'El documento está listo.',
            'reconnecting': 'Reconectando...',
			'copy': 'Utilice Ctrl+C o el menú Editar del navegador para copiar el contenido.<br>Para imagenes, utilice "Copiar imagen" o seleccione la imagen y copiela.<br><br>Utilice "Pegado especial - Bitmap independiente del dispositivo" en Office si está copiando una imagen desde IE.',
			'copyWarning': 'Por favor utilice el diálogo copiar para copiar imagen y/o contenido.',
			'reqjoin': 'Solicitando unirse...',
            'recready': 'Archivo grabado está listo. Por favor, haga clic derecho y guardar el enlace.',
            'sessionPaused': 'Su sesión ha sido detenido por el administrador',
            'sessionResumed': 'Su sesión se ha reanudado',
            'autoresume': 'Be aware that your session is paused. If you click Yes your session will be resumed.',
            'user': 'Entrar como: ',
            'password': 'contraseña: ',
            'copylable': 'Dupdo',
            'download': 'Descargar archivos',
            'fileReady': 'La descarga está lista',
            'imgCopyDownload': 'Please copy image (via context menu) or save it if your application doesn\'t support HTML format',
            'userCopy': 'Failed to copy the followings to local clipboard. Please copy it again via context menu',
            'succeeded': 'Operación exitosa.',
            'digit6': 'Debe ser un número de 6 dígitos.',
            'TwainNotSupported': 'The selected scanner does not supoort TWAIN protocol. Could not use Twain-based DataSource'
        },
        errorCode: {
            '1': 'La desconexión fue iniciado por una herramienta administrativa en el servidor en otra sesión.',
            '2': 'La desconexión se debió a un cierre de sesión forzado iniciado por una herramienta de administración en el servidor en otra sesión.',
            '3': 'Se ha excedido el límite de temporizador de espera de la sesión en el servidor.',
            '4': 'Se ha excedido el límite del temporizador de la seión activa en el servidor.',
            '5': 'Otro usuario se ha conectado al sitio, forzando la desconexión de la conexión actual.',
            '6': 'El servidor se ha quedado sin recursos de memoria disponible.',
            '7': 'El servidor rechazó la conexión.',
            '9': 'El usuario no puede conectarse con el servidor debido a que no tiene privilegios de acceso suficientes.',
            'A': 'El servidor no acepta las credenciales de usuario guardados y requiere que el usuario introduzca sus credenciales para cada conexión.',
            'B': "La desconexión fue iniciada por una herramienta administrativa en el servidor que se ejecuta en la sesión del usuario.",
            'C': 'La desconexión fue iniciada por el usuario al cerrar la sesión en el servidor.',
            //Protocol-independent licensing codes:
            '100': 'Se ha producido un error interno en el componente de licencias de Terminal Services.',
            '101': 'No se ha detectado un servidor de licencias de Terminal Server para proporcionar una licencia.',
            '102': 'No hay licencias de acceso de cliente para el equipo remoto de destino.',
            '103': 'El equipo remoto ha recibido un mensaje de concesión de licencias no válida desde el cliente.',
            '104': 'La licencia de acceso de cliente almacenada se ha modificado.',
            '105': 'La licencia de acceso de cliente almacenada no tiene un formato no válido.',
            '106': 'Los problemas de red han hecho que finalice el protocolo de autorización.',
            '107': 'El cliente terminó prematuramente el protocolo de la autorización.',
            '108': 'El mensaje de conesión de licencias no está cifrado correctamente.',
            '109': 'La licencia de acceso de cliente almacenada no se pudo actualizar o renovar.',
            '10A': 'El equipo remoto no tiene licencia para aceptar conexiones remotas.',
            'connection': 'No se pudo conectar al gateway.',
			'pwdmatch': 'Las contraseñas no coinciden.',
            //error code from server
            'S0': 'Nueva aplicación remota o de escritorio encontrada. Por favor, actualice su lista.',
            'S1': 'La license ha caducado.',
            'S2': 'Debe registrarse primero.',
            'S3': 'Desconectado por el servidor.',
            'S4': 'Solicitud de control denegada.',
			'S6': 'Solicitud de unirse denegada.',
            'S7': 'La contraseña no es correcta.',
            'S8': 'El control remoto fue denegado debido a la configuración de directiva de grupo.',
            'S9': 'El usuario ya está bajo control remoto.',//37
            'S10': 'El control remoto de la sesión de usuario ha terminado.',//302
            'S11': 'Actualización de estado de impresión: ',
            'S100': 'Tu contraseña está a punto de caducar. Días restantes: ',
            'S3000': 'Usuario no válido.',
            'S3001': 'No tiene permiso.',
            'S3002': 'Error al generar archivo PDF.',
            'S3003': 'No se ha detectado PDF Converter.',
            'S3004': 'Nombre de host desconocido: ',
            'S3005': 'Error:',
            'S3006': 'El usuario o contraseña no son válidos.',
            'S3007': 'Archivo no encontrado.',
            'S3008': 'No se ha podido reproducir el archivo.',
            'S3009': 'Sólo acepta conexiones desde localhost. Puede probar localhost, 127.0.0.1, nombre de host o IP local.',
            'S3010': 'No se encuentra la sesión o no se pueden unir.',
            'S3011': 'Se alcanzó el número máximo de usuarios simultáneos.',
            'S3012': 'El tiempo de espera de la sesión de usuario ha finalizado.',
            'S3014': 'Symlink no válido.',
            'S3015': 'La contraseña del symlink es errónea.',
			'S3016': 'No hay suficiente espacio libre en disco.',
            'S3017': 'No se puede conectar con el equipo remoto: equipo no está disponible o Escritorio remoto no está habilitado.',
            'S3018': 'El archivo está bloqueado.',
            'S3019': 'Se alcanzÃ³ el nÃºmero mÃ¡ximo de usuarios simultÃ¡neos.',
            'S3020': 'Se alcanzÃ³ el nÃºmero mÃ¡ximo de usuarios simultÃ¡neos.',
            'S3021': 'Código de autenticación incorrecto'
            
        },
        serverStatus: {
            '401': 'El equipo de destino se ha localizado.',
            '402': 'El equipo de destino se está preparando para su uso.',
            '403': 'El equipo de destino está preparado para aceptar una conexión remota.',
            '404': 'El cliente se redirige al equipo de destino.',
            '501': 'La imagen de la máquina virtual de destino se está cargando.',
            '502': 'La máquina virtual de destino se reanuda de suspensión o hibernación.',
            '503': 'La máquina virtual de destino se está iniciando.'
        },
        file: {
            'zero': 'Se ignora el archivo porque su tamaño es 0.',
            'slice': "FileReader no soporta partes.",
            'uploadDone': 'La subida de archivos ha terminado. Por favor, actualice Mis archivos.',
            'folder': 'carpeta',
            '1': 'Carpeta no válida.',
            '2': 'No es una carpeta.'
        },
        player: {
            'noinput': 'No se han encontrado entradas.',
            'fmterror': 'Formato de archivo no válido.'
        },
        template: {
            'filecontainer': '<div id="total" class="progressback" style="display: none">\
                            Actualizando...<div class="progressfront"></div>\
                        </div>\
						<div class="th"><button id="__sv_position__">Carpeta:</button> <span id="parentPath"></span><input type="file" id="uploadfile" name="upload" multiple /> \
            				<input type="button" id="__cancelUpload" style="visibility:hidden" value="Cancel uploading"><span id="__diskSpace"></span><input id="__sv_folder_name_" placeholder="Nombre de la carpeta" ><img id="__sv_folder__" src="' + getLibPath('resource.js') + 'folder.png" align="center" name="folder" title="Carpeta nueva" ></div>\
                        <table id="filelist" summary="File List">\
                        <thead>\
                            <tr>\
                            <th scope="col">Archivo</th>\
                            <th scope="col">Tipo</th>\
                            <th scope="col">Tamaño</th>\
                            <th scope="col">Fecha modificación</th>\
                            <th scope="col">Acción</th>\
                            </tr>\
                        </thead>\
                        <tbody>\
                            <tr>\
                                <td></td>\
                                <td></td>\
                                <td align="right"></td>\
                                <td></td>\
                                <td><img id="__sv_download__" src="' + getLibPath('resource.js') + 'download.png" title="Descargar" name="download"><img id="__sv_view__" src="' + getLibPath('resource.js') + 'view.png" name="view" title="Visualizar"><img id="__sv_del__" src="' + getLibPath('resource.js') + 'del.png" name="delete" title="Eliminar"></td>\
                            </tr>\
                        </tbody>\
                        </table>',
            'login': 'Introduzca sus credenciales:<br>\
                <form id= "frmLogin">\
                <input type="text" placeholder="Usuario" id="loginUser"/><br>\
                <input type="password" placeholder="Contraseña" id="loginPassword" autocomplete="off"/><br>\
                <input type="text" placeholder="Dominio" id="loginDomain"/>\
                <input type="submit" value="Enviar" id="loginConnect"/>\
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
            notvnc: 'El servidor RFB no es válido.',
            securityError: 'El tipo de seguridad no está soportado.',
            authError: 'No se ha podido autenticar.'
        }
};
__svi18n.template.init();
//console.log('connect2site-strings-es loaded');
