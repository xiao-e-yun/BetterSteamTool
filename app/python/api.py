import eel,steam,os,winreg,datetime,vdf,requests,json,asyncio,aiohttp
import steam.steamid as Sid
loop = asyncio.get_event_loop()

@eel.expose
def get_client_users():
    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,"SOFTWARE\Valve\Steam", 0, winreg.KEY_QUERY_VALUE) 
    path , type = winreg.QueryValueEx(key, "SteamPath")
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
                    eel.get_req(json.loads(req),original)
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
def auto_login(name):
    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,"SOFTWARE\Valve\Steam", 0, winreg.KEY_SET_VALUE ) 
    winreg.SetValueEx(key,"AutoLoginUser",0,winreg.REG_SZ,name)
    os.system('taskkill /f /IM "steam.exe" & start steam:')
    winreg.CloseKey(key)
