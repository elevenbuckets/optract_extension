#!/usr/bin/python -u

# Note that running python with the `-u` flag is required on Windows,
# in order to ensure that stdin and stdout are opened in binary, rather
# than text, mode.

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


def isStartMessage(messgae):
    return True  
def startServer():   
    lockFile = "Optract.LOCK"
    if os.path.exists(lockFile):
        os.remove(lockFile)

    ipfsConfigPath = path.join("ipfs_repo", "config")
    ipfsBinPath = path.join("bin", "ipfs")
    if(not os.path.exists(ipfsConfigPath)):
        subprocess.check_call([ipfsPath, "init"])
        print "init ipfs"

    # ipfsPath = path.join("ipfs_repo", "api")
    # while(not os.path.exists(ipfsPath))
    nodeCMD = path.join("bin", "node")
    daemonCMD =  path.join("lib", "daemon.js")
    subprocess.check_call([nodeCMD, daemonCMD])

# startServer()

while True:
    message = get_message()
    if "ping" in message.values():
        send_message(encode_message("pong")) 
        startServer()
    #if message:
    #    send_message(encode_message("pong")) 
