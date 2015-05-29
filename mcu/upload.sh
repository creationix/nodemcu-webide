#!/bin/sh
./luatool.py -f websocket.lua -c
./luatool.py -f main.lua -c
./luatool.py -f init.lua
