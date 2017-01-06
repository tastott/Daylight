cd daylight
call npm install
call typings install
cd ../

cd daylight-cli
call npm install
call typings install
call npm link ../daylight
cd ../