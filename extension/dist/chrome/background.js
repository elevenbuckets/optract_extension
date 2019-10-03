function openTab(filename) {
	var myid = chrome.i18n.getMessage("@@extension_id"); chrome.windows.getCurrent(function (win) {
		chrome.tabs.query({ 'windowId': win.id }, function (tabArray) {
			for (var i in tabArray) {
				if (tabArray[i].url == "chrome-extension://" + myid + "/" + filename) { // console.log("already opened");
					chrome.tabs.update(tabArray[i].id, { active: true }); return;
				}
			} chrome.tabs.create({ url: chrome.extension.getURL(filename) });
		});
	});
}

openTab("index.html")

function isNewTab(tab, url) {
	return (
		typeof url === 'undefined' && tab.active && tab.url === 'chrome://newtab/'
	)
}
chrome.browserAction.onClicked.addListener(function (activeTab, url) {
	if (isNewTab(activeTab, url)) {
		openTab("index.html")
	}

});

var tport 
var state ={
	rpcConnected : false,
	rpcStarted: false
}
function stopRPCServer() {
	console.log("sending pong to native app")
	tport.postMessage({ text: "pong" })
}

function startRPCServer() {
	tport = chrome.runtime.connectNative('optract');
	tport.onMessage.addListener(function (msgs) {
		console.log(msgs);
	})
	tport.postMessage({ text: "ping" })
}
chrome.runtime.onConnect.addListener(function (port) {
	port.onMessage.addListener(function (msg) {
		// Need to put nativeApp.py under dist directory, and update the optract.json under ~/.config/google-chrome/NativeMessagingHosts 
		// to use nativeApp.py
		startRPCServer();
	});

	port.onDisconnect.addListener(function () {
		// tport.disconnect();
		stopRPCServer()
	})
});

function connectRPC(){
	
}






// setTimeout(stopRPCServer, 15000)
// setTimeout(startRPCServer, 30000)