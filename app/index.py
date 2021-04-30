#module
import eel,logging,steam,os
from python import guard,api,main
logging.basicConfig(level=logging.INFO)

main.start()
guard.load_user()

eel.init(os.path.dirname(os.path.abspath(__file__))+'\gui')
eel.start('index.html',
    suppress_error=True,
    size = (300,600),
    mode='edge',
)