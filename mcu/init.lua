wifi.setmode(wifi.STATIONAP)
wifi.sta.config("creationix","noderocks")
wifi.sta.connect()
tmr.alarm(0, 1000, 1, function ()
  local ip = wifi.sta.getip()
  if ip then
    tmr.stop(0)
    print(ip)
  end
end)

dofile("websocket.lc")
dofile("main.lc")
