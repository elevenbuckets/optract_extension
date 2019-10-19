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

FNULL = open(os.devnull, 'w')

ipfsP = None
nodeP = None

def _set_pdeathsig(sig=signal.SIGTERM):
    """help function to ensure once parent process exits, its childrent processes will automatically die
    """
    def callable():
        libc = ctypes.CDLL("libc.so.6")
        return libc.prctl(1, signal.SIGTERM)
    return callable

def startServer():  
    send_message(encode_message('in starting server')) 
    lockFile = "Optract.LOCK"
    if os.path.exists(lockFile):
        return

    ipfsConfigPath = path.join("ipfs_repo", "config")
    ipfsBinPath = path.join("bin", "ipfs")
    ipfsRepoPath = path.join(os.getcwd(), 'ipfs_repo')
    if not os.path.exists(ipfsConfigPath):
        send_message(encode_message('before init ipfs')) 
        subprocess.check_call([ipfsBinPath, "init"], stdout=FNULL, stderr=subprocess.STDOUT)
        return startServer()
    else:
        send_message(encode_message('before starting ipfs')) 
        ipfsP = subprocess.Popen([ipfsBinPath, "daemon", "--routing=dhtclient"], env={'IPFS_PATH': ipfsRepoPath}, stdout=FNULL, stderr=subprocess.STDOUT,  preexec_fn=_set_pdeathsig(signal.SIGTERM))
        send_message(encode_message('after starting ipfs')) 
    send_message(encode_message(' finish ipfs processing')) 
    ipfsAPI  = path.join(ipfsRepoPath, "api")
    ipfsLock = path.join(ipfsRepoPath, "repo.lock")
    while (not os.path.exists(ipfsAPI) or not os.path.exists(ipfsLock)):
        time.sleep(.01) 

    nodeCMD = path.join("bin", "node")
    daemonCMD =  path.join("lib", "daemon.js")
    send_message(encode_message(' starting node processing')) 
    nodeP = subprocess.Popen([nodeCMD, daemonCMD], stdout=FNULL, stderr=subprocess.STDOUT, preexec_fn=_set_pdeathsig(signal.SIGTERM))
    send_message(encode_message('finish starting server')) 
    send_message(encode_message(str(nodeP)))
    return ipfsP, nodeP

def stopServer(ipfsP, nodeP):
    send_message(encode_message('in stoping server')) 
    lockFile = "Optract.LOCK"
    if os.path.exists(lockFile):
       os.remove(lockFile) 
       send_message(encode_message('LockFile removed')) 
    nodeP.kill()
    send_message(encode_message('nodeP killed')) 
    # This will not kill the ipfs by itself, but this is needed for the sys.exit() to kill it 
    ipfsP.terminate()
    # os.kill(ipfsP.pid, signal.SIGINT)
    send_message(encode_message('ipfsP killed signal sent')) 
    
# startServer()
started = False

# while True:
#     if started == False:
#         started = True
#         send_message(encode_message('ping->pong')) 
#         ipfsP, nodeP = startServer()
#         send_message(encode_message('ping->pong more'))

while True:
    message = get_message()
    if "ping" in message.values() and started == False:
        started = True
        send_message(encode_message('ping->pong')) 
        ipfsP, nodeP = startServer()
        send_message(encode_message('ping->pong more'))
    #if message:
    #    send_message(encode_message("pong")) 
    if "pong" in message.values() and started == True:
        started = False
        send_message(encode_message('pong->ping')) 
        stopServer(ipfsP, nodeP)
        send_message(encode_message('pong->ping more'))
        send_message(encode_message('close native app which will also shutdown the ipfs'))
        sys.exit(0)
