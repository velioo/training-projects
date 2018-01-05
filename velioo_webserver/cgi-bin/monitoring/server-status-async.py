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

    print ("HTTP/1.1 200 OK")
    print ("Content-type:text/html\r\n\r\n")
    print ('<html>')
    print ('<head>')
    print ('<title>Server Status</title>')
    print ('</head>')
    print ('<body>')
    print('<h1>' + os.environ.get('SERVER_SOFTWARE', 'Velioo\'s Server') + ' Status for ' + os.environ.get('SERVER_NAME', 'localhost') + ':' + os.environ.get('SERVER_PORT', '') + '</h1>')
    now = datetime.datetime.now()
    stamp = mktime(now.timetuple())
    print('<dt>Current Time: ' + format_date_time(stamp) + '</dt>')
    try:
        if os.environ.get('SERVER_TYPE', 'SYNC') == 'ASYNC':
            proc = psutil.Process(psutil.Process(os.getppid()).pid)
        else:
            proc = psutil.Process(psutil.Process(os.getppid()).ppid())
            children = proc.children(recursive=True)
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
        
    try:
        print('<dt>Memory usage(KiB): ', end='')
        names = ('RSS', 'VSZ', 'SHR', 'TEXT', 'LIB', 'DATA', 'DIRTY', 'USS', 'PSS', 'SWAP')
        for idx, e in enumerate(proc.memory_full_info()):
            print(names[idx] + ':' + str(e/1024) + ',')
        print('</dt>')
    except Exception as e:
        print(e)
        
    try:
        children = proc.children(recursive=True)
        children.insert(0, proc)
        print('<table>')
        print('<tr>')
        if os.environ.get('SERVER_TYPE', 'SYNC') == 'SYNC':
            print('<th>PID</th>')
        print('<th>Client</th>')
        print('<th>Host</th>')
        print('<th>Status</th>')
        print('<th style="margin-left:100px;">Request</th>')
        print('</tr>')
        if os.environ.get('SERVER_TYPE', 'SYNC') == 'ASYNC':
            children = [proc]
        try:
            for l in children:
                if l.is_running():
                    for e in l.connections():
                        print('<tr>')
                        if os.environ.get('SERVER_TYPE', 'SYNC') == 'SYNC':
                            if l.is_running():
                                print('<td>' + str(l.pid) + '</td>')
                            else:
                                print('<td>Dead</td>')
                        if e.raddr:
                            print('<td>' + str(e.raddr[0]), end='')
                            if len(e.raddr) > 1:
                                print(':' + str(e.raddr[1]) + '</td>')
                            else:
                                print('</td>')
                        else:
                            print('<td>None</td>')
                        print('<td>' + str(e.laddr[0]), end='')
                        if len(e.laddr) > 1:
                            print(':' + str(e.laddr[1]) + '</td>')
                        else:
                            print('</td>')
                        print('<td>' + str(e.status) + '</td>')
                        #print(l.environ())
                        #print('<td>' + l.environ()['REQUEST_METHOD'] + ' ' + l.environ()['SCRIPT_NAME'] + ' ' + l.environ()['QUERY_STRING'] + '</td>')
                        print('</tr>')
        except psutil.NoSuchProcess as e:
            print(e)
        print('</table>')
    except Exception as e:
        print(e)
        
    print ('</body>')
    print ('</html>')

except Exception as e:
    print(e)
