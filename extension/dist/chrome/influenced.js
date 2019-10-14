chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
     const [activeTab] = tabs;
     let activeURL = activeTab.url;
     chrome.runtime.sendMessage({influence: activeURL, tabId: activeTab.id}, function(response) {
	     let domain = activeTab.url.split('/')[2];
	     if (response.result === true && !document.getElementById('content').innerText.includes(domain)) {
		     document.getElementById('content').innerHTML = '<h2>' + domain + '</h2>';
		     let myTimer = setTimeout(function() { window.close(); }, 5000)
	     } else {
		     console.log(`DEBUG: error during popup send influence`)
	     }
     })
})
