#!/usr/bin/python
# Version 1.0
"""
Script for monitoring devices in the local network.
"""

import argparse
import sys
import os
from subprocess import run, PIPE, DEVNULL, TimeoutExpired, CalledProcessError
import re
import json

NETWORK_ADDR = '10.20.1.1/24'
AUTHORIZED_MAC_ADDR_FILE = 'auth_mac_addrs.txt'
TIMEOUT = 5

def scan_network():
  try:
    result = run(
      [ 'arp-scan', '-g', NETWORK_ADDR ],
      stdout = PIPE,
      stderr = DEVNULL,
      timeout = TIMEOUT,
      check = True,
      encoding = 'utf-8'
    ).stdout

  except CalledProcessError as err:
    print('Child process returned a non-zero exit status: {}'
      .format(err))
  except TimeoutExpired as err:
    print('arp-scan has timed out: {}'
      .format(err))

  scanned_mac_addrs = re.findall(r'((?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2}))',
    result, re.I)

  return scanned_mac_addrs

def get_auth_mac_addrs():
  addrs = []

  try:
    with open(AUTHORIZED_MAC_ADDR_FILE, 'r+') as f:
      addrs = [ line.rstrip('\n') for line in f ]
  except FileNotFoundError as err:
    print("Couldn't open file {} for reading, file doesn't exist"
      .format(AUTHORIZED_MAC_ADDR_FILE))

  return addrs

def alarm(mac_addr):
  print('Alarm: Found an unknown MAC address: {}'.format(mac_addr))

if __name__ == '__main__':
  try:
    scanned_mac_addrs = sorted(scan_network())
    auth_mac_addrs = get_auth_mac_addrs()

    for mac_addr in scanned_mac_addrs:
      if mac_addr not in auth_mac_addrs:
        alarm(mac_addr)

    print(json.dumps({
      'count': len(scanned_mac_addrs),
      'list': scanned_mac_addrs
    },
    sort_keys = True,
    indent = 2))

  except Exception as err:
    print('Script error: {}'.format(err))
