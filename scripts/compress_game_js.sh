#! /bin/bash

JS_PATH=/home/wkl/acapp/game/static/js/
JS_PATH_DIST=${JS_PATH}dist/
JS_PATH_SRC=${JS_PATH}src/

# 使用terser对js加密的的命令,为了调试方便,先不使用
# find ${JS_PATH_SRC} -type f -name '*.js' | sort | xargs cat | terser -c -m > ${JS_PATH_DIST}game.js

find ${JS_PATH_SRC} -type f -name '*.js' | sort | xargs cat > ${JS_PATH_DIST}game.js
echo yes | python3 manage.py collectstatic
