@echo off
setlocal
cd /d "%~dp0.."
echo === typing_game bootstrap ===
echo cwd=%CD%
where node
where npm
where git
node -v
npm -v
git --version

if not exist .git (
  git init
)

git remote remove origin 2>nul
git remote add origin https://github.com/kanta0410/typing_game.git
git remote -v

echo.
echo === npm install ===
call npm install
if errorlevel 1 goto :fail

echo.
echo === npm test ===
call npm test
if errorlevel 1 goto :fail

echo.
echo === git commit / push ===
git add -A
git status
git commit -m "Initial hiragana typing timing app"
git branch -M main
git push -u origin main

echo.
echo === DONE ===
echo Start with: npm run dev
echo Then open http://localhost:5173
pause
exit /b 0

:fail
echo FAILED
pause
exit /b 1
