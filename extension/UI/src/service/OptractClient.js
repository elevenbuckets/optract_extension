'use strict';

import IPFS from 'ipfs';
import ipfsClient from 'ipfs-http-client';



class OptractClient {
    constructor() {
        let opt
        const WSClient = require('rpc-websockets').Client;
        const connectRPC = (url) => {
                opt = new WSClient(url);

                const __ready = (resolve, reject) =>
                {
                        opt.on('open',  function(event) { resolve(true) });
                        opt.on('error', function(error) { console.trace(error); reject(false) });
                }

                return new Promise(__ready);
        }

        return connectRPC('ws://127.0.0.1:59437')
         .then((rc) =>
         {
                if (!rc) throw("failed connection");
                console.dir("connectted to rpc!")
                opt.call("password", ["rinkeby"]).then(rc=>{
                    opt.call("userWallet").then(rc=>{
                        console.dir(rc);
                    })
                })
         })
         .catch((err) => { console.trace(err); })

    
    }

}

const optractClient = new OptractClient();
export default optractClient;