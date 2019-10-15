var submit;
var select;

chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
     const [activeTab] = tabs;
     let activeURL = activeTab.url;
     let domain = activeTab.url.split('/')[2];
     if (!document.getElementById('content').innerText.includes(domain)) {
	     select = () => {
		     let category = document.getElementById('category').value;
		     if (category === '') {
		     	     document.getElementById('send').disabled = true;
			     return;
		     } 
		     document.getElementById('send').disabled = false;
	     }
	     submit = () => {
		     let category = document.getElementById('category').value;
     		     chrome.runtime.sendMessage({influence: activeURL, tabId: activeTab.id, category}, function(response) {
			     document.getElementById('popform').style.backgroundColor= 'rgb(222,226,230)';
			     document.getElementById('popform').innerHTML = '<h2 style="font-size: 22px; margin: 0px; padding: 10px 0px; color: green; text-shadow: 2px 3px 4px darkgray;">Sent! Thank You!!</h2>';
		             let myTimer = setTimeout(function() { window.close(); }, 2400)
	     	     })
	     }
	     document.getElementById('content').innerHTML = '<h2>' + domain + '</h2>';
	     document.getElementById('article').innerHTML = '<h2>' + activeTab.title + '</h2>';
	     document.getElementById('category').onchange = select.bind(this);
	     document.getElementById('send').onclick = submit.bind(this);
     }
})
