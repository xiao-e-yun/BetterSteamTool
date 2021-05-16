import eel,winreg,datetime,vdf,json,asyncio,aiohttp,subprocess
import steam.steamid as Sid
loop = asyncio.get_event_loop()

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
        if(val["RememberPassword"] == "0"):
            users[key]["RememberPassword"] = 1
            rewrite = True
        if("AccountID" not in val):
            users[key]["AccountID"] = str(Sid.SteamID(key).id)
            rewrite = True

    if(rewrite):
        print("重寫 loginusers.")
        with open(path,"w",encoding="utf-8") as file :
            vdf.dump({"users":users},file)
    return(users)

@eel.expose
def get(urls,original,JSON = True):
    async def _get(url,JSON,original):
        print("start "+datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f'))
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                req = await response.text()
                print("req "+datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f'))
                if (JSON==True):
                    try:
                        eel.get_req(json.loads(req),original)
                    except:
                        print("錯誤!\n" + req)
                        eel.get_req("",original)
                else:
                    eel.get_req(req,original)

    if (type(urls) is list and type(original) is list ):
        tasks = []
        for url,original in zip(urls,original):
            tasks.append(asyncio.ensure_future(_get(url,JSON,original)))
        loop.run_until_complete(asyncio.wait(tasks))
    else:
        loop.run_until_complete(_get(urls,JSON,original))

@eel.expose
def del_client_user(steamID):
    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,"SOFTWARE\Valve\Steam", 0, winreg.KEY_QUERY_VALUE) 
    path , type = winreg.QueryValueEx(key, "SteamPath")
    users = {}

    with open(path+"/config/loginusers.vdf","r",encoding="utf-8") as file :
        users = vdf.load(file)
        print(users)
        del users["users"][steamID]
    
    with open(path+"/config/loginusers.vdf","w",encoding="utf-8") as file :
        vdf.dump(users,file)


@eel.expose
def auto_login(name):
    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,"SOFTWARE\Valve\Steam", 0, winreg.KEY_ALL_ACCESS ) 
    winreg.SetValueEx(key,"AutoLoginUser",0,winreg.REG_SZ,name)
    exe , t = winreg.QueryValueEx(key, "SteamExe")
    si = subprocess.STARTUPINFO()
    si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    subprocess.Popen('taskkill /f /IM steam.exe /FI "STATUS eq RUNNING" & '+exe+" -noverifyfiles  & exit", startupinfo=si,shell=True)
    winreg.CloseKey(key)

@eel.expose
def user_login(name,password,guard=False):
    print("username:"+name+"\npassword:"+password)

    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,"SOFTWARE\Valve\Steam", 0, winreg.KEY_QUERY_VALUE) 
    exe , t = winreg.QueryValueEx(key, "SteamExe")
    winreg.CloseKey(key)

    si = subprocess.STARTUPINFO()
    si.dwFlags |= subprocess.STARTF_USESHOWWINDOW

    subprocess.Popen('taskkill /f /IM steam.exe /FI "STATUS eq RUNNING" & exit', startupinfo=si,shell=True)
    from python import login_steam
    login_steam.login(name,password,exe,guard)
    return True