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

FNULL = open(os.devnull, 'w');

def startServer():   
    lockFile = "Optract.LOCK"
    if os.path.exists(lockFile):
        return

    ipfsConfigPath = path.join("ipfs_repo", "config")
    ipfsBinPath = path.join("bin", "ipfs")
    ipfsRepoPath = path.join(os.getcwd(), 'ipfs_repo');
    if(not os.path.exists(ipfsConfigPath)):
        print "init ipfs"
        subprocess.check_call([ipfsBinPath, "init"], stdout=FNULL, stderr=subprocess.STDOUT)
        return startServer();
    else:
        subprocess.Popen([ipfsBinPath, "daemon", "--routing=dhtclient"], env={'IPFS_PATH': ipfsRepoPath}, stdout=FNULL, stderr=subprocess.STDOUT)
        print "start ipfs"

    ipfsAPI  = path.join(ipfsRepoPath, "api")
    ipfsLock = path.join(ipfsRepoPath, "repo.lock")
    while(not os.path.exists(ipfsAPI) or not os.path.exists(ipfsLock)):
        time.sleep(.01) 

    nodeCMD = path.join("bin", "node")
    daemonCMD =  path.join("lib", "daemon.js")
    subprocess.check_call([nodeCMD, daemonCMD])

#startServer()
started = False

while True:
    message = get_message()
    if "ping" in message.values() and started == False:
        started = True
        send_message(encode_message('pong')) 
        startServer()
    #if message:
    #    send_message(encode_message("pong")) 
