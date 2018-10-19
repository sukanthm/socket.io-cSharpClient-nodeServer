import os
import subprocess
import signal

pid =[]
for i in range(5):
    print i+1
    p = subprocess.Popen([os.getcwd()+'\\Debug\\ConsoleApp1.exe', '1.1.1.1'])
    pid.append(p.pid)

if raw_input("CMD: ").lower() == 'kill':
    for i in pid:
        os.kill(i, signal.SIGTERM)
