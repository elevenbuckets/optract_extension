chrome.runtime.sendMessage({tokenMissing: 'QOT'}, function(response) {
	document.getElementById('article').innerHTML = "Earn " + response.missing + " more points to unlock this feature.";
})
