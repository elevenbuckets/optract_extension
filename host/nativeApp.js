#!/usr/bin/env node

'use strict';

const nativeMsgs = require('chrome-native-messaging');

const activeRound = (msgObj) =>
{
	let activeOutput = new nativeMsgs.Output();
	activeOutput.end(msgObj);
	activeOutput.pipe(process.stdout);

	const activeResponse = (msg, push, done) =>
	{
        	console.log(`Extension replies:`);
		console.dir(msg);
        	push({ACK: true});                  
        	done();                       // Call when done pushing replies.
	}

	process.stdin
	       .pipe(new nativeMsgs.Input())
	       .pipe(new nativeMsgs.Transform(activeResponse));
}

// Main
let msgObj = {MSG: 'Hello!'};
activeRound(msgObj);
