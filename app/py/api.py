import os
import eel,winreg,datetime,vdf,json,asyncio,aiohttp
from . import login_steam
import threading

# ==============================================================
#                         外抓系統
# ==============================================================

@eel.expose #req_list:list|dict|str
def get(req_list,JSON = True):
    data=[]
    from .main import loop

    #設置async取得
    async def _get(url,JSON,original=False,once=False):
        start_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')
        print("start "+start_time)
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                req = await response.text()
                get_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')
                print("req "+get_time)
                eel.info(
                    "要求已得到",
                    "送出時間:"+start_time+
                    "\n取得時間:"+get_time,
                    "console",
                    )
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


# ==============================================================
#                         鎖等待
# ==============================================================
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
    with wait_lock(login_lock):
        t = threading.Thread(target = login_steam.auto_login , args=(steamid,name,login_lock,))
        t.start()

# ==============================================================
#                        系統模擬登入steam帳號
# ==============================================================

@eel.expose
def user_login(steamid):
    with wait_lock(login_lock):
        t = threading.Thread(target = login_steam.login,args=(steamid,login_lock,))
        t.start()
