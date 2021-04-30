#
#   後臺主程序
#   帳戶控制器
#
import eel,logging,steam,os

def start():
    path = os.getcwd()
    print(path)
    if(not os.path.exists('data')):#已創建
        os.mkdir(path+'/data')
        print("creat data")
    
    

if __name__ == '__main__':
    start()