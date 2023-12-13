@echo off
cd "C:\Users\user\Desktop\"
start SpannedScreen.lnk
start rs2wsBlob.lnk
cd "C:\Users\user\Desktop\\2023_Pressentation\"
TIMEOUT /t 15
start chrome --start-fullscreen http://localhost:8080
py -m http.server 8080

