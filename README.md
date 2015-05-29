# nodemcu-webide
A websocket based IDE for nodemcu devices.

## Install on MCU

This has been tested on the dev branch of nodemcu.  It needs to have the new
crypto module to function.

Go to mcu folder and edit ssid/password in init.lua.

Then run:

```sh
./luatool.py -f init.lua
./luatool.py -f main.lua -c
./luatool.py -f websocket.lua -c
```

Then restart the mcu and note the IP address printed on the serial console.

## Run Webapp

Simply go to <http://nodemcu.creationix.com/>.

## Host Locally

If you want to host locally, install luvit first. <https://luvit.io/>

Then go to the host folder and run:

```sh
lit install creationix/weblit
luvit server.lua
```

And point your browser to <http://localhost:8080/>
