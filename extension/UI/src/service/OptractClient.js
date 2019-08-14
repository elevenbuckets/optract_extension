'use strict';

import IPFS from 'ipfs';
import ipfsClient from 'ipfs-http-client';



class OptractClient {
    constructor() {
        this.opt
        const WSClient = require('rpc-websockets').Client;
        const connectRPC = (url) => {
            this.opt = new WSClient(url);

            const __ready = (resolve, reject) => {
                this.opt.on('open', function (event) { resolve(true) });
                this.opt.on('error', function (error) { console.trace(error); reject(false) });
            }

            return new Promise(__ready);
        }
        this.unlockRPC = (pw, callback, retry) => {
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
                            callback();
                            this.opt.call("userWallet").then(rc => {
                                console.dir(rc);
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

    }




}

const optractClient = new OptractClient();
export default optractClient;