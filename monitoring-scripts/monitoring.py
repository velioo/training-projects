#!/usr/bin/python
# Version 1.0
"""
Script for monitoring devices in the local network.
"""

import argparse
import sys
import os
import subprocess
import re

NETWORK_IP = '10.20.1.1';
BITS = '24';
AUTHORIZED_MAC_ADDR_FILE = 'auth_mac_addrs.txt'
UNAUTHORIZED_MAC_ADDR_FILE = 'unauth_mac_addrs.txt'

def scan_network():
  network_addr = str(NETWORK_IP) + '/' + str(BITS);

  result = subprocess.run([ 'arp-scan', '-g', network_addr ],
    stdout=subprocess.PIPE).stdout.decode('utf-8')

  rexp = re.compile(r'((?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2}))', re.I);
  rexp_iter = rexp.finditer(result)

  scanned_mac_addrs = []

  for data in rexp_iter:
    if len(data.groups()) != 1:
      raise Exception('Failed to match arp-scan output')
    scanned_mac_addrs.append(''.join(data.groups(1)))

  return scanned_mac_addrs

def get_unauth_mac_addrs():
  addrs = []

  try:
    with open(UNAUTHORIZED_MAC_ADDR_FILE, 'r+') as f:
      addrs = [line.rstrip('\n') for line in f]
  except FileNotFoundError as err:
    os.mknod(UNAUTHORIZED_MAC_ADDR_FILE)

  return addrs

def get_auth_mac_addrs():
  addrs = []

  try:
    with open(AUTHORIZED_MAC_ADDR_FILE, 'r+') as f:
      addrs = [line.rstrip('\n') for line in f]
  except FileNotFoundError as err:
    os.mknod(AUTHORIZED_MAC_ADDR_FILE)

  return addrs

def save_unauth_mac_addr(mac_addrs):
  with open(UNAUTHORIZED_MAC_ADDR_FILE, 'a+') as f:
    [f.write(mac_addr + '\n') for mac_addr in mac_addrs]

def alarm(mac_addr):
  print('Alarm: Found an unknown MAC address: {}'.format(mac_addr))

if __name__ == '__main__':
  try:
    scanned_mac_addrs = scan_network()
    unauth_mac_addrs = get_unauth_mac_addrs()
    auth_mac_addrs = get_auth_mac_addrs()

    new_mac_addrs = []

    for mac_addr in scanned_mac_addrs:
      if mac_addr not in auth_mac_addrs:
        alarm(mac_addr)
        if mac_addr not in unauth_mac_addrs:
          new_mac_addrs.append(mac_addr)

    save_unauth_mac_addr(new_mac_addrs) if len(new_mac_addrs) > 0 else 0

  except Exception as err:
    print('Script error: {}'.format(err))
