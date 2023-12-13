@echo off
cd "C:\Users\user\Desktop\"
echo --resize screen and start realsense
start SpannedScreen.lnk
start rs2wsBlob.lnk
TIMEOUT /t 5
echo --delete current poster
DEL /f /s /q  "C:\Users\user\Desktop\2023_Presentation\Student_Posters\Poster" 
TIMEOUT /t 5
echo --add new poster
xcopy /s "C:\Users\user\Desktop\Poster" "C:\Users\user\Desktop\2023_Presentation\Student_Posters\Poster"
TIMEOUT /t 15
cd "C:\Users\user\Desktop\2023_Presentation\"
start chrome --start-fullscreen http://localhost:8080
py -m http.server 8080

