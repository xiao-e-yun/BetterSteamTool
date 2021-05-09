import eel,logging,steam,os,socket
from python import guard,api,main
logging.basicConfig(level=logging.INFO)

def check_port_in_use(): #檢視port
    s = None

get_port = {"Status":False,"Port":8701}

while not get_port["Status"]:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1)
        s.connect(('127.0.0.1', get_port["Port"]))
        get_port["Status"] = False
    except socket.error:
        get_port["Port"]+=1
        get_port["Status"] = True
    finally:
        if s:
            s.close()


def close_callback():
    eel.close()

if(not check_port_in_use()):
    main.start()
    guard.load_user()

    eel.init(os.path.dirname(os.path.abspath(__file__))+'\gui')
    eel.start('index.html',
        port = get_port["Port"],
        suppress_error=True,
        size = (300,600),
        mode='edge',
    )