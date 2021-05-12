import os,sys,datetime,stat
def info(txt):
    print(txt+" |"+datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f'))

#================================================
info("set LOCK")#設置鎖並檢測
path = os.getcwd()+"\\"
try:
    if os.path.exists(path+".LOCK"):
        os.remove(path+".LOCK")
except:
    sys.exit()
    
lock=open(path+".LOCK","w")
os.chmod(path+".LOCK",stat.S_IWRITE)
lock.write("0")

#================================================
info("test port")#檢視port
run_status = {"Status":False,"Port":8701}
import eel,socket

while not run_status["Status"]:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.2)
        s.connect(('127.0.0.1', run_status["Port"]))
        run_status["Status"] = False
        run_status["Port"]+=1
    except socket.error:
        run_status["Status"] = True
    finally:
        if s:
            s.close()

#================================================
info("start")
from python import main,api,guard 
main.start()
guard.load_user()

eel.init(os.path.dirname(os.path.abspath(__file__))+'\gui')
eel.start('index.html',
port = run_status["Port"],
suppress_error=True,
size = (300,600),
mode='edge'
)