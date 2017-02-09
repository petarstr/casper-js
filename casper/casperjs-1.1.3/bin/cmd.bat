@echo off
for /f "tokens=*" %%a in (genres.txt) do (
  casperjs.exe test.js --genre=%%a --cookies-file=cookies.txt
)
echo "Error: Loop ended"
pause