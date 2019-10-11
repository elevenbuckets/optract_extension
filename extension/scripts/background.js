const WSClient = require('rpc-websockets').Client;
var opt;
var tport
var state = {
	rpcConnected: false,
	rpcStarted: false,
	optConnected: false,
	activeLogin: false

}
var myid = chrome.i18n.getMessage("@@extension_id");
var myTabId = {};

function openTab(filename) {
	chrome.windows.getCurrent(function (win) {
		chrome.tabs.query({ 'windowId': win.id }, function (tabArray) {
			for (var i in tabArray) {
				if (tabArray[i].url == "moz-extension://" + myid + "/" + filename) { // console.log("already opened");
					myTabId[win.id] =  tabArray[i].id;
					chrome.tabs.update(tabArray[i].id, { active: true });
					console.log(`In Window ${win.id}, Optract tab already opened in ${myTabId[win.id]}`)
					return;
				}
			} 
			chrome.tabs.create({ url: chrome.extension.getURL(filename) }, function(tab) {
				myTabId[win.id] = tab.id;
				console.log(`In Window ${win.id}, Optract tab opened in ${myTabId[win.id]}`)
			});
		});
	});
}

function isNewTab(tab) {
	return (
		tab.active && tab.url === 'about:newtab'
	)
}

function isOptractTab(tab, url) {
	let domain = tab.url.split('/')[2];
	let title  = tab.title;
	return ( tab.url === "moz-extension://" + myid + "/index.html" 
	     || ( typeof lastKnownActives[tab.windowId] !== 'undefined' && typeof lastKnownActives[tab.windowId][tab.id] !== 'undefined' && lastKnownActives[tab.windowId][tab.id] === title + domain)
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
		state.optConnected = true;

		opt.removeAllListeners('error');
		opt.on('error', (error) => { 
			console.log(`Background Script WSClient error...`); 
			console.trace(error); 
			opt.reconnect = false;
			opt.max_reconnects = 0;
			opt.close(); 
		});

		opt.removeAllListeners('close');
		opt.on('close', function (event) {
			state.optConnected = false;
			stopRPCServer();
			console.log(`!!!!!!!!!!!!!!! Connection Closed`);
		});

		resolve(true)
	});
}

const __active = (resolve, reject) =>
{
	if (state.optConnected === false) {
		state.activeLogin = false;
		return reject(false);
	}

	let p = [
		opt.call('validPass'),
		opt.call('userWallet')
	];

	Promise.all(p).then((rc) => {
		if (rc[0] === false) return reject(false);
		if (typeof(rc[1]['OptractMedia']) !== 'undefined') {
			state.activeLogin = true;
			resolve(true);
		}
	})
	.catch((err) => {
		console.log(`DEBUG: background script __active check failed`)
		console.trace(err);
		state.activeLogin = false;
		return reject(false);
	})
}

const sendInfluence = (url) =>
{
	console.log("influence sent with url : " + url);
	return true; // place holder
}

var optTimer;

chrome.browserAction.onClicked.addListener(function (activeTab) {
	let url = activeTab.url;

	if (isNewTab(activeTab, url) || (!state.rpcStarted)) {
		openTab("index.html");
//	} else if (state.rpcStarted === true && state.optConnected === false) {
//		new Promise(__ready).catch((err) => { clearTimeout(optTimer); optTimer = setTimeout(__ready, 5000) })
	} else if(isOptractTab(activeTab, url) === false) {
		if (state.activeLogin === false) {
			new Promise(__active).then((rc) => { if (rc) sendInfluence(url); })
		} else {
			sendInfluence(url);
		}
	} else {
		console.log(`DEBUG: last known actives, new tab, or optract... skipped`);
	}
});

chrome.runtime.onConnect.addListener(function (port) {
	port.onMessage.addListener(function (msg) {
		// Need to put nativeApp.py under dist directory, and update the optract.json under ~/.config/google-chrome/NativeMessagingHosts 
		// to use nativeApp.py
		if (!state.rpcStarted) {
			startRPCServer();
		        new Promise(__ready).catch((err) => { clearTimeout(optTimer); optTimer = setTimeout(() => { return new Promise(__ready); }, 15000) })
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
	try { delete lastKnownActives[windowId]; } catch (err) {}
	try { delete myTabId[windowId]; } catch (err) {}
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
				if (parent_tab.url === "moz-extension://" + myid + "/index.html") {
					console.log(`DEBUG: (onActivated) Getting tab opened by Optract UI...`)
					if (typeof (lastKnownActives[active_tab.windowId]) === 'undefined') lastKnownActives[active_tab.windowId] = {};
					lastKnownActives[active_tab.windowId][activeInfo.tabId] = active_tab.url;
					console.dir({ parentTabURL, windowId: active_tab.windowId, tabId: activeInfo.tabId, url: active_tab.url })
				}
			})
		} catch (err) {
			console.trace(err);
			//parentTabURL = undefined;
		}
	})
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	console.log(`got message from tab! DEBUG...`)
	console.dir(sender);
	if (message.myParent === "moz-extension://" + myid + "/index.html") {
		//console.dir(message);
		//console.log(sender.url);
	} else if (typeof (lastKnownActives[sender.tab.windowId]) !== 'undefined'
		&& typeof (lastKnownActives[sender.tab.windowId][sender.tab.id]) !== 'undefined'
		&& message.landing === true
	) {
		if (sender.tab.openerTabId === myTabId[sender.tab.windowId]) {
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
