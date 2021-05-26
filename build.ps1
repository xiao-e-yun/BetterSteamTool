param([AllowEmptyString()][string]$a)

if(($a -eq "sass")-or($a -eq "scss")-or($a -eq "")){
    Write-Output("build SCSS")
    Start-Process powershell -windowstyle Hidden 'sass --no-source-map scss/:app/gui/css/'
}
if(($a -eq "typescript")-or($a -eq "ts")-or($a -eq "")){
    Write-Output("build TypesSript")
    Start-Process powershell -windowstyle Hidden 'tsc'
}