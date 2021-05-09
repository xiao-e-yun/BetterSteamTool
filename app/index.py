import psutil,sys
pids = psutil.pids()

run_status = {"Status":False,"Port":8701,"open":0}

for pid in pids:
    try:
        name = psutil.Process(pid).name()
        if (name == 'Bsteam.exe'):
            if(run_status["open"]==0):
                run_status["open"]=1
            else:
                run_status["open"]=2
    except:
        pass
if (run_status["open"]==2):
    print("close")
    sys.exit()

import eel,logging,steam,os,socket
from python import guard,api,main
logging.basicConfig(level=logging.INFO)
def check_port_in_use(): #檢視port
    s = None

while not run_status["Status"]:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1)
        s.connect(('127.0.0.1', run_status["Port"]))
        run_status["Status"] = False
        run_status["Port"]+=1
    except socket.error:
        run_status["Status"] = True
    finally:
        if s:
            s.close()


def close_callback():
    eel.close()

if(not check_port_in_use()):
    main.start()
    guard.load_user()

    eel.init(os.path.dirname(os.path.abspath(__file__))+'\gui')
    eel.start('index.html',
        port = run_status["Port"],
        suppress_error=True,
        size = (300,600),
        mode='edge',
    )