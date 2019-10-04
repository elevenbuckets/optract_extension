console.log(`content script loaded!`)
chrome.runtime.sendMessage({landing: true}, 
  function(response) {
    console.log(`DEBUG: got response from background`)
    if (response.yourParent.includes('chrome-extension://')) {
    	    console.log(`DEBUG: This is an Optract recommended page!`);

	    // Optract in-page popup CSS
	    var sty = document.createElement("style");
	    var styles = 
		'#OptractPopUp { '
		    + 'display: grid !Important; '
	            + 'font-family: sans !Important; '
	            + 'font-size: 22px !Important; '
		    + 'align-items: center !Important; ' 
		    + 'justify-content: center !Important; ' 
		    + 'width: 320px !Important; height: 330px; '
		    + 'position: absolute; ' 
	            + 'border: 2px solid lightgrey !Important; '
	            + 'box-shadow: 2px 2px 5px black !Important; '
		    + 'top: 15px !Important; '
		    + 'right: -330px; '
	            + 'background-color: white !Important; '
		    + 'z-index: 2147483638 !Important; } '
	      + '#OptractVote { ' 
	            + 'font-size: 22px !Important; '
	            + 'font-family: sans !Important; '
	            + 'background-color: goldenrod !Important; '
	            + 'color: black !Important; '
	            + 'border: 1px solid slategrey !Important; '
	            + 'width: 300px !Important; '
	            + 'height: fit-content !Important; '
	            + 'justify-self: center !Important; '
		    + 'cursor: pointer !Important; }'
	      + '#OptractSelection { ' 
	            + 'font-size: 16px !Important; '
	            + 'margin: 0px !Important; '
	            + 'justify-self: center !Important; '
	            + 'width: 300px !Important; '
	            + 'height: 264px !Important; }';

	    sty.appendChild(document.createTextNode(styles));
            document.body.appendChild(sty);

	    // Optract in-page popup div
	    var div = document.createElement("div");
	    div.setAttribute('id', 'OptractPopUp');

	    // hightlight-to-quote textarea
	    var txt = document.createElement("textarea"); 
	    txt.setAttribute('id', 'OptractSelection');

            div.appendChild(txt);

	    // vote-with-quote button
	    var btn = document.createElement("input");
	    btn.setAttribute('id', 'OptractVote');
	    btn.type = 'button';
	    btn.value = 'Vote with quote';

            div.appendChild(btn);

	    // inject elements in DOM
	    document.body.style.overflowX = 'hidden';
	    document.body.style.position = 'relative';
            document.body.appendChild(div);
	    
	    window.addEventListener('message', function (e) {
		    if (e.source != window) return;
		    if (e.data.type === 'OPTRACT_QUOTE') {
			    let url = window.location.href;
			    console.log(`DEBUG: ContentScript get quote and vote event. URL = ${url}`);
			    console.log(`DEBUG: ${e.data.txt}`);

			    chrome.runtime.sendMessage({myParent: response.yourParent, highlight: e.data.txt, voteRequest: url});
		    }
	    })

	    var actualCode = 
		'var OptractSelectTimer; var voteCasted = false; '
	      + 'function selectionCheck (e) { setTimeout(getSelected, 180) }; '
	      + 'function getSelected () { let txt = window.getSelection().toString(); '
	      +                          ' clearTimeout(OptractSelectTimer); ' 
	      +                          ' let pop = document.getElementById("OptractSelection"); pop.value = txt; '
	      +                          ' let div = document.getElementById("OptractPopUp"); '
	      +                          ' let btn = document.getElementById("OptractVote"); '
	      +                          ' if (txt) { ' 
	      +                          '     if (voteCasted === true) { ' 
              +                          '           btn.disable = true; btn.value = "Already Voted"; '
	      +                          '           pop.style.height = "64px"; '
	      +                          '           txt.display = "none"; '
	      +                          '     } '
	      +                          '     btn.onclick = () => { window.postMessage({type: "OPTRACT_QUOTE", txt}); voteCasted = true; window.getSelection().removeAllRanges(); }; '
	      +                          '     OptractSelectTimer = setTimeout(() => { div.style.position = "fixed"; div.style.right = "10px"; }, 1200); '
	      +                          ' } else { '
	      +                          '     div.style.position = "absolute"; div.style.right = "-330px"; '
	      +                          ' } '
              +                         '} '
	      + 'document.addEventListener("selectionchange", selectionCheck); ';
	    var script = document.createElement('script');
            script.textContent = actualCode;
            (document.head||document.documentElement).appendChild(script);
            script.remove();

    }    
  }
);
