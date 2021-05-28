# -*- mode: python ; coding: utf-8 -*-


block_cipher = None


a = Analysis(['app/index.py'],
             pathex=['C:\\Users\a0970\\Desktop\\project'],
             binaries=[],
             datas=[
                ('C:\\Users\\a0970\\AppData\\Local\\Programs\\Python\\Python39\\lib\\site-packages\\eel\\eel.js', 'eel'),
                ('app\\gui', 'gui')
                ],
             hiddenimports=[
                'steampy',
                'bottle_websocket',
                'py'
                ],
             hookspath=[],
             runtime_hooks=[],
             excludes=['app\\gui\\**\\*.map'],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=False,
			 )
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          [],
          exclude_binaries=True,
          name='Bsteam',
          debug=False,
          bootloader_ignore_signals=False,
          strip=False,
          upx=True,
          console=False,
          icon="C:\\Users\\a0970\\Desktop\\project\\app\\logo.ico"
		  )
coll = COLLECT(exe,
               a.binaries,
               a.zipfiles,
               a.datas,
               strip=False,
               upx=True,
               upx_exclude=[],
               name='Bsteam'
			   )
