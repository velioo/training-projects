#!/usr/bin/python3.6

import cgi, cgitb
import sys
import os
import traceback
cgitb.enable(display=0, logdir="logs")

UPLOAD_DIR = './application/uploads'

try:
    
    form = cgi.FieldStorage()

    first_name = form.getvalue('first_name')
    last_name = form.getvalue('last_name')
    password = form.getvalue('password')

    print ("HTTP/1.1 200 OK")
    print ("Content-type:text/html\r\n\r\n")
    print ('<html>')
    print ('<head>')
    print ('<title>Hello Word - First CGI Program</title>')
    print ('</head>')
    print ('<body>')
    print ('<h2>Hello {} {} </h2>'.format(first_name, last_name))
    print ('</body>')
    print ('</html>')
    
    fileitem = form['file']
    if fileitem.filename:
        uploaded_file_path = os.path.join(UPLOAD_DIR, os.path.basename(fileitem.filename))
        with open(uploaded_file_path, 'wb') as fout:
            while True:
                chunk = fileitem.file.read()
                if not chunk:
                    break
                fout.write (chunk)

except Exception as e:
    print(traceback.format_exc())
