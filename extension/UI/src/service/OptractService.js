'use strict';

// import IPFS from 'ipfs';
// import ipfsClient from 'ipfs-http-client';

import DlogsActions from "../action/DlogsActions";

class OptractService {
    constructor() {
        this.opt
        this.account;
        const WSClient = require('rpc-websockets').Client;
        const connectRPC = (url) => {

            const __ready = (resolve, reject) => {
                this.opt.on('open', function (event) { resolve(true) });
                this.opt.on('error', function (error) { console.trace(error); reject(false) });
            }

            return new Promise(__ready);
        }
        this.unlockRPC = (pw, callback, retry) => {
            this.opt = new WSClient('ws://127.0.0.1:59437',{reconnect_interval: 5000,max_reconnects:5 });
            const unlockRPCWithRetry = () => {
                retry++;
                return connectRPC('ws://127.0.0.1:59437')
                    .then((rc) => {
                        if (!rc && retry < 5) {
                            setTimeout(unlockRPCWithRetry, 5000);
                        } else if (!rc && retry >= 5) {
                            throw ("failed connection");
                        }

                        console.dir("connectted to rpc!")
                        this.opt.call("password", [pw]).then(rc => {
                            this.opt.call('reports').then((data) =>{
                                let reports = {reports : data}

                                // get the last 5 blocks
                                this.getBkRangeArticles(data.optract.epoch -5,data.optract.epoch,true, callback);
                                this.getClaimArticles(data.optract.opround -2, true);
                            })

                            this.subscribeBlockData();
                            
                            this.opt.call("userWallet").then(rc => {
                                console.dir(rc);
                                let state = {acccount : rc.OptractMeida};
                                this.acccount = rc.OptractMeida;
                                DlogsActions.updateState(state);
                            })
                        })
                    })
                    .catch((err) => {
                        if (retry < 5) {
                            setTimeout(unlockRPCWithRetry, 1000);
                        } else if (retry >= 5) {
                            console.trace(err);
                        }
                    })
            }
            unlockRPCWithRetry();
        }

        this.getBkRangeArticles = (startB, endB, parsing, callback) =>{
            this.opt.call('getBkRangeArticles', [startB,endB,parsing]).then((data) =>{
                let articles = {articles : data}
                DlogsActions.updateState(articles);
                if(callback){
                    callback()
                }
            })
        }

        this.getNewBkRangeArticles = (startB, endB, parsing, callback) =>{
            this.opt.call('getBkRangeArticles', [startB,endB,parsing]).then((data) =>{
                let articles = {newArticles : data}
                DlogsActions.updateState(articles);
                if(callback){
                    callback()
                }
            })
    
        }

        this.subscribeBlockData = (handler = null) => {
			console.log("subcribing the blockData Event...");
			this.opt.subscribe('blockData');
			this.blockDataHandler = handler;
			this.opt.on('blockData', this.blockDataDispatcher);
		}

		this.blockDataDispatcher = (obj) => {
            console.log("Getting blockData events")
            this.refreshArticles();
			if (!this.blockDataHandler) {
				console.log("No valid handler for blockData events")
			} else {
				this.blockDataHandler(obj)
			}
        }
        


        // this.unlockRPC = (pw, callback) =>{
        //     return connectRPC('ws://127.0.0.1:59437')
        //     .then((rc) =>
        //     {
        //            if (!rc) throw("failed connection");
        //            console.dir("connectted to rpc!")
        //            opt.call("password", [pw]).then(rc=>{
        //                callback();
        //                opt.call("userWallet").then(rc=>{
        //                    console.dir(rc);
        //                })
        //            })
        //     })
        //     .catch((err) => { console.trace(err); }) 
        //  }

    }
  
    getClaimArticles = (op, parsing, callback) =>{
        this.opt.call('getClaimArticles', [op,parsing]).then((data) =>{
            let claimArticles = {claimArticles : data}
            DlogsActions.updateState(claimArticles);
            if(callback){
                callback()
            }
        })

    }

    getNewClaimArticles = (op, parsing, callback) =>{
        this.opt.call('getClaimArticles', [op,parsing]).then((data) =>{
            let newClaimArticles = {newClaimArticles : data}
            DlogsActions.updateState(newClaimArticles);
            if(callback){
                callback()
            }
        })

    }

    getReports = ( callback) =>{
        this.opt.call('reports').then((data) =>{
            let reports = {reports : data}
            DlogsActions.updateState(reports);
            if(callback){
                callback()
            }
        })

    }

    refreshArticles = (callback = null) =>{
        this.opt.call('reports').then((data) =>{
            let reports = {reports : data}

            // get the last 5 blocks
            this.getBkRangeArticles(data.optract.epoch -5,data.optract.epoch,true, callback);
            this.getClaimArticles(data.optract.opround -2, true);
            this.getClaimTickets(this.acccount);
        })
    }

    getClaimTickets(addr){
        this.opt.call('getClaimTickets', [addr]).then((data) =>{
            let claimTickets = {claimTickets : data}
            DlogsActions.updateState(claimTickets);
        })
    }

    getFinalList(op){
        this.opt.call('getOpRangeFinalList', [arguments]).then((data) =>{
            let finalList = {finalList : data}
            DlogsActions.updateState(finalList);
        })
    }

    newVote(block, leaf){
        console.log("Now vote with args : " + arguments);
        console.dir(arguments)
        return this.opt.call('newVote', {args:arguments});
    }

    newClaim(v1block, v1leaf, v2block, v2leaf, comment){
        return this.opt.call('newClaim', arguments);
    }


}

const optractService = new OptractService();
export default optractService;