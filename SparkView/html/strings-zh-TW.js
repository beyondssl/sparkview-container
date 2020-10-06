var __svi18n = {
	noauth : '抱歉，您沒有通過身份驗證。',
	wait : '請稍等，連接中。。。。。。',
	errorDecompress : '解壓數據時出錯。',
	logError : '登錄失敗。',
	remoteApp : {
		warn : '警告：這是下列正在運行的程序的父窗口：',
		close : '請使用程序自己的菜單來關閉程序。'
	},
	info : {
		'closed' : '連接被關閉了。',
		'recording' : '提示：您的連接被錄制和監視中。',
		'menucopy' : '貼上只能用鍵盤(Ctrl+V)或者瀏覽器菜單完成',
		'restart' : '請重新啟動Gateway',
		'files' : '我的文件',
		'info' : '信息',
		'joinsession' : '%1加入到當前連接, 來自%2 %3',// %1 sessionId, %2 hostname, %3
												// user name
		'exitsession' : '%1退出當前連接, 來自%2 %3',
		'givecontrol' : '您擁有輸入控制',
		'nocontrol' : '您不在擁有輸入控制',
		'title' : '%1 %2 @ %3',// title of request contrl, %1 user name, %2
								// number ID, %2 host name
		'recontrol' : '請求輸入控制',
		'touchremoting' : '開始觸摸輸入重定向',
		'printready' : '列印檔案已就緒',
		'reconnecting' : '正在嘗試重新連接...',
		'copy' : "請使用Ctrl+C或瀏覽器編輯菜單拷貝内容：",
		'copyWarning' : '請使用複製對話框來複製圖像和内容',
		'reqjoin' : '請求共享連接',
        'recready': '錄製的檔案已經就緒，請使用滑鼠右鍵保存此鏈接。',
		'sessionPaused' : '連接被管理員暫停',
        'sessionResumed': '鏈接暫停結束',
        'autoresume': '請注意你的連接處於暫停狀態，如果點擊同意，暫停就會被終止。',
        'user': '登錄: ',
        'password': '密碼: ',
        'copylable': '拷貝',
        'download': '下載檔案',
        'fileReady': '下載完成',
		'imgCopyDownload': '請複製圖像（通過右鍵菜單）或保存它如果程序不支持HTML格式',
		'userCopy': '複製下列内容失敗，請用右鍵菜單重新複製',
		'succeeded': '操作成功',
		'digit6': '必須是六位數字',
		'TwainNotSupported': '指定的掃描設備不支持TWAIN協議，無法解析TWAIN消息'
	},
	errorCode : {
		'1' : '連接被伺服器端的另一個連接中的管理工具關閉。',
		'2' : '伺服器端的另一個連接中的管理工具將本次連接退出。',
		'3' : '伺服器端的空閑超時已超過。',
		'4' : '已超過伺服器端的連接時限。',
		'5' : '另外一個用戶連接到伺服器，強制中斷了本次連接。',
		'6' : '伺服器內存不夠。',
		'7' : '伺服器拒絕了本次連接。',
		'9' : '因爲權限問題，不能連接到伺服器。',
		'A' : '伺服器要求每次必須輸入身份驗證',
		'B' : '連接被伺服器端本會話中的管理工具關閉',
		'C' : '用戶在伺服器端自行退出',
		// Protocol-independent licensing codes:
		'100' : '終端伺服器内部錯（軟件許可證組件），',
		'101' : '找不到軟件許可伺服器',
		'102' : '沒有客戶端連接軟件許可。',
		'103' : '不合法的客戶端軟件許可消息。',
		'104' : '客戶端保存的軟件許可被修改',
		'105' : '客戶端保存的軟件許可是非法。',
		'106' : '網絡錯導致軟件許可通訊中斷。',
		'107' : '客戶端終端了軟件許可通訊。',
		'108' : '不正確的軟件許可消息加密。',
		'109' : '不能更新或升級客戶端軟件許可。',
		'10A' : '遠程計算機沒有遠程連接許可',
		'connection' : '不能連接到伺服器！',
		'pwdmatch' : '密碼不匹配',
		// error code from server
		'S0' : '發現新的RemoteApp或遠程計算機, 請刷新本地列表',
		'S1' : '軟件授權過期。',
		'S2' : '您必須先登錄。',
		'S3' : '伺服器關閉了本次連接。',
		'S4' : '輸入控制請求被拒絕',
		'S6' : "共享連接請求被拒絕了",
		'S7' : '密碼錯誤',
		'S8' : '遠程控制被禁止使用',
		'S9' : '用戶已經被遠程控制了',// 37
		'S10' : '對該用戶的遠程控制已經結束了',// 302
		'S11' : '打印狀態更新: ',
		'S100' : '您的密碼即將過期，剩餘天數：',
		'S3000' : '不正確的用戶名或密碼。',
		'S3001' : '沒有存取權限。',
		'S3002' : '不能生成PDF文件。',
		'S3003' : '沒有發現PDF轉換程序.',
		'S3004' : '主機名不存在: ',
		'S3005' : '錯誤：',
		'S3006' : '錯誤的用戶名或密碼',
		'S3007' : '文件不存在',
		'S3008' : '播放文件失敗',
		'S3009' : '僅接受來自本地的連接。您可以嘗試：localhost, 127.0.0.1, 主機名, 或本地IP',
		'S3010' : '找不到要加入的連接，或者該連接不可以被共享',
		'S3011' : '伺服器已達到最大連接數限制',
		'S3014' : '失效的鏈接地址',
		'S3015' : '鏈接保護密碼錯誤',
        'S3016': '沒有足夠的空間。',
        'S3017': '無法連接遠程計算機：計算機不可用或者遠程桌面未啓用。',
		'S3018' : '該文件已被禁止。',
        'S3019' : '伺服器已達到最大連接數限制',
		'S3020' : '伺服器已達到最大連接數限制',
		'S3021': 'Wrong authentication code'
	},
	serverStatus : {
		'401' : '發現目標計算機。',
		'402' : '正在准備目標計算機供使用。',
		'403' : '目標計算機翼准備好接受客戶端連接。',
		'404' : '客戶正被重新定位到目標計算機。',
		'501' : '正在裝載目標虛擬機。',
		'502' : '正在喚醒目標虛擬機。',
		'503' : '正在啓動目標虛擬機。'
	},
	file : {
		'zero' : '文件大小爲0，忽略本文件',
		'slice' : 'FileReader不支持片段存取（slice）',
		'uploadDone' : '文件上傳完畢，請在遠程計算機裏刷新您的共享磁盤。',
		'folder' : '資料夾',
		'1' : '不合法的資料夾 名',
		'2' : '不是一個資料夾 '
	},
	player : {
		'noinput' : '找不到要播放的文件',
		'fmterror' : '不合法的文件格式'
	},
	template : {
		'filecontainer' : '<div id="total" class="progressback" style="display: none">\
                        上傳中...<div class="progressfront"></div>\
                        </div>\
                        <div class="th"><button id="__sv_position__">您的位置：</button> <span id="parentPath"></span><input type="file" id="uploadfile" name="upload" multiple />\
							<input type="button" id="__cancelUpload" style="visibility:hidden" value="取消上傳"><span id="__diskSpace"></span><input id="__sv_folder_name_" placeholder="資料夾名" ><img id="__sv_folder__" src="' + getLibPath('resource.js') + 'folder.png" align="center" name="folder" title="新建資料夾" ></div>\
                        <table id="filelist" summary="File List">\
                        <thead>\
                            <tr>\
                            <th scope="col">名稱</th>\
                            <th scope="col">類型</th>\
                            <th scope="col">大小</th>\
                            <th scope="col">修改日期</th>\
                            <th scope="col">動作</th>\
                            </tr>\
                        </thead>\
                        <tbody>\
                            <tr>\
                                <td></td>\
                                <td></td>\
                                <td align="right"></td>\
                                <td></td>\
                                <td><img id="__sv_download__" src="'
				+ getLibPath('resource.js')
				+ 'download.png" title="下載" name="download"><img id="__sv_view__" src="'
				+ getLibPath('resource.js')
				+ 'view.png" name="view" title="打開"><img id="__sv_del__" src="'
				+ getLibPath('resource.js')
				+ 'del.png" name="delete" title="刪除"></td>\
                            </tr>\
                        </tbody>\
                        </table>',
		'login' : 'Enter your credentials:<br>\
                <form id= "frmLogin">\
                <input type="text" placeholder="用戶名" id="loginUser"/><br>\
                <input type="password" placeholder="密碼" id="loginPassword" autocomplete="off"/><br>\
                <input type="text" placeholder="域" id="loginDomain"/>\
                <input type="submit" id="loginConnect"/>\
                </form>',
		'loaded' : false,
		'init' : function() {
			var fc = document.getElementById('filecontainer');
			var tp = __svi18n.template;
			if (fc) {
				fc.innerHTML = tp.filecontainer;
//				console.log('file container template loaded.');
			} else {
				if (tp.loaded)
					return;
				window.addEventListener('DOMContentLoaded', tp.init, false);
			}
			tp.loaded = true;
		}
	},
	vnc : {
		notvnc : '無傚的RFB伺服器',
		securityError : '不支持的安全類型',
		authError : '驗證失敗'
	}

};
__svi18n.template.init();
//console.log('strings-zh-CN loaded');
