#!/usr/bin/python
# Version 1.0
"""
Script for monitoring devices in the local network.
"""
import argparse
import sys
import os
import re
import json
from MonErrors import ASSERT, handle_error
import aiofiles
from asyncio import get_event_loop, create_subprocess_exec, wait_for, TimeoutError
from asyncio.subprocess import PIPE, STDOUT, DEVNULL
from time import time

CMD = '/usr/bin/arp-scan'
NETWORK_ADDR = '10.20.1.1/24'
CMD_ARGS = [ CMD, '-g', NETWORK_ADDR ]
AUTHORIZED_MAC_ADDR_FILE = 'auth_mac_addrs.txt'
GLOBAL_TIMEOUT = 5.0
CMD_TIMEOUT = 3.0
FILE_READ_TIMEOUT = 3.0

async def get_devices():
  scanned_mac_addrs = sorted(await scan_network())
  auth_mac_addrs = await get_auth_mac_addrs()

  for mac_addr in scanned_mac_addrs:
    if mac_addr not in auth_mac_addrs:
      alarm(mac_addr)

  print(json.dumps({
    'count': len(scanned_mac_addrs),
    'list': scanned_mac_addrs
  },
  sort_keys = True,
  indent = 2))

async def scan_network():
  proc = await create_subprocess_exec(
    *CMD_ARGS,
    stdout = PIPE,
    stderr = STDOUT
  )

  ASSERT(False, 'Falise is wrong')

  timeout = time() + CMD_TIMEOUT

  result = b''
  while True:
    if time() > timeout:
      raise TimeoutError

    line = await proc.stdout.readline()
    if not line: break

    result += line
  wait_for(proc, CMD_TIMEOUT)

  result = result.decode('utf-8')

  scanned_mac_addrs = re.findall(r'((?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2}))',
    result, re.I)

  return scanned_mac_addrs

async def get_auth_mac_addrs():
  addrs = []

  timeout = time() + FILE_READ_TIMEOUT

  async with aiofiles.open(AUTHORIZED_MAC_ADDR_FILE, 'r') as f:
    async for line in f:
      if time() > timeout:
        raise TimeoutError
      addrs.append(line.rstrip('\n'))

  return addrs

def alarm(mac_addr):
  print('Alarm: Found an unknown MAC address: {}'.format(mac_addr))

if __name__ == '__main__':
  try:
    loop = get_event_loop()
    loop.run_until_complete(get_devices())
    loop.close()

  except:
    handle_error(sys.exc_info())
