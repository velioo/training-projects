import psutil
import sys
import os
import re
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
    print('<h1>' + os.environ.get('SERVER_SOFTWARE', 'Velioo\'s Server') + ' Status for ' + os.environ.get('SERVER_NAME', 'localhost') + '</h1>')
    try:
        load_avg = re.sub('[()]', '', str(os.getloadavg()))
        print('Server load: {}'.format(load_avg))
    except OSError as e:
        print('Server load: Unobtainable...')
        
    try:
        cpu_times = []
        for e in psutil.Process(psutil.Process(os.getppid()).ppid()).cpu_times():
            cpu_times.append(str(e))
        print('<p>CPU load: {} </p>'.format(", ".join(cpu_times)))
    except (psutil.NoSuchProcess, psutil.ZombieProcess, psutil.AccessDenied) as e:
        print(e)
        
    print ('</body>')
    print ('</html>')

except Exception as e:
    print(e)
