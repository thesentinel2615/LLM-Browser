@echo off

git pull

npm install && npm run pyinstall && python -m playwright install && npm run dev
