#
#   後臺主程序
#   帳戶控制器
#
import eel,logging,steam,os,sys,json,requests
import steam.webauth as wa
import steam.steamid as Sid

def start():
    global path
    path = os.getcwd()
    if(not os.path.exists('data')):#已創建
        os.mkdir(path+'/data')
        os.mkdir(path+'/data/user_config')
        print("create data")
    path += '/data/'

#==============================================================
#                           顯示帳號
#==============================================================
@eel.expose
def get_account_list():
    user_path = path + "user_config/"
    _list = os.listdir(user_path)
    users = []
    for account in _list :

        if(account[-5:] == ".json") :
            file = {}
            with open(user_path + account,"r") as f :
                file = json.load(f)
            req = json.loads(requests.get('https://steamcommunity.com/miniprofile/' + str(file["account_id"]) + '/json').text)
            data = {
                "name" : account[:-5],
                "pwd" : file["password"],
                "oauth" : file['oauth'],
                "avatar_url" : req["avatar_url"],
                "lvl" : req["level"],
                "persona_name" : req["persona_name"],
            }
            try:
                data["bg"]=(list(req["profile_background"].values())[0])
            except:
                data["bg"]=False
            users.append(data)
            print(data)
    return users

#==============================================================
#                           登入帳號
#==============================================================
@eel.expose
def captcha_url():
    return create_acc.captcha_gid

@eel.expose
def create_account(lvl,data): #引入帳號
    if(lvl == "login"):
        global create_acc,acc_setting

        create_acc = wa.MobileWebAuth(data["username"],data["password"])

        try:
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
        except :
            next = 'unknow'
        else:
            next = True

        print("try login")
    elif(lvl == "Captcha"):
        try:
            newacc = create_acc.login(email_code=data["Captcha"])
        except wa.CaptchaRequired: #代碼錯誤
            next = "Captcha"
        except wa.EmailCodeRequired:
            next = 'email'
        except wa.TwoFactorCodeRequired:
            next = '2FA'
        else:
            next =  True
    elif(lvl == "email"):
        try:
            newacc = create_acc.login(email_code=data["email"])
        except wa.EmailCodeRequired: #代碼錯誤
            next = False
        else:
            next = True
    elif(lvl == "2FA"):
        try:
            newacc = create_acc.login(twofactor_code=data["2FA"])
        except wa.TwoFactorCodeRequired: #代碼錯誤
            next = False
        else:
            next = True

    if(next == True): #保存資料
        with open(path+"user_config/"+data["username"]+".json","w+") as fcfg :
            user_data = {"password":data["password"],"oauth":create_acc.oauth_token,"steam_id":create_acc.steam_id,"account_id":Sid.SteamID(create_acc.steam_id).id}
            json.dump(user_data,fcfg)
            print("create user config [\""+data["username"]+"\"]")

    return next

if __name__ == '__main__':
    start()