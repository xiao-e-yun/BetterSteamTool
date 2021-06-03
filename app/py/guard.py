import eel,json,sys
from steam import guard
import steam.webauth as wa
from .main import get_account_list,path,user_conf
from steampy.client import SteamClient

# ==============================================================
#                       發出交易提示
# ==============================================================

steam_session={}
@eel.expose
def post_confirmation(steamid,api,val,trade_id):
    user = user_conf(steamid)
    try:
        try:
            client=steam_session[steamid]
            print("use steampy cache")
        except:
            print("use steampy login")
            g = user["guard"]
            g["steamid"] = steamid
            Sguard = json.dumps(g)
            client = SteamClient(api)
            client.login(user["name"], user["password"],Sguard)
            globals()["steam_session"][steamid]=client
        if(val):
            try:
                client._confirm_transaction(trade_id)
            except:
                client.accept_trade_offer(trade_id)
        else:
            client.cancel_trade_offer(trade_id)
            client.decline_trade_offer(trade_id)
                
        return {"success":True}
    except Exception as e:
        exc_type, exc_obj, exc_tb = sys.exc_info()
        return {"success":False,
            "err_type":e.__class__.__name__,
            "err_info":e.args[0],
            "err_line":str(exc_tb.tb_lineno)
        }
# ==============================================================
#                          　設置guard
# ==============================================================

@eel.expose
def guard_phone(type,a=False,b=False,c=False):
    if(type=="login"):
        try:
            g:BSguard = globals()["BSguard_"+a]#a = steamid ,b = oauth ,c = name
        except:
            g = globals()["BSguard_"+a] = BSguard(c,b,a)
        try:
            return g.status()
        except:
            return "oauth_error"
    else:
        g:BSguard = globals()["BSguard_"+a]

        if(type=='has_phone'):
            return g.has_phone()

        elif(type=="add_phone"):#b=phone_number
            try:
                g.add_phone_num(b)
                return True
            except:
                return False
        elif(type=="cfm_mail"):
            return g.cfm_mail()["success"]

        elif(type=="cfm_phone_num"):#b=SMS_code
            return g.sa.confirm_phone_number(b)

        elif(type=="send_phone"):#a=steamid
            try:
                g.sa.add()
                user_conf(a,{"guard":g.sa.secrets})
                return True
            except:
                return False
        elif(type=="finalize"):#b=SMS_code
            try:
                g.sa.finalize(b)
                return True
            except:
                return False

class BSguard:
    def __init__(self,name:str,oauth:str,steamid:str) -> None: #創建驗證器
        self.name = name
        self.oauth = oauth
        self.steamid = steamid
        self.wa = wa.MobileWebAuth(name)
        try:
            self.wa.oauth_login(oauth,steamid)
        except:
            return print("oauth_error")
        self.sa = guard.SteamAuthenticator(backend=self.wa)

    def status(self):
        return self.sa.status()["steamguard_scheme"]

    def has_phone(self):
        return self.sa.has_phone_number()

    def add_phone_num(self,num=False): #新增電話號碼
        if(self.sa.has_phone_number()==True):#無電話
            return "BStrue"
        if(num!=False):
            self.sa.add_phone_number(num)

    def cfm_mail(self):
        sess = self.sa._get_web_session()

        try:
            resp = sess.post('https://steamcommunity.com/steamguard/phoneajax',
                             data={
                                 'op': 'email_confirmation',
                                 'arg': '',
                                 'checkfortos': 1,
                                 'skipvoip': 1,
                                 'sessionid': sess.cookies.get('sessionid', domain='steamcommunity.com'),
                                 },
                             timeout=15).json()
        except:
            return {'fatal': True, 'success': False}

        return resp

# ==============================================================
#                           取得API
# ==============================================================

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
