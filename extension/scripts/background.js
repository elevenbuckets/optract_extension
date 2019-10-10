const WSClient = require('rpc-websockets').Client;
var opt;
var tport
var state = {
	rpcConnected: false,
	rpcStarted: false,
	login: false
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

function isNewTab(tab) {
	return (
		tab.active && tab.url === 'chrome://newtab/'
	)
}

function isOptractTab(tab, url) {
	return ( tab.url === "chrome-extension://" + myid + "/index.html" 
	     || ( typeof lastKnownActives[tab.windowId] !== 'undefined' && typeof lastKnownActives[tab.windowId][tab.id] !== 'undefined' && lastKnownActives[tab.windowId][tab.id] === url)
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

const __ready = (resolve, reject) =>
{
	try {
		opt = new WSClient('ws://127.0.0.1:59437', {reconnect: false, max_reconnects: -1});
		opt.on('error', (error) => { opt.close(); reject(false); });
	} catch(err) {
		opt.close();
		return reject(false);
	}

	opt.on('open', (event) => {
		opt.reconnect = true;
		opt.max_reconnects = 0;
		console.log(`!!!!!!!!!!!!!!! CONNECTED`);
		state.login = true;

		opt.removeAllListeners('error');
		opt.on('error', (error) => { console.log(`Background Script WSClient error...`); console.trace(error); });

		opt.removeAllListeners('close');
		opt.on('close', function (event) {
			state.login = false;
			stopRPCServer()
			console.log(`!!!!!!!!!!!!!!! Connection Closed`);
		});

		resolve(true)
	});
}

chrome.browserAction.onClicked.addListener(function (activeTab) {
	let url = activeTab.url;

	if (isNewTab(activeTab, url) || (!state.rpcStarted)) {
		openTab("index.html");
	} else if (state.rpcStarted === true && state.login === false) {
		new Promise(__ready).catch((err) => { setTimeout(__ready, 5000) })
	} else if(isOptractTab(activeTab, url) === false) {
		// This is where to call opt.call("sendInfluence", [url])
		console.log("influence sent with url : " + activeTab.url);
		//console.dir(activeTab);
		//console.log(`DEBUG: lastKnownActives: `);
		//console.dir(lastKnownActives);
	} else {
		console.log(`DEBUG: last known actives, new tab, or optract... skipped`);
		//console.dir(activeTab);
		//console.log(`DEBUG: lastKnownActives: `);
		//console.dir(lastKnownActives);
	}
});

chrome.runtime.onConnect.addListener(function (port) {
	port.onMessage.addListener(function (msg) {
		// Need to put nativeApp.py under dist directory, and update the optract.json under ~/.config/google-chrome/NativeMessagingHosts 
		// to use nativeApp.py
		if (!state.rpcStarted) {
			startRPCServer();
		}

		new Promise(__ready).catch((err) => { setTimeout(() => { return new Promise(__ready); }, 5000) })
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
				opt.reconnect = false;
				opt.max_reconnects = -1;
				opt.close();
				opt = null;
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
					console.log(`DEBUG: (onActivated) Getting tab opened by Optract UI...`)
					if (typeof (lastKnownActives[active_tab.windowId]) === 'undefined') lastKnownActives[active_tab.windowId] = {};
					lastKnownActives[active_tab.windowId][activeInfo.tabId] = active_tab.url;
				}
				console.dir({ parentTabURL, windowId: active_tab.windowId, tabId: activeInfo.tabId, url: active_tab.url })
			})
		} catch (err) {
			console.trace(err);
			//parentTabURL = undefined;
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
	} else if (typeof (lastKnownActives[sender.tab.windowId]) !== 'undefined'
		&& typeof (lastKnownActives[sender.tab.windowId][sender.tab.id]) !== 'undefined'
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

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
	let windowId = removeInfo.windowId;
	delete lastKnownActives[windowId][tabId];
});
