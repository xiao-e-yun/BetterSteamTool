from time import perf_counter, time
import eel,json
from steam import guard
import steam.webauth as wa
from python.main import get_account_list,path

@eel.expose
def import_shared_secret(mafile,notest=False):  # mafile
    mafile = json.loads(mafile)
    Sid = str(mafile["Session"]["SteamID"])
    acc = get_account_list(False,True)
    if(Sid not in acc):
        return "acc_not_found"
    
    user_conf = acc[Sid]

    if(notest == False):
        try:
            user_login= wa.MobileWebAuth(user_conf["name"])
            sa = guard.SteamAuthenticator(mafile)
            code = sa.get_code()
            user_login.login(user_conf["password"],twofactor_code=code)
        except:
            return "login_error"

    user_path = path+"user_config/"+user_conf["name"]+".json"
    with open(user_path,"r") as file:
        user_conf = json.load(file)
        
    user_conf["guard"] = mafile

    with open(user_path,"w") as file:
        json.dump(user_conf,file)
    return True

@eel.expose
def get_2FA():
    acc = get_account_list(False,True)
    req = {"twoFA":{}}

    sa_time=guard.SteamAuthenticator()
    time=30-(sa_time.get_time()%30)
    req["reload_time"]=time*1000

    for Sid,data  in acc.items():
        if("guard" in data):
            sa = guard.SteamAuthenticator(data["guard"])
            req["twoFA"][Sid] = sa.get_code()

    return req

@eel.expose
def shared_secret_to_2FA(req:str):
    se = json.loads(req)
    sa = guard.SteamAuthenticator(se)
    return sa.get_code()