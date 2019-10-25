#!/usr/bin/python -u

# Note that running python with the `-u` flag is required on Windows,
# in order to ensure that stdin and stdout are opened in binary, rather
# than text, mode.

import time
import json
import sys
import struct
import subprocess
import os.path as path
import os
import signal
import ctypes

FNULL = open(os.devnull, 'w')
ipfsP = None
nodeP = None

# Read a message from stdin and decode it.
def get_message():
    raw_length = sys.stdin.read(4)
    if not raw_length:
        sys.exit(0)
    message_length = struct.unpack('=I', raw_length)[0]
    message = sys.stdin.read(message_length)
    return json.loads(message)


# Encode a message for transmission, given its content.
def encode_message(message_content):
    encoded_content = json.dumps(message_content)
    encoded_length = struct.pack('=I', len(encoded_content))
    return {'length': encoded_length, 'content': encoded_content}


# Send an encoded message to stdout.
def send_message(encoded_message):
    sys.stdout.write(encoded_message['length'])
    sys.stdout.write(encoded_message['content'])
    sys.stdout.flush()

def startServer():  
    lockFile = "Optract.LOCK"
    if os.path.exists(lockFile):
        return

    ipfsConfigPath = path.join("ipfs_repo", "config")
    ipfsBinPath = path.join("bin", "ipfs")
    ipfsRepoPath = path.join(os.getcwd(), 'ipfs_repo')
    if not os.path.exists(ipfsConfigPath):
        subprocess.check_call([ipfsBinPath, "init"], stdout=FNULL, stderr=subprocess.STDOUT)
        return startServer()
    else:
    	ipfsAPI  = path.join(ipfsRepoPath, "api")
    	ipfsLock = path.join(ipfsRepoPath, "repo.lock")
        if (os.path.exists(ipfsAPI)):
		os.remove(ipfsAPI) 
        if (os.path.exists(ipfsLock)):
		os.remove(ipfsLock) 
        ipfsP = subprocess.Popen([ipfsBinPath, "daemon", "--routing=dhtclient"], env={'IPFS_PATH': ipfsRepoPath}, stdout=FNULL, stderr=subprocess.STDOUT)

    while (not os.path.exists(ipfsAPI) or not os.path.exists(ipfsLock)):
        time.sleep(.01) 

    nodeCMD = path.join("bin", "node")
    daemonCMD =  path.join("lib", "daemon.js")
    nodeP = subprocess.Popen([nodeCMD, daemonCMD], stdout=FNULL, stderr=subprocess.STDOUT)
    return ipfsP, nodeP

def stopServer(ipfsP, nodeP):
    lockFile = "Optract.LOCK"
    if os.path.exists(lockFile):
       os.remove(lockFile) 
    os.kill(nodeP.pid, signal.SIGTERM)
    # This will not kill the ipfs by itself, but this is needed for the sys.exit() to kill it 
    os.kill(ipfsP.pid, signal.SIGINT)

# MAIN
started = False;

if (len(sys.argv) > 1 and sys.argv[1] == 'launch'):
        while True:
            if started == False:
                started = True
                ipfsP, nodeP = startServer();
            time.sleep(1);
            pl = subprocess.Popen(['pgrep', '-lf', 'firefox'], stdout=subprocess.PIPE).communicate()[0]
            pl = pl.split("\n")[0:-1]
            if (len(pl) == 0):
                stopServer(ipfsP, nodeP)
                sys.exit(0);
else:
    while True:
        message = get_message()
        if "ping" in message.values() and started == False:
	    started = True;
	    time.sleep(1);
            #os.execl(sys.executable, 'python', './nativeApp.py', 'launch');
	    subprocess.Popen(["./nativeApp.py","launch"]);
	    sys.exit(0);

