#module
import eel,logging,steam
logging.basicConfig(level=logging.INFO)

eel.init('gui')
eel.start('index.html',suppress_error=True,size = (300,600), mode='edge',cmdline_args=['--no-default-browser-check'],block=True)
logging.info("app ready")

from guard import *