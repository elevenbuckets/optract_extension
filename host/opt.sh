#!/bin/bash

function handler {
	rm -f $PWD/dist/Optract.LOCK;
	pkill -15 optRun
}

trap handler INT;
trap handler KILL;
trap handler CHLD;

WAIT=true
if [ -f $PWD/dist/Optract.LOCK ]; then 
	echo -n '\x16\x0\x0\x0{"connection":"false"}'; 
	WAIT=false;
else
	(cd $PWD/dist && ./optRun daemon &> /dev/null &);
fi

while $WAIT; do
	sleep 1;
	[ -f $PWD/dist/Optract.LOCK ] && echo -n '\x15\x0\x0\x0{"connection":"done"}' && break
done

while true; do
	sleep 100;
done
