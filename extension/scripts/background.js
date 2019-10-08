const WSClient = require('rpc-websockets').Client;
var opt;
var tport
var state = {
	rpcConnected: false,
	rpcStarted: false
}
var myid = chrome.i18n.getMessage("@@extension_id");
var myTabId;

function openTab(filename) {
	chrome.windows.getCurrent(function (win) {
		chrome.tabs.query({ 'windowId': win.id }, function (tabArray) {
			for (var i in tabArray) {
				if (tabArray[i].url == "chrome-extension://" + myid + "/" + filename) { // console.log("already opened");
					myTabId = tabArray[i].id;
					chrome.tabs.update(tabArray[i].id, { active: true });
					return;
				}
			} chrome.tabs.create({ url: chrome.extension.getURL(filename) });
		});
	});
}

function isNewTab(tab, url) {
	return (
		typeof url === 'undefined' && tab.active && tab.url === 'chrome://newtab/'
	)
}

function stopRPCServer() {
	console.log("sending pong to native app")
	tport.postMessage({ text: "pong" })
	state.rpcStarted = false;
}

function startRPCServer() {
	tport = chrome.runtime.connectNative('optract');
	tport.onMessage.addListener(function (msgs) {
		console.log(msgs);
	})
	tport.postMessage({ text: "ping" })
	state.rpcStarted = true;
}

chrome.browserAction.onClicked.addListener(function (activeTab, url) {
	if (isNewTab(activeTab, url)) {
		openTab("index.html");
	} else {
		try {
			if (!state.rpcStarted) {
				startRPCServer();
			}
			opt = new WSClient('ws://127.0.0.1:59437', { max_reconnects: 10 });
			opt.on('open', function (event) {
				console.log(`!!!!!!!!!!!!!!! CONNECTED`);
			});

			opt.on('close', function (event) {
				stopRPCServer()
				console.log(`!!!!!!!!!!!!!!! Connection Closed`);
			});

		} catch (err) {
			console.error(err);
		}
	}

});

chrome.runtime.onConnect.addListener(function (port) {
	port.onMessage.addListener(function (msg) {
		// Need to put nativeApp.py under dist directory, and update the optract.json under ~/.config/google-chrome/NativeMessagingHosts 
		// to use nativeApp.py
		if (!state.rpcStarted) {
			startRPCServer();
		}
	});

	port.onDisconnect.addListener(function () {
		// tport.disconnect();
		// if (opt) {
		// 	opt.close();
		// } else {
		// 	stopRPCServer();
		// }

	})
});

chrome.windows.onRemoved.addListener(function (windowId) {
	delete lastKnownActives[windowId];
	chrome.windows.getAll(function (wins) {
		console.log("windows number is " + wins.length);
		if (wins.length == 0 && state.rpcStarted == true) {
			console.log("Shutdown optract rpc server.");
			if (opt) {
				opt.close();
			} else {
				stopRPCServer();
			}
		}

	})
});

var parentTabURL;
var lastKnownActives = {};

chrome.tabs.onActivated.addListener(function (activeInfo) {
	chrome.tabs.get(activeInfo.tabId, function (active_tab) {
		try {
			chrome.tabs.get(active_tab.openerTabId, function (parent_tab) {
				parentTabURL = parent_tab.url;
				if (parent_tab.url === "chrome-extension://" + myid + "/index.html") {
					if (typeof(lastKnownActives[active_tab.windowId]) === 'undefined') lastKnownActives[active_tab.windowId] = {};
					lastKnownActives[active_tab.windowId][activeInfo.tabId] = active_tab.url ;
				}
				console.dir({ parentTabURL, windowId: active_tab.windowId, tabId: activeInfo.tabId, url: active_tab.url })
			})
		} catch (err) {
			console.trace(err);
			parentTabURL = undefined;
		}
	})
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	//console.log(`got message from tab! DEBUG...`)
	//console.dir(sender);
	if (message.myParent === "chrome-extension://" + myid + "/index.html") {
		//console.log(`vote requested from content page!`);
		//let highlight = typeof(message.highlight) === 'undefined' ? '' : String(message.highlight);
		console.dir(message);
		console.log(sender.url);
		//chrome.tabs.sendMessage(myTabId, {voteRequest: sender.url, highlight}, function(response) {
		//	console.dir(response.results);
		//})
	} else if ( typeof(lastKnownActives[sender.tab.windowId]) !== 'undefined' 
	         && typeof(lastKnownActives[sender.tab.windowId][sender.tab.id]) !== 'undefined' 
	         && message.landing === true
	) {
		if (sender.url === lastKnownActives[sender.tab.windowId][sender.tab.id]) {
			sendResponse({ yourParent: parentTabURL });
		} else {
			sendResponse({ yourParent: 'orphanized' });
		}
	} else {
		sendResponse({ yourParent: 'Not from Optract' });
	}
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	let windowId = removeInfo.windowId;
	delete lastKnownActives[windowId][tabId];
});
