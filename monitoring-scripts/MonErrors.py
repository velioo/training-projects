#!/usr/bin/python

import os
import sys
import traceback

class SystemError(Exception):
  def __init__(self, msg, *args):
    self.strerror = msg
    self.args = {msg, *args}

class UserError(Exception):
  def __init__(self, msg, *args):
    self.strerror = msg
    self.args = {msg, *args}

class PeerError(Exception):
  def __init__(self, msg, *args):
    self.strerror = msg
    self.args = {msg, *args}

def handle_error(err):
  try:
    exc_type, exc_obj, tb = err

    if (isinstance(exc_obj, SystemError)):
      eprint('SystemError: {}'.format(traceback.format_exc()))
    else:
      print(traceback.format_exc())
  except:
    print('Error while handling error: {}'.format(traceback.format_exc()))

def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

def ASSERT(expr, msg, *args):
  if (expr): return

  raise SystemError(msg, *args)

def ASSERT_USER(expr, msg, *args):
  if (expr): return

  raise UserError(msg, *args)

def ASSERT_PEER(expr, msg, *args):
  if (expr): return

  raise PeerError(msg, *args)