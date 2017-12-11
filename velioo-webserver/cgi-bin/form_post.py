#!/usr/bin/python3.6

import cgi, cgitb
import sys
import traceback
cgitb.enable(display=0, logdir="logs")

try:

    form = cgi.FieldStorage()

    first_name = form.getvalue('first_name')
    last_name = form.getvalue('last_name')
    password = form.getvalue('password')

    print ("Content-type:text/html\r\n\r\n")
    print ('<html>')
    print ('<head>')
    print ('<title>Hello Word - First CGI Program</title>')
    print ('</head>')
    print ('<body>')
    print ('<h2>Hello {} {} </h2>'.format(first_name, last_name))
    print ('</body>')
    print ('</html>')

except Exception as e:
    print("***ERROR***")
    print(traceback.format_exc())
