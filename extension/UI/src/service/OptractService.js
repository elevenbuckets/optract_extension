'use strict';

// import IPFS from 'ipfs';
// import ipfsClient from 'ipfs-http-client';

import DlogsActions from "../action/DlogsActions";
var port = chrome.runtime.connect();
var stat = false;

class OptractService {
    constructor() {
		this.opt
		this.account;
	        this.opround = 0;

		const WSClient = require('rpc-websockets').Client;
		const connectRPC = (mn) => {
		    const __ready = (resolve, reject) => {
		        try {
		    	    this.opt = new WSClient('ws://127.0.0.1:59437', {max_reconnects: mn});
		        } catch(err) {
			    return reject(false);
		        }

			this.opt.on('open', function (event) { 
				console.log(`!!!!!!!!!!!!!!! CONNECTED`); 
				stat = true; 
				DlogsActions.updateState({wsrpc: stat});
				resolve(true) 
			});
			this.opt.on('error', function (error) { reject(false) });
		    }

		    return new Promise(__ready);
		}

		this.shutdown = () => 
	        { 
			this.opt.close(); 
			port.disconnect(); 
		}

	        this.readiness = () => 
	        {
			console.log(`DEBUG: readiness check called ...`);
			this.opt.call('readiness').then((rc) => 
			{
				DlogsActions.updateState({readiness: rc});
			})
		}

	        this.allAccounts = () => 
	        {
			console.log(`DEBUG: OptractService: allAccounts called ...`)
			this.opt.call('allAccounts').then((rc) => {
				   DlogsActions.updateState({allAccounts: rc, accListSize: rc.length});
			})
		}

		this.connect = () => 
		{
			port.postMessage({test: 'wsrpc'});
			console.log(`OptractService connect called`);
			connectRPC(1).then((rc) => {
				console.log(`OptractService connected the first time`);
				if (!rc) throw "wait for socket";
				this.allAccounts();
				this.readiness();
			})
			.catch((err) => {
				connectRPC(0).then((rc) => {
					console.log(`OptractService connected after catch`);
					if (!rc) throw "wait for socket";
					this.allAccounts();
					this.readiness();
				}).catch((err) => { true })
			})

		}

	        this.passCheck = () =>
		{
			this.opt.call('validPass').then((rc) => {
				DlogsActions.updateState({validPass: rc});
			})
		}

	        this.serverCheck = () => {
			let p = [
				this.opt.call('validPass'),
				this.opt.call('userWallet')
			]

			return Promise.all(p).then((rc) => {
				if (!rc[0]) {
					DlogsActions.updateState({validPass: false});
					return false;
				} else {
					DlogsActions.updateState({validPass: true});
				}
				if (typeof(rc[1].OptractMedia) === 'undefined') return false;
				//FIXME: address binded might still don't have password in bcup archive!

				this.account = rc[1].OptractMedia;
				DlogsActions.updateState({account: rc[1].OptractMedia});
				return true;
			})
		}

	        this.unlockTout;

		this.unlockRPC = (pw, account, callback) => {
			console.log(`stat = ${stat}`);
		    const unlockRPCWithRetry = () => {
			   if (stat === false) {
				   DlogsActions.updateState({login: false, logining: false});
				   return;
			   }

			   console.log(`DEBUG: in Optract service unlockRPC:`)
			   let args = account === null ? [pw] : [pw, account];
			   console.dir(args)

			   this.opt.call("password", args).then((rc) => {
					if (rc === false) throw "wrong password"
					this.opt.call("userWallet").then(rc => {
						if (account === null) {
							account = rc.OptractMedia;
						} else if (account !== rc.OptractMedia) {
							DlogsActions.updateState({wsrpc: stat})
							if (callback) callback();
							return;
						}
						console.dir(rc);
						let state = { account, wsrpc: stat };
						this.account = account;
						DlogsActions.updateState(state);
						if (callback) callback();
					})
					.catch((err) => { console.trace(err); 
						clearTimeout(this.unlockTout);
						this.unlockTout = setTimeout(this.unlockRPC, 5000, pw, callback); 
					})
			    })
			    .catch((err) => {
				    console.trace(err);
				    DlogsActions.updateState({login: false, logining: false});
			    })
		    }

		    unlockRPCWithRetry();
		}

		this.getBkRangeArticles = (startB, endB, arCap, parsing, callback) => {
		    console.log(`DEBUG: getBkRangeArticle called`)
		    return this.opt.call('getBkRangeArticles', [startB, endB, arCap, parsing]).then((data) => {
			this.articles = data;
			DlogsActions.updateState({articles: data, articleTotal: Object.keys(data).length});
			if (callback) callback()
		    }).catch((err) => { console.trace(err); })
		}

		this.getNewBkRangeArticles = (startB, endB, parsing, callback) => {
		    console.log(`DEBUG: newBkRangeArticle called`)
		    return this.opt.call('getBkRangeArticles', [startB, endB, parsing]).then((data) => {
			DlogsActions.updateState({articles: data});
			if (callback) callback()
			return {articles: data} 
		    }).catch((err) => { console.trace(err); })

		}

		this.subscribeBlockData = (handler = null) => {
		    console.log("subcribing the blockData Event...");
		    //reset
		    this.opt.off('blockData');
		    this.opt.unsubscribe('blockData');

		    //subscribe
		    this.opt.subscribe('blockData');
		    this.blockDataHandler = handler;
		    this.opt.on('blockData', this.blockDataDispatcher);
		}

	        this.statProbe = () =>
	        {
			this.opt.call('statProbe');
		}

		this.subscribeOpStats = () => {
		    console.log("subcribing the opStats Event...");
		    //reset
		    this.opt.off('opStats');
		    this.opt.unsubscribe('opStats');

		    //subscribe
		    this.opt.subscribe('opStats');

		    const __handle_opstats = (opObj) =>
		    {
			    console.log(`DEBUG: __handle_opstats:`)
			    console.dir(opObj);
			    if ( (opObj.pending.constructor === Object && Object.keys(opObj.pending).length > 0)
			      && typeof(opObj.pending.txhash[this.account]) !== 'undefined'
			    ) {
			    	opObj.pendingSize = opObj.pending.txhash[this.account].length;
			    }
			    DlogsActions.updateState(opObj);
		    }

		    this.opt.on('opStats', __handle_opstats);
		}

		this.subscribeCacheData = () => {
		    console.log("subcribing the cacheData Event...");
		    //reset
		    this.opt.off('cacheData');
		    this.opt.unsubscribe('cacheData');

		    //subscribe
		    this.opt.subscribe('cacheData');

		    const __handle_cacheData = (chObj) =>
		    {
			    console.log(`DEBUG: __handle_cacheData:`)
			    this.chObj = chObj;
			    this.updateCacheList(); 
		    }

		    this.opt.on('cacheData', __handle_cacheData);
		}

	        this.dispatchTout;
	        this.DispatchLock = false;

		this.blockDataDispatcher = (obj) => {
		    if (this.DispatchLock === true) {
			    console.log(`DEBUG: dispatcher service locked...`)
			    return;
		    }

		    clearTimeout(this.dispatchTout);
		    this.DispatchLock = true;

		    console.log(`DEBUG: Dispatcher service called...`)

		    if (typeof(obj) === Object && typeof(obj.blockNo) !== 'undefined') {
			    // new block
			    this.chObj = {};
		    }

		    this.refreshArticles().then((rc) => {
			this.DispatchLock = false;
			if (!rc) {
		    		console.log(`DEBUG: Dispatcher will be called in 4 secs...`)
				this.dispatchTout = setTimeout(this.blockDataDispatcher, 4000, {});
			} else if (rc) {
				console.log(`DEBUG: refresh lock unset`);
			}
		    })
		}

	    this.getNewClaimArticles = (op, parsing, callback) => {
		return this.opt.call('getClaimArticles', [op, parsing]).then((data) => {
		    DlogsActions.updateState({claimArticles: data, claimArticleCounts: Object.keys(data).length});
		    if (callback) callback() 
		    return {claimArticles: data}
		}).catch((err) => { console.trace(err); })
	    }

	    this.reportTout;

	    this.getReports = (callback) => {
		this.opt.call('reports').then((data) => {
		    let reports = { reports: data }
		    DlogsActions.updateState(reports);
		    if (callback) {
			callback()
		    }
		}).catch((err) => { 
			console.trace(err); 
			clearTimeout(this.reportTout);
			this.reportTout = setTimeout(this.opt.call, 5000, 'reports'); 
		})
	    }

	    this.articles = {};
	    this.chObj = {};

	    this.updateCacheList = () => 
	    {
		    if (typeof(this.chObj.aidlist) === 'undefined') return;

		    this.chObj.aidlist = [ ...this.chObj.aidlist ].filter((aid) => { return typeof(this.articles[aid]) === 'undefined' });
		    this.chObj.aidlistSize = this.chObj.aidlist.length;

		    let output = {aidlist: this.chObj.aidlist, aidlistSize: this.chObj.aidlistSize};
		    //console.log(`DEBUG: in updateCacheList:`); console.dir(output);

		    DlogsActions.updateState(output);
	    }

	    this.getMultiBkArticles = (startBk, endBk) =>
	    {
		    let articles = this.articles;
		    let articleTotal = 0;
		    let _articleTotal = 0;

		    for (let i = startBk; i <= endBk; i++) {
			    this.opt.call('getBlockArticles',[i, 10, true]).then((rc) => {
				articles = {...articles, ...rc};
				articleTotal = Object.keys(articles).length;

				if (articleTotal > _articleTotal && Object.keys(rc).length > 0) {
					console.log(`DEBUG: in MultiBlockArticles: block = ${i}`)
					console.dir({articles, articleTotal});
					_articleTotal = articleTotal;
				}

				this.articles = articles;

				DlogsActions.updateState({articles, articleTotal});
			    })
		    }
	    }

	    this.refreshArticles = (callback = null) => {
		return this.opt.call('reports').then((data) => {
		    if (typeof(this.account) !== 'undefined' && data.dbsync) {
			let os = data.optract.synced;
			if (data.optract.synced > 3) {
				os = data.optract.synced - 3;
				if (data.optract.opStart < os) os = data.optract.opStart;
			}

/*
			this.opt.call('getMyVault', [this.account]).then((rc) => {
				let voteAID = Object.keys(rc);
				let voteCounts = voteAID.length;
				DlogsActions.updateState({voteAID, voteCounts});
				console.log(`DEBUG: voteAID and voteCounts updated`);
			})
*/

			if (this.opround > 0 && this.opround !== data.optract.opround) {
				console.log(`DEBUG: new opround started, reset local states ...`);
				this.opround = data.optract.opround;
				DlogsActions.updateState({claimArticles: {}, claimArticleCounts: 0, claimTickets: [], ticketCounts: 0}); // reset
				this.getFinalList(data.optract.opround);
			} else if (this.opround === 0) {
				this.getFinalList(data.optract.opround);
				this.opround = data.optract.opround;
			}

			setTimeout(this.getMultiBkArticles, 0, os, data.optract.synced); 
			//setTimeout(this.getBkRangeArticles, 0, os, data.optract.synced, 15, true);

			if (data.optract.lottery.drawed === true) {
				setTimeout(this.getClaimArticles, 0, data.optract.opround, true); 
				setTimeout(this.getClaimTickets, 0, this.account); 
			}

			return true;
		    } else {
			console.log(`DEBUG: account not set or block not yet synced, wait a bit ...`);
			return false;
		    }
		}).catch((err) => { console.trace(err); return false; })
	    }

	    this.getClaimTickets = (addr) => {
		return this.opt.call('getClaimTickets', [addr]).then((data) => {
		    DlogsActions.ticketWon(data);
		}).catch((err) => { console.trace(err); throw 'redo'; })
	    }

	    this.getClaimArticles = (op, parsing, callback) => {
		return this.opt.call('getClaimArticles', [op, parsing]).then((data) => {
		    console.log(`DEBUG: in OptractService getClaimArticles:`); console.dir(data);
		    DlogsActions.updateState({claimArticles: data, claimArticleCounts: Object.keys(data).length});
		    if (callback) callback()
		    return {claimArticles: data}
		}).catch((err) => { console.trace(err); throw 'redo'; })

	    }
    }

