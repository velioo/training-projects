#!/usr/bin/python3.6

import cgi, cgitb
import sys, os
import traceback
cgitb.enable(display=0, logdir="logs")

try:
    form = cgi.FieldStorage()

    first_name = form.getvalue('first_name')
    last_name = form.getvalue('last_name')

    print ("HTTP/1.1 200 OK")
    print ("Content-type:text/html\r\n\r\n")
    print ('<html>')
    print ('<head>')
    print ('<title>Hello Word - First CGI Program</title>')
    print ('</head>')
    print ('<body>')
    print ('<h2>Hello {} {} </h2>'.format(first_name, last_name))
    print ('<h2>Hello There </h2>')
    print ('</body>')
    print ('</html>')

except Exception as e:
    print(traceback.format_exc())
