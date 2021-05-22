param([AllowEmptyString()][string]$a)
if($a -eq ""){
Write-Output("build js & css")
sass --no-source-map --load-path=scss scss/:app/gui/css/;
tsc;
}
#
Write-Output("build exe")
pipenv run pyinstaller app_build.spec -y
#
Write-Output("all done")