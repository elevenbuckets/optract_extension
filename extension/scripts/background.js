
// const Optract = require('../optractNode.js');

const messageTypesFromContent = {
	Connect_WS_RPC:  "Connect_WS_RPC"
}


const cfgObj = { dappdir: '/home/liang/Liang_Learn/git_hub/OptractP2pCLI/dapps',
dns: 
 { server: [ 'discovery1.datprotocol.com', 'discovery2.datprotocol.com' ] },
dht: 
 { bootstrap: 
	[ 'bootstrap1.datprotocol.com:6881',
	  'bootstrap2.datprotocol.com:6881',
	  'bootstrap3.datprotocol.com:6881',
	  'bootstrap4.datprotocol.com:6881' ] },
port: 45015 }


const optract = new Optract(cfgObj);


chrome.runtime.onConnect.addListener(function (port) {
	port.onMessage.addListener(function (msg) {
		handleMessageFromContent(msg, port);
	});
});


handleMessageFromContent = (msg, port) => {
	try {
		let data = JSON.parse(msg);
		if (data.type == "Connect_WS-RPC") {
			console.log(msg);
			port.postMessage("Response from extension for : " + msg);
		}
	} catch (e) {
		console.log(msg);
		port.postMessage("Response from extension for : " + msg);
	}
}


handleMessageFromNativeApp = msg => {

	try {
		let data = JSON.parse(msg);
		if (data.type === messageTypesFromNativeApp.ENABLE_NAMESPACE) {
			console.log(msg);
			port.postMessage("Response from extension for : " + msg);
		}
	} catch (e) {
		console.log(msg);
		port.postMessage("Response from extension for : " + msg);
	}
}

// msg will be a json object
sendMessageUsingPort = port => msg => {
	port.postMessage(msg);
}

// msg is string
sendNativeMessage = (appName, msg, callback) => {
	chrome.runtime.sendNativeMessage(appName,
		{ text: msg },
		callback);
}