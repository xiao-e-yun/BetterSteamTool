import winreg,subprocess
from pywinauto import Application as APP
from pywinauto import keyboard
from pywinauto import timings
from time import sleep, time
from steam import guard
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
    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,"SOFTWARE\Valve\Steam", 0, winreg.KEY_ALL_ACCESS)
    winreg.SetValueEx(key, "AutoLoginUser", 0, winreg.REG_SZ, name)
    exe, t = winreg.QueryValueEx(key, "SteamExe")
    winreg.CloseKey(key)

    si = subprocess.STARTUPINFO()
    si.dwFlags |= subprocess.STARTF_USESHOWWINDOW

    close_steam(exe,si)

    app = APP().start(exe)
    Steam = app.window(title='Steam', class_name='vguiPopupWindow')
    login_gui = app.window(title_re='Steam [^Guard].*', class_name='vguiPopupWindow')

    def waiter():
        i = 0
        sleep(6)
        while True:
            guis = [Steam,login_gui]
            for gui in guis:
                try:
                    gui.wait("ready",.1)#等待介面
                    return True
                except:
                    pass
            i +=1 #等待.2s
            if(i >= (25 * 5)):#timeout 25s
                i = 0
                close_steam(exe,si)
                return True
        

    if(waiter()==False): #需要模擬登入
        login(steamid,_app=app,force=True)

    del app
    lock.release()



def login(steamid,lock=False,_app=False,force=False):

    acc = call_info(steamid)

    if(force == False and (steamid in get_client_users())):
        auto_login(steamid,acc["name"],lock)
        return

    if(acc == False):
        return "no_account"

    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,"SOFTWARE\Valve\Steam", 0, winreg.KEY_QUERY_VALUE) 
    exe , t = winreg.QueryValueEx(key, "SteamExe")
    winreg.CloseKey(key)

    si = subprocess.STARTUPINFO()
    si.dwFlags |= subprocess.STARTF_USESHOWWINDOW

    if(_app == False):#如果沒有到拾取app
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
        print("unknow")
        del app
        if(lock != False):
            lock.release()
        return "error"
    login_gui.set_focus()
    sleep(.1)
    if(_app == False):
        keyboard.send_keys(acc["name"]+"{TAB}")
    keyboard.send_keys(password+"{TAB}{ENTER}")

    if(acc["se"] != False): #guard
        sa = guard.SteamAuthenticator(acc["se"])
        print("have guard")
        guard_gui = app.window(title_re='Steam Guard - .*',class_name='vguiPopupWindow')
        try:
            guard_gui.wait("ready")
        except timings.TimeoutError:
            print("timeout")
            del app
            if(lock != False):
                lock.release()
            pass
        guard_gui.set_focus()
        sleep(.1)
        keyboard.send_keys(sa.get_code()+"{ENTER}")
    login_gui.wait_not("visible", 60000)
    del app
    if(lock != False):
        lock.release()

if __name__ == '__main__':
    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,
                         "SOFTWARE\Valve\Steam", 0, winreg.KEY_QUERY_VALUE)
    exe, t = winreg.QueryValueEx(key, "SteamExe")
    winreg.CloseKey(key)
    u = input("username:")
    p = input("password:")
    login(u, p, exe)