    getFinalList(op) {
	let sop = op > 5 ? op - 5 : 1;
        this.opt.call('getOpRangeFinalList', [sop, op, true]).then((data) => {
	    let list = Object.values(data).reduce((o, i) => {
		    if (Object.keys(i).length === 0) return o;
		    o = { ...o, ...i };
		    return o;
	    }, {});
            DlogsActions.updateState({ finalList: list, finalListCounts: Object.keys(list).length});
        }).catch((err) => { console.trace(err); throw 'redo'; })
    }

    newVote(block, leaf, comment = '') {
        console.log(`Now vote with args: ${block} ${leaf}`);
        return this.opt.call('newVote', { args: [block, leaf, comment] });
    }

    newClaim(v1block, v1leaf, v2block, v2leaf, comment) {
	console.log(`DEBUG: newClaim called:`)
	console.dir({v1block, v1leaf, v2block, v2leaf, comment});
        return this.opt.call('newClaim', {args: [v1block, v1leaf, v2block, v2leaf]});
    }


}

const optractService = new OptractService();

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	console.log(`DEBUG: background message sent to OptractService!!!!!`)
	if (!sender.tab || typeof(message.myParent) === 'undefined') return sendResponse({results: 'Invalid sender'});
	console.log(`Working on it .......`);
	let url = message.voteRequest;
	let comment = typeof(message.highlight) === 'undefined' ? '' : String(message.highlight);
	if (comment) {
		console.log(`DEBUG: vote with quote ..`)
		console.log(comment);
	}

	let aid = Object.keys(optractService.articles).filter((aid) => { return optractService.articles[aid].url === url })[0];
	let article = optractService.articles[aid];
	if (Object.keys(article).length > 0) { 
		console.log(`Optract AID of URL found .......`);
		console.dir(article);
	}

	let l = article.txs.length;
        let i = Math.floor(Math.random() * l);
	DlogsActions.updateState({voted: aid});
	DlogsActions.vote(article.blk[i], article.txs[i], aid, comment);

	return sendResponse({results: article})
})

export default optractService;
