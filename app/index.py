import os,sys,datetime,time,json
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

_app_is_done=False
@eel.expose
def is_done():
    return _app_is_done


eel.init(os.path.dirname(os.path.abspath(__file__))+'\gui')
eel.start('load.html',
port = 8701,
suppress_error=True,
block=False,
size = (300,600),
mode='edge'
)

done_time = time.process_time()

#================================================
info("loading")
import threading,queue


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
_app_is_done = True
main.start()

info("all done")

load_time = str((done_time - start_time)*1000)
all_done_time = str((loaded_time - start_time)*1000)

eel.sleep(3)
eel.info("啟動時間",load_time+"ms","console")
eel.info("總加載時間",all_done_time+"ms","console")

while True:
    #設置定時執行
    eel.sleep(15)

    #設置config索引
    user_path = path + "data/user_config/"
    config_users_list = os.listdir(user_path)
    app_users_list = list(main.app_setting("user_config_index").values())

    if(config_users_list != app_users_list):
        print("set user config index")
        index_file = {}
        for account in config_users_list:
            if(account[-5:] == ".json"):
                with open(user_path + account, "r") as f:
                    file = json.load(f)
                    index = file["steam_id"]
                    index_file[index] = account

        main.app_setting("user_config_index",index_file)