#module
import eel,logging,steam,os
logging.basicConfig(level=logging.INFO)


eel.init(os.path.dirname(os.path.abspath(__file__))+'\gui')
eel.start('index.html',suppress_error=True,size = (300,600), mode='edge',cmdline_args=['--no-default-browser-check'],block=True)
logging.info("app ready")

from guard import *