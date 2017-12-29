import psutil
import sys
import os
import re
import datetime
from time import mktime, strftime, localtime, sleep
from wsgiref.handlers import format_date_time
import traceback
import cgi, cgitb

cgitb.enable(display=0, logdir="logs")

try:
    sleep(2)
    print ("HTTP/1.1 200 OK")
    print ("Content-type:text/html\r\n\r\n")
    print ('<html>')
    print ('<head>')
    print ('<title>Server Status</title>')
    print ('</head>')
    print ('<body>')
    print('<h1>' + os.environ.get('SERVER_SOFTWARE', 'Velioo\'s Server') + ' Status for ' + os.environ.get('SERVER_NAME', 'localhost') + ':' + os.environ.get('PORT', '') + '</h1>')
    now = datetime.datetime.now()
    stamp = mktime(now.timetuple())
    print('<dt>Current Time: ' + format_date_time(stamp) + '</dt>')
    try:
        proc = psutil.Process(psutil.Process(os.getppid()).pid)
        print('<dt>Server uptime: ' + strftime("%Y-%m-%d %H:%M:%S", localtime(proc.create_time())) + '</dt>')
    except (psutil.NoSuchProcess, psutil.ZombieProcess, psutil.AccessDenied) as e:
        print(e)
    try:
        load_avg = re.sub('[()]', '', str(os.getloadavg()))
        print('<dt>Server load: {}</dt>'.format(load_avg))
    except OSError as e:
        print('Server load: Unobtainable...')
    try:
        cpu_times = []
        names = ('u', 's', 'cu', 'cs')
        for idx, e in enumerate(proc.cpu_times()):
            cpu_times.append(names[idx] + ':' + str(e))
        print('<dt>CPU load: {} </dt>'.format(", ".join(cpu_times)))
    except Exception as e:
        print(e)
        
    children = proc.children(recursive=True)
    print('<dt>Number of children: ' + str(len(children)) + '</dt>')
    print('<dt>Child PIDs: </dt>')
    for child in children:
        print('<dt>{}</dt>'.format(child.pid))
        
    print ('</body>')
    print ('</html>')

except Exception as e:
    print(e)
