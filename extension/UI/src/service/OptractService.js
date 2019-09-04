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

		const WSClient = require('rpc-websockets').Client;
		const connectRPC = (mn) => {
		    this.opt = new WSClient('ws://127.0.0.1:59437', {max_reconnects: mn});
		    const __ready = (resolve, reject) => {
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

		this.shutdown = () => { 
			this.opt.close(); 

			port.disconnect(); 
		}

	        this.allAccounts = () => 
	        {
			console.log(`DEBUG: OptractService: allAccounts called ...`)
			this.opt.call('allAccounts').then((rc) => {
				   DlogsActions.updateState({allAccounts: rc});
			})
		}

		this.connect = () => 
		{
			port.postMessage({test: 'wsrpc'});
			console.log(`OptractService connect called`);
			connectRPC(1).then((rc) => {
				if (!rc) throw "wait for socket";
				this.allAccounts();
			})
			.catch((err) => {
				connectRPC(0).then((rc) => {
					if (!rc) throw "wait for socket";
					this.allAccounts();
				}).catch((err) => { true })
			})

		}

	        this.serverCheck = () => {
			let p = [
				this.opt.call('validPass'),
				this.opt.call('userWallet')
			]

			return Promise.all(p).then((rc) => {
				if (!rc[0]) return false;
				if (typeof(rc[1].OptractMedia) === 'undefined') return false;
				//FIXME: address binded might still don't have password in bcup archive!

				this.account = rc[1].OptractMedia;
				DlogsActions.updateState({account: rc[1].OptractMedia});
				return true;
			})
		}

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
						if (account === null) account = rc.OptractMedia;
						console.dir(rc);
						let state = { account, wsrpc: stat };
						this.account = account;
						DlogsActions.updateState(state);
						if (callback) callback();
					})
					.catch((err) => { console.trace(err); setTimeout(this.unlockRPC, 5000, pw, callback); })
			    })
			    .catch((err) => {
				    console.trace(err);
				    DlogsActions.updateState({login: false, logining: false});
			    })
		    }

		    unlockRPCWithRetry();
		}

		this.getBkRangeArticles = (startB, endB, parsing, callback) => {
		    console.log(`DEBUG: getBkRangeArticle called`)
		    return this.opt.call('getBkRangeArticles', [startB, endB, parsing]).then((data) => {
			DlogsActions.updateState({articles: data, articleTotal: Object.keys(data).length});
			if (callback) callback()
			return {articles: data} 
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

		this.blockDataDispatcher = (obj) => {
		    console.log(`DEBUG: Dispatcher called...`)
		    this.refreshArticles().then((rc) => {
			if (!rc) {
		    		console.log(`DEBUG: Dispatcher will be called in 2 secs...`)
				return setTimeout(this.blockDataDispatcher, 2000, {});
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

	    this.getReports = (callback) => {
		this.opt.call('reports').then((data) => {
		    let reports = { reports: data }
		    DlogsActions.updateState(reports);
		    if (callback) {
			callback()
		    }
		}).catch((err) => { console.trace(err); setTimeout(this.opt.call, 5000, 'reports'); })
	    }

	    this.getMultiBkArticles = (startBk, endBk) =>
	    {
		    let articles = {};
		    let articleTotal = 0;
		    let _articleTotal = 0;
		    for (let i = startBk; i <= endBk; i++) {
			    this.opt.call('getBlockArticles',[i, true]).then((rc) => {
				articles = {...articles, ...rc};
				articleTotal = Object.keys(articles).length;
				if (articleTotal > _articleTotal && Object.keys(rc).length > 0) {
					console.log(`DEBUG: in MultiBlockArticles: block = ${i}`)
					console.dir({articles, articleTotal});
					_articleTotal = articleTotal;
				}
				DlogsActions.updateState({articles, articleTotal});
			    })
		    }
	    }

	    this.refreshArticles = (callback = null) => {
		return this.opt.call('reports').then((data) => {
		    if (typeof(this.account) !== 'undefined' && data.dbsync) {
			let os = data.optract.synced;
			if (data.optract.synced > 5) {
				os = data.optract.synced - 5;
				if (data.optract.opStart < os) os = data.optract.opStart;
			}
			this.getFinalList(data.optract.opround);
			this.getMultiBkArticles(os, data.optract.synced);
			if (data.optract.lottery.drawed === true) {
				this.getClaimArticles(data.optract.opround, true);
				this.getClaimTickets(this.account);
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
		    DlogsActions.updateState({ claimTickets: data });
		    return {claimTickets: data};
		}).catch((err) => { console.trace(err); })
	    }

	    this.getClaimArticles = (op, parsing, callback) => {
		return this.opt.call('getClaimArticles', [op, parsing]).then((data) => {
		    console.log(`DEBUG: in OptractService getClaimArticles:`); console.dir(data);
		    DlogsActions.updateState({claimArticles: data, claimArticleCounts: Object.keys(data).length});
		    if (callback) callback()
		    return {claimArticles: data}
		}).catch((err) => { console.trace(err); })

	    }
    }

    getFinalList(op) {
	//TODO: once we have enough final list, we should limit the query range...
        this.opt.call('getOpRangeFinalList', [1, op, true]).then((data) => {
	    let n = 0;
	    let list = Object.values(data).reduce((o, i) => {
		    if (Object.keys(i).length === 0) return o;
		    let ii = Object.values(i)[0];
		    let j = { page: {...ii}, url: ii.url, tags: {tags: ['finalList'], comment: ''} };
		    o = { ...o, [n]: j}; n++; return o;
	    }, {});
            DlogsActions.updateState({ finalList: list, finalListCounts: Object.keys(list).length});
        }).catch((err) => { console.log(`DEBUG: getFinalList:`); console.trace(err); })
    }

    newVote(block, leaf) {
        console.log(`Now vote with args: ${block} ${leaf}`);
        return this.opt.call('newVote', { args: [block, leaf] });
    }

    newClaim(v1block, v1leaf, v2block, v2leaf, comment) {
	console.log(`DEBUG: newClaim called:`)
	console.dir({v1block, v1leaf, v2block, v2leaf, comment});
        return this.opt.call('newClaim', {args: [v1block, v1leaf, v2block, v2leaf]});
    }


}

const optractService = new OptractService();
export default optractService;
