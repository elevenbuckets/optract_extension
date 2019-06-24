'use strict';

import IPFS from 'ipfs';
import ipfsClient from 'ipfs-http-client';



class FileService {
    constructor() {
        // Create the IPFS node instance
        this.ipfs = new IPFS({ repo: String(Math.random() + Date.now()) });
        this.ipfsClient = new ipfsClient('ipfs.infura.io', '5001', {protocol: 'https'})
        console.log("new ipfs");
        this.ipfs.once('ready', () => {
            console.log('IPFS node is ready');
        })
    }

}

const fileService = new FileService();
export default fileService;