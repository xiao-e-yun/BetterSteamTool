import os,sys,datetime,time
def info(txt):
    print(txt+" |"+datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f'))

start_time = time.process_time()
#================================================
info("set LOCK")#設置鎖並檢測
path = os.getcwd()+"\\"
try:
    if os.path.exists(path+".LOCK"):
        os.remove(path+".LOCK")
except:
    sys.exit()
    
lock=open(path+".LOCK","w")
lock.write("0")

#================================================
info("start")
import eel

def EEL_start(port):
    eel.init(os.path.dirname(os.path.abspath(__file__))+'\gui')
    eel.start('load.html',
    port = port,
    suppress_error=True,
    block=False,
    size = (300,600),
    mode='edge'
    )

try:
    EEL_start(8700)
except:
    info("test port")#檢視port
    run_status = {"Status":False,"Port":8701}
    import socket

    while not run_status["Status"]:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.05)
            s.connect(('127.0.0.1', run_status["Port"]))
            run_status["Status"] = False
            run_status["Port"]+=1
        except socket.error:
            run_status["Status"] = True
        finally:
            if s:
                s.close()
    EEL_start(run_status["Port"])

done_time = time.process_time()

#================================================
info("loading")
import threading,queue

# 開發模式使用
# from python import main,api,guard

need_import = {"pkg":"py","main":"py.main"}
def load_mod(need_import,q):
    req = {}
    for name , pkg in need_import.items():
        file = __import__(pkg,fromlist="*")
        req[name] = file
    q.put(req)

que = queue.Queue()
t = threading.Thread(target=load_mod, args=(need_import,que))
t.start()

while t.is_alive():
    eel.sleep(.1)

mods = que.get()

for name,file in mods.items():
    globals()[name] = file
loaded_time = time.process_time()
#================================================
eel.done()
main.start()

info("all done")

load_time = str((done_time - start_time)*1000)
all_done_time = str((loaded_time - start_time)*1000)

eel.sleep(3)
eel.info("啟動時間",load_time+"ms","console")
eel.info("總加載時間",all_done_time+"ms","console")

while True:
    eel.sleep(5)