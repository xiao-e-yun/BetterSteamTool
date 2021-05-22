from steam import guard
import steam
from python.main import get_account_list,get_task
import eel,winreg,datetime,vdf,json,asyncio,aiohttp,subprocess
import steam.steamid as Sid
from steam import guard
import threading
loop = asyncio.get_event_loop()

# ==============================================================
#                         外抓系統
# ==============================================================

@eel.expose #req_list:list|dict|str
def get(req_list,JSON = True):
    data=[]

    #設置async取得
    async def _get(url,JSON,original=False,once=False):
        print("start "+datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f'))
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                req = await response.text()
                print("req "+datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f'))
                if (JSON==True):
                    try:
                        req = json.loads(req)
                    except:
                        print("error!req is not JSON\n")
                        pass
                if(not once):
                    if(original != False):
                        data.append({"req":req,"org":original})
                    else:
                        data.append({"req":req})
                else: #once
                    if(original != False):
                        return {"req":req,"org":original}
                    else:
                        return req
            
                
    tasks = []
    ty=type(req_list)
    if(ty == list):
        for obj in req_list:
            if("org" in obj):
                tasks.append(asyncio.ensure_future(_get(obj["url"],JSON,obj["org"])))
            else:
                tasks.append(asyncio.ensure_future(_get(obj["url"],JSON)))
    elif(ty == dict):
        if("org" in req_list):
            return loop.run_until_complete(_get(req_list["url"],JSON,req_list["org"],True))
        else:
            return loop.run_until_complete(_get(req_list["url"],JSON,False,True))
    else:#str
        return loop.run_until_complete(_get(req_list,JSON,False,True))

    loop.run_until_complete(asyncio.wait(tasks))
    return data

# ==============================================================
#                         讀取steam帳號列表
# ==============================================================

@eel.expose
def get_client_users():
    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,"SOFTWARE\Valve\Steam", 0, winreg.KEY_QUERY_VALUE) 
    path , t = winreg.QueryValueEx(key, "SteamPath")
    users = {}

    path+="/config/loginusers.vdf"

    with open(path,"r",encoding="utf-8") as file :
        users = vdf.load(file)

    winreg.CloseKey(key)
    users = users["users"]

    rewrite = False
    for key,val in users.items():
        if("AccountID" not in val):
            users[key]["AccountID"] = str(Sid.SteamID(key).id)
            rewrite = True

    if(rewrite):
        print("重寫 loginusers.")
        with open(path,"w",encoding="utf-8") as file :
            vdf.dump({"users":users},file)
    return(users)

# ==============================================================
#                           刪除steam帳號
# ==============================================================

@eel.expose
def del_client_user(steamID):
    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,"SOFTWARE\Valve\Steam", 0, winreg.KEY_QUERY_VALUE) 
    path , t= winreg.QueryValueEx(key, "SteamPath")
    users = {}

    with open(path+"/config/loginusers.vdf","r",encoding="utf-8") as file :
        users = vdf.load(file)
        del users["users"][steamID]
    
    with open(path+"/config/loginusers.vdf","w",encoding="utf-8") as file :
        vdf.dump(users,file)



class wait_lock:
  def __init__(self, lock):
    self.lock = lock

  def __enter__(self):
    while(self.lock.locked() == True):
        eel.sleep(.1)
    self.lock.acquire()

  def __exit__(self, b, c, d):
    while(self.lock.locked() == True):
        eel.sleep(.1)
    
#steam_lock
login_lock = threading.Lock()

# ==============================================================
#                         普通登入steam帳號
# ==============================================================

@eel.expose
def auto_login(steamid,name):
    if('login_sys' not in vars()):
        global login_sys
        login_sys = __import__("python.login_steam",fromlist="*")
    with wait_lock(login_lock):
        t = threading.Thread(target = login_sys.auto_login , args=(steamid,name,login_lock,))
        t.start()

# ==============================================================
#                        系統模擬登入steam帳號
# ==============================================================

@eel.expose
def user_login(steamid):
    if('login_sys' not in vars()):
        global login_sys
        login_sys = __import__("python.login_steam",fromlist="*")
    with wait_lock(login_lock):
        t = threading.Thread(target = login_sys.login,args=(steamid,login_lock,))
        t.start()
        