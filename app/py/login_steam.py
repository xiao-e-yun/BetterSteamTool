import winreg,subprocess,eel
from pywinauto import Application as APP
from pywinauto import keyboard
from pywinauto import timings
from time import sleep
from steam import guard
import steam
from .main import get_task,get_account_list,get_client_users

def call_info(steamid):
    try:
        acc = get_account_list(False,True)
        acc = acc[steamid]
    except:
        return False
    name=acc["name"]
    password=acc["password"]
    if("guard" in acc):
        se = acc["guard"]
    else:
        se = False
    return {"name":name,"password":password,"se":se}

def close_steam(exe,si):
    if(get_task("steam.exe")):
        subprocess.Popen(exe+" -shutdown", startupinfo=si,shell=True)
        while(get_task("steam.exe") != False):
            sleep(.4)

def auto_login(steamid,name,lock):
    eel.info("使用快取登入","使用者名稱:"+name+"\nsteamid:"+steamid,"console")
    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,"SOFTWARE\Valve\Steam", 0, winreg.KEY_ALL_ACCESS)
    winreg.SetValueEx(key, "AutoLoginUser", 0, winreg.REG_SZ, name)
    winreg.SetValueEx(key, "RememberPassword", 0, winreg.REG_DWORD, 0x00000001)
    exe, t = winreg.QueryValueEx(key, "SteamExe")
    winreg.CloseKey(key)

    si = subprocess.STARTUPINFO()
    si.dwFlags |= subprocess.STARTF_USESHOWWINDOW

    eel.info("關閉Steam","","console")
    close_steam(exe,si)

    eel.info("啟動steam","","console")
    app = APP().start(exe)
    Steam = app.window(title='Steam', class_name='vguiPopupWindow')
    login_gui = app.window(title_re='Steam [^Guard].*', class_name='vguiPopupWindow')

    def waiter():
        i = 0
        eel.info("等待 '登入中 頁面'","","console")

        try:
            Steam.wait("ready",30)
            Steam.wait_not("ready",30)
        except:
            eel.info("偵測到超時","即將重啟steam","error")
            eel.info("偵測超時，重啟steam","","console")
            auto_login(steamid,name,lock)
            return "BSnone"

        eel.info("等待 '主頁面'","","console")
        eel.sleep(.5)
        while True:
            guis = {Steam:True,login_gui:False}
            for gui,val in guis.items():
                try:
                    gui.wait("ready",.1)#等待介面
                    return val
                except:
                    pass
            i +=1 #等待.2s
            if(i >= (25 * 5)):#timeout 25s
                i = 0
                return True
        
    code = waiter()
    if(code == "BSnone"):
        eel.info("已轉交控制權","","console")
    else:
        if(code ==False): #需要模擬登入
            eel.info("注意!","無法使用快取登入\n將使用模擬登入","console")
            login(steamid,_app=app,force=True)

        del app
        lock.release()
        eel.info("登入成功","","console")



def login(steamid,lock=False,_app=False,force=False):
    eel.info("使用模擬登入","steamid:"+steamid+"\n強制模式:"+("是" if force else "否"),"console")
    acc = call_info(steamid)

    if(force == False and (steamid in get_client_users())):
        eel.info("模式切換","偵測到快取模式\n轉為快取模式","console")
        auto_login(steamid,acc["name"],lock)
        return

    if(acc == False):
        eel.info("無帳號","","error")
        return "no_account"

    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,"SOFTWARE\Valve\Steam", 0, winreg.KEY_QUERY_VALUE) 
    exe , t = winreg.QueryValueEx(key, "SteamExe")
    winreg.CloseKey(key)

    si = subprocess.STARTUPINFO()
    si.dwFlags |= subprocess.STARTF_USESHOWWINDOW

    if(_app == False):#如果沒有到拾取app
        eel.info("關閉steam","","console")
        close_steam(exe,si)

    # str replace
    password = str.replace(acc["password"], " ", "{SPACE}")
    # set RememberPassword
    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,
                         "SOFTWARE\Valve\Steam", 0, winreg.KEY_SET_VALUE)
    winreg.SetValueEx(key, "RememberPassword", 0, winreg.REG_DWORD, 0x00000001)
    winreg.SetValueEx(key, "AutoLoginUser", 0, winreg.REG_SZ, "")
    winreg.CloseKey(key)
    # auto login
    if(_app == False):
        app = APP().start(exe)
    else:
        app = _app
    login_gui = app.window(
        title_re='Steam [^Guard].*', class_name='vguiPopupWindow')
    try:
        login_gui.wait("ready", 30)
    except timings.TimeoutError:
        eel.info("等待超時","","console")
        del app
        if(lock != False):
            lock.release()
        return "error"

    eel.info("自動登入","登入頁面 已就緒\n開始自動輸入","console")
    login_gui.set_focus()
    sleep(.1)
    if(_app == False):
        eel.info("自動輸入名稱 [未輸入名稱]","","console")
        keyboard.send_keys(acc["name"]+"""{TAB}""")
    eel.info("自動輸入密碼","","console")
    keyboard.send_keys(password+"""{TAB}{ENTER}""")

    if(acc["se"] == False): #guard
        eel.info("無guard","跳過guard登入頁面","console")  
    else:
        eel.info("等待guard","已添加guard\n自動輸入guard","console")
        sa = guard.SteamAuthenticator(acc["se"])
        guard_gui = app.window(title_re='Steam Guard - .*',class_name='vguiPopupWindow')

        guard_gui.wait("ready")
        guard_gui.set_focus()
        sleep(.1)

        code = sa.get_code()
        keyboard.send_keys(code+"""{ENTER}""")
    eel.info("等待登入頁面被關閉","","console")
    login_gui.wait_not("visible", 60000)
    eel.info("登入完成","","console")
    del app
    if(lock != False):
        lock.release()