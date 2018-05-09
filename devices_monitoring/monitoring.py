#!/usr/bin/python
# Version 1.0
"""
Script for monitoring devices in the local network.
"""

from MonErrors import (
  ASSERT,
  ASSERT_USER,
  ASSERT_PEER,
  ASSERT_TEMP,
  APP_TRACE,
  handle_error
)

import argparse
import sys
import os
import re
import json
from asyncio import get_event_loop, create_subprocess_exec, wait_for, TimeoutError
from asyncio.subprocess import PIPE
from time import time


CMD = '/usr/bin/nmap'
NETWORK_ADDR = '10.20.1.1/24'
CMD_ARGS = [ CMD, '--script', 'broadcast-dhcp-discover', '-p67', NETWORK_ADDR ]
CMD_TIMEOUT = 30.0
UPDATE_INTERVAL = 60.0
TRIGERR1_MIN = 15
TRIGERR1_MAX = 99999


async def get_devices():
  scanned_mac_addrs, result_timestamp = await scan_network()

  ASSERT(isinstance(scanned_mac_addrs, list), "scanned_mac_addrs must be list but is {}".
    format(type(scanned_mac_addrs).__name__))
  ASSERT(isinstance(result_timestamp, int), 'Timestamp must be an integer but is {}'.
    format(type(scanned_mac_addrs).__name__))

  APP_TRACE(scanned_mac_addrs)

  json_output = {
    "version": "3.0",
    "update_interval": UPDATE_INTERVAL,
    "applications": {
      "network_local_devices": {
        "name": "Network local devices",
        "items": {
          "devices_count": {
            "name": "Devices count",
            "type": "int",
            "value": len(scanned_mac_addrs),
            "units": "",
            "descr": "",
            "timestamp": result_timestamp,
            "triggers": {
              "trig1": {
                "descr": "SUPP3 There are more than {} devices in the network".format(TRIGERR1_MIN),
                "prior": "warn",
                "range": [
                  TRIGERR1_MIN,
                  TRIGERR1_MAX
                ],
                "resol": "Please block the devices."
              }
            }
          }
        }
      }
    }
  }

  print(json.dumps(
    json_output,
    indent = 2
  ))


async def scan_network():
  proc = await create_subprocess_exec(
    *CMD_ARGS,
    stdout = PIPE,
    stderr = PIPE
  )

  result, errors = await wait_for(proc.communicate(), CMD_TIMEOUT)
  result_timestamp = int(time())

  ASSERT_USER(proc.returncode == 0, 'Subprocess failed, returncode = {}'.format(proc.returncode))

  result = result.decode().strip()

  scanned_mac_addrs = re.findall(r'MAC Address:\s*((?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2}))',
    result, re.I)

  return [ scanned_mac_addrs, result_timestamp ]


if __name__ == '__main__':
  try:
    loop = get_event_loop()

    ASSERT(loop != None, 'Event loop returned None')

    loop.run_until_complete(get_devices())
    loop.close()

  except:
    handle_error(sys.exc_info())