#!/usr/bin/python

import os
import sys
import traceback
from datetime import datetime

APP_TRACE_FD = 9
TRACE_FD = 5

try:
  APP_TRACE_FH = os.fdopen(APP_TRACE_FD, 'a+')
except OSError as err:
  if err.errno == 9:
    APP_TRACE_FH = None
  else:
    print('Failed to open APP_TRACE_FD: {}'.format(traceback.format_exc()), file = sys.stderr)
    sys.exit()

class SysError(Exception):
  def __init__(self, msg, *args):
    #self.strerror = msg
    self.args = { msg, *args }


class UserError(Exception):
  def __init__(self, msg, *args):
    self.strerror = msg
    self.args = { msg, *args }


class PeerError(Exception):
  def __init__(self, msg, *args):
    self.strerror = msg
    self.args = { msg, *args }


class TemporaryError(Exception):
  def __init__(self, msg, *args):
    self.strerror = msg
    self.args = { msg, *args }


SYS_ERRORS = [ SysError, TypeError, NameError ]
USER_ERRORS = [ UserError ]
PEER_ERRORS = [ PeerError ]
TEMP_ERRORS = [ TemporaryError ]


def handle_error(err):
  try:
    exc_type, exc_obj, exc_tb = err
    tb = traceback.extract_tb(exc_tb)[-1]

    if (is_error_instance_of(exc_obj, SYS_ERRORS)):
      THROW(format_err_msg(exc_type, tb[0], tb[2], tb[1], str(exc_obj)))
    elif (is_error_instance_of(exc_obj, USER_ERRORS)):
      THROW_USER(str(exc_obj))
    elif (is_error_instance_of(exc_obj, PEER_ERRORS)):
      THROW_PEER(str(exc_obj))
    elif (is_error_instance_of(exc_obj, TEMP_ERRORS)):
      THROW_TEMP(str(exc_obj))
    else:
      print(traceback.format_exc())
  except:
    print('Error while handling error: {}'.format(traceback.format_exc()))


def eprint(*args, **kwargs):
    print(*args, file = sys.stderr, **kwargs)


def is_error_instance_of(err, err_instances):
  for err_instance in err_instances:
    if (isinstance(err, err_instance)):
      return True

  return False


def format_err_msg(err_type, file, func, lineno, msg):
  return (str(err_type) + ' FILE: ' + str(file) +
    ', FUNCTION: ' + str(func) + ', LINE: ' +
    str(lineno) + ', MSG: ' + str(msg))


def ASSERT(expr, *args):
  if (expr): return

  raise SysError(*args)
  #THROW(*args)


def ASSERT_USER(expr, msg, *args):
  if (expr): return

  raise UserError(msg, *args)


def ASSERT_PEER(expr, msg, *args):
  if (expr): return

  raise PeerError(msg, *args)


def ASSERT_TEMP(expr, msg, *args):
  if (expr): return

  raise TemporaryError(msg, *args)


def APP_TRACE(*args):
  app_msg = datetime.now().strftime("%Y-%m-%d %H:%M: ")

  try:
    for arg in args:
      app_msg += str(arg)

    if APP_TRACE_FH != None:
      print(app_msg + '\n', file = APP_TRACE_FH)
  except NameError as err:
    THROW('APP_TRACE_FH is not defined')
  except TypeError as err:
    THROW('Problem concatenating args of APP_TRACE')


def THROW(*args):
  eprint('Throw err:', *args)


def THROW_USER(*args):
  eprint('Throw user:', *args)


def THROW_PEER(*args):
  eprint('Throw peer:', *args)


def THROW_TEMP(*args):
  eprint('Throw temp:', *args)
