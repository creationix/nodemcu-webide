wifi.setmode(wifi.STATION)
wifi.sta.config("creationix","noderocks")
wifi.sta.connect()
tmr.alarm(0, 1000, 1, function ()
  local ip = wifi.sta.getip()
  if ip then
    tmr.stop(0)
    print(ip)
    dofile("websocket.lc")
    dofile("main.lc")
  else
    print("Connecting to WIFI...")
  end
end)