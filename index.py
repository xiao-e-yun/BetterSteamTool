import eel
import re
import json
import base64
import numpy as np
from PIL import Image
from io import BytesIO


eel.init('gui') 
eel.start('index.html',suppress_error=True,size = (300,600))