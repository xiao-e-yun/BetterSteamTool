#
#   後臺主程序
#   帳戶控制器
#
import re
import pythoncom
import vdf
from win32com.client import GetObject as win32_cli
import eel
import winreg
import os
import sys
import json
import asyncio
import datetime
import aiohttp
import steam.webauth as wa
import steam.steamid as Sid
import steam.webapi as SAPI

path = os.getcwd() + '/data/'


def start():
    print("start check")
    global loop
    loop = asyncio.get_event_loop()
    #new config
    if(not os.path.exists('data')):
        os.mkdir(path)
        os.mkdir(path+'user_config')
        with open(path+"settings.json", "w") as f:
            wr = {'key': '','user_config_index':{},"wait_steam_start": "10"}
            json.dump(wr, f)

        print("create data")

    #build user config index
    user_path = path + "user_config/"
    config_users_list = os.listdir(user_path)
    app_users_list = list(app_setting("user_config_index").values())

    if(config_users_list != app_users_list):
        print("set user config index")
        index_file = {}
        for account in config_users_list:
            if(account[-5:] == ".json"):
                with open(user_path + account, "r") as f:
                    file = json.load(f)
                    index = file["steam_id"]
                    index_file[index] = account

        app_setting("user_config_index",index_file)
    

# ==============================================================
#                         系統設置修改
# ==============================================================

@eel.expose
def app_setting(key="BSnone", val="BSnone") -> any:
    with open(path+"settings.json", "r") as f:
        conf = json.load(f)
        if(key == "BSnone"):
            return conf
    if(val == "BSnone"):
        try:
            return conf[key]
        except:
            return "BSnone"
    else:
        conf[key] = val
        with open(path+"settings.json", "w") as f:
            json.dump(conf, f)

# ==============================================================
#                           測試api
# ==============================================================


@eel.expose
def get_steam_web_api(key=False):
    if(key == False):
        with open(path+"settings.json", "r") as f:
            conf = json.load(f)
        try:
            api = conf["steam_api_key"]
        except:
            return False
    try:
        SAPI.WebAPI(key=api)
    except:
        return False
    return api
       
# ==============================================================
#                        設置帳號
# ==============================================================

@eel.expose
def user_conf(steamid:str="BSnone",value:dict="BSnone"):
    if(steamid=="BSnone"):
        return app_setting("user_config_index")
    user_path = os.getcwd() + "/data/user_config/"
    user = app_setting("user_config_index")
    user_file = user_path+user[steamid]

    with open(user_file,"r") as f:
        req_type = json.load(f)
        
    if(value=="BSnone"):
        return req_type
    elif(type(value) == dict):
        for key,val in value.items():
            req_type[key] = val
            with open(user_file,"w") as f:
                json.dump(req_type,f)

# ==============================================================
#                           顯示帳號
# ==============================================================

@eel.expose
def get_account_list(stop_api=False, no_avatar=False):
    user_path = path + "user_config/"
    _list = os.listdir(user_path)
    users = {}

    if(no_avatar):
        for account in _list:
            if(account[-5:] == ".json"):
                with open(user_path + account, "r") as f:
                    file = json.load(f)

                users[str(file["steam_id"])] = file
        return users

    with open(path+"settings.json", "r") as f:
        conf = json.load(f)

    api = get_steam_web_api()

    print("steamAPI status:"+str(api))

    tasks = []

    async def get(url, sid, type):
        print("start "+datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f'))
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                req = json.loads(await response.text())
                print("req "+datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f'))
                if(type == "CDN"):
                    data = {
                        "persona_name": req["persona_name"],
                        "avatar_url": req["avatar_url"]
                    }
                    users[sid] = {**users[sid], **data}

                else:  # Api
                    req = req["response"]["players"]
                    for q in req:
                        data = {
                            "persona_name": q["personaname"],
                            "avatar_url": q["avatarfull"]
                        }
                        users[q["steamid"]] = {**users[q["steamid"]], **data}

    if (api == False or stop_api == True):  # use CDN

        for account in _list:
            if(account[-5:] == ".json"):
                with open(user_path + account, "r") as f:
                    file = json.load(f)

                users[str(file["steam_id"])] = file
                url = 'https://steamcommunity.com/miniprofile/' + \
                    str(file["account_id"])+'/json'
                tasks.append(asyncio.ensure_future(
                    get(url, str(file["steam_id"]), "CDN")))

    else:  # webAPi
        steamids = []

        for account in _list:
            if(account[-5:] == ".json"):
                with open(user_path + account, "r") as f:
                    file = json.load(f)

                users[str(file["steam_id"])] = file
                steamids.append(str(file["steam_id"]))

        def tolist():
            for i in range(0, len(steamids), 100):
                yield steamids[i:i + 100]
        dot = ","
        for user in list(tolist()):
            url = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + \
                str(conf["steam_api_key"])+'&steamids='+dot.join(user)
            tasks.append(asyncio.ensure_future(get(url, "", "API")))

    if (len(_list) == 0):
        return {}
    else:
        loop.run_until_complete(asyncio.wait(tasks))
        return users

# ==============================================================
#                           bs登入帳號
# ==============================================================


@eel.expose
def captcha_url():
    return create_acc.captcha_gid


@eel.expose
def create_account(lvl, data):  # 引入帳號
    if(lvl == "login"):
        global create_acc, acc_setting

        create_acc = wa.MobileWebAuth(data["username"], data["password"])

        try:
            if("2FA" in data):
                create_acc.login(twofactor_code=data["2FA"])
            else:
                create_acc.login()
        except wa.LoginIncorrect:
            next = 'accpwd'
        except wa.HTTPError:
            next = 'HTTPError'
        except wa.CaptchaRequired:
            next = 'Captcha'
        except wa.EmailCodeRequired:
            next = 'email'
        except wa.TwoFactorCodeRequired:
            next = '2FA'
        except:
            next = sys.exc_info()[0]
        else:
            next = True

        print("try login")
    elif(lvl == "Captcha"):
        try:
            create_acc.login(email_code=data["Captcha"])
        except wa.CaptchaRequired:  # 代碼錯誤
            next = "Captcha"
        except wa.EmailCodeRequired:
            next = 'email'
        except wa.TwoFactorCodeRequired:
            next = '2FA'
        else:
            next = True
    elif(lvl == "email"):
        try:
            create_acc.login(email_code=data["email"])
        except wa.EmailCodeRequired:  # 代碼錯誤
            next = False
        else:
            next = True
    elif(lvl == "2FA"):
        try:
            create_acc.login(twofactor_code=data["2FA"])
        except wa.TwoFactorCodeRequired:  # 代碼錯誤
            next = False
        else:
            next = True

    if(next == True):  # 保存資料
        try:
            with open(path+"user_config/"+data["username"]+".json",'r') as fcfg:
                org = json.load(fcfg)
        except:
            org = {}

        with open(path+"user_config/"+data["username"]+".json", "w+") as fcfg:
            user_data = {
                "name": data["username"],
                "password": data["password"],
                "oauth": create_acc.oauth_token,
                "steam_id": create_acc.steam_id,
                "account_id": Sid.SteamID(create_acc.steam_id).id,
                "session_id": create_acc.session_id
            }
            json.dump({**org,**user_data}, fcfg)
            print("create user config [\""+data["username"]+"\"]")

    return next

# ==============================================================
#                         讀取steam帳號列表
# ==============================================================


@eel.expose
def get_client_users():
    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,
                         "SOFTWARE\Valve\Steam", 0, winreg.KEY_QUERY_VALUE)
    path, t = winreg.QueryValueEx(key, "SteamPath")
    users = {}

    path += "/config/loginusers.vdf"

    with open(path, "r", encoding="utf-8") as file:
        users = vdf.load(file)

    winreg.CloseKey(key)
    users = users["users"]

    rewrite = False
    for key, val in users.items():
        if(users[key]["RememberPassword"] == 0):
            users.pop(key, None)
            continue
        if("AccountID" not in val):
            users[key]["AccountID"] = str(Sid.SteamID(key).id)
            rewrite = True

    if(rewrite):
        print("重寫 loginusers.")
        with open(path, "w", encoding="utf-8") as file:
            vdf.dump({"users": users}, file)
    return(users)
    
# ==============================================================
#                            嘗試登入系統
# ==============================================================

@eel.expose
def test_login(Sid,get_API=False):
    try:
        conf = user_conf(Sid)
        sa = wa.MobileWebAuth(conf["name"])
        se = sa.oauth_login(conf["oauth"],str(conf["steam_id"]),"tchinese")
    except:
        return "account"
    if(get_API):
        try:
            req = se.get("https://steamcommunity.com/dev/apikey")
            regex = r"(?<=<p>序號:\ ).{32}(?=<\/p>)"
            matches = re.search(regex, req.text)
            if matches:#無API
                return matches.group()
            raise Warning("")
        except Warning:#
            se.post("https://steamcommunity.com/dev/registerkey",{
                "domain":"generate.by.BSteam",
                "agreeToTerms":"agreed",
                "sessionid":sa.session_id
            })
            req = se.get("https://steamcommunity.com/dev/apikey")
            regex = r"(?<=<p>序號:\ ).{32}(?=<\/p>)"
            matches = re.search(regex, req.text)
            if matches:#無API
                return matches.group()
            return "api_error"
    return sa.session_id

# ==============================================================
#                     查看進程是否運行
# ==============================================================

@eel.expose
def to_steamid(steamid,to_account_id=False):
    Steam = Sid.SteamID(steamid)
    if(to_account_id):
        #accountID
        return str(Steam.as_32)
    else:
        #steamID
        return str(Steam.as_64)

# ==============================================================
#                     查看進程是否運行
# ==============================================================

def get_task(task_name):
    pythoncom.CoInitialize()
    is_exist = False
    wmi = win32_cli('winmgmts:')
    processCodeCov = wmi.ExecQuery(
        'select * from Win32_Process where name=\"%s\"' % (task_name))
    if len(processCodeCov) > 0:
        is_exist = True
    return is_exist

if __name__ == '__main__':
    start()
