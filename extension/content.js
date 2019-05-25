var port = chrome.runtime.connect();

window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;

  if (event.data.type && (event.data.type == "Connect_WS_RPC")) {
    console.log("Content script received: " + event.data.text);
    port.postMessage(event.data.text);
  }


  if (event.data.type && (event.data.type == "Connect_WS-RPC")) {
    console.log("Content script received: " + event.data.text);
    port.postMessage(JSON.stringify(event.data));
  }
}, false);

port.onMessage.addListener(function(msg) {
    console.log(msg);
    alert(msg);
    window.postMessage({ type: "Connect_WS_RPC_Confirm", text: "Hello from server" }, "*");
});