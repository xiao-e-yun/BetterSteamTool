from steam import guard
from python.main import get_account_list
import eel,winreg,datetime,vdf,json,asyncio,aiohttp,subprocess
import steam.steamid as Sid
from steam import guard
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

# ==============================================================
#                         普通登入steam帳號
# ==============================================================

@eel.expose
def auto_login(name):
    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,"SOFTWARE\Valve\Steam", 0, winreg.KEY_ALL_ACCESS ) 
    winreg.SetValueEx(key,"AutoLoginUser",0,winreg.REG_SZ,name)
    exe , t = winreg.QueryValueEx(key, "SteamExe")
    si = subprocess.STARTUPINFO()
    si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    subprocess.Popen('taskkill /f /IM steam.exe /FI "STATUS eq RUNNING" & '+exe+"& exit", startupinfo=si,shell=True)
    winreg.CloseKey(key)

# ==============================================================
#                        系統模擬登入steam帳號
# ==============================================================

@eel.expose
def user_login(steamid):
    try:
        acc = get_account_list(False,True)
        acc = acc[steamid]
    except:
        return False
    name=acc["name"]
    password=acc["password"]
    if("guard" in acc):
        se = acc["guard"]
        sa = guard.SteamAuthenticator(se)

    print("username:"+name+"\npassword:"+password)

    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,"SOFTWARE\Valve\Steam", 0, winreg.KEY_QUERY_VALUE) 
    exe , t = winreg.QueryValueEx(key, "SteamExe")
    winreg.CloseKey(key)

    si = subprocess.STARTUPINFO()
    si.dwFlags |= subprocess.STARTF_USESHOWWINDOW

    subprocess.Popen('taskkill /f /IM steam.exe /FI "STATUS eq RUNNING" & exit', startupinfo=si,shell=True)
    from python import login_steam
    login_steam.login(name,password,exe,sa)
    Suser = get_client_users()
    if(steamid not in Suser):
        return True
    else:
        return False