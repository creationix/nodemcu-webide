dofile("websocket.lua")
do
local encode = websocket.encode
local decode = websocket.decode
local acceptKey = websocket.acceptKey

net.createServer(net.TCP):listen(80, function(conn)
  local buffer = false
  conn:on("receive", function(conn, chunk)
    if buffer then
      buffer = buffer .. chunk
      while true do
        local extra, payload, opcode = decode(buffer)
        if not extra then return end
        buffer = extra
        print("opcode", opcode)
        print("payload", payload)
        conn:send(encode(payload, opcode))
      end
    end
    local _, e, method, url, version = string.find(chunk, "([A-Z]+) (/[^\r]*) HTTP/(%d%.%d)\r\n")
    print(method, url, version)

    local key, name, value
    while true do
      _, e, name, value = string.find(chunk, "([^ ]+): *([^\r]+)\r\n", e + 1)
      if not e then break end
      if string.lower(name) == "sec-websocket-key" then
        key = value
      end
    end

    if key then
      conn:send("HTTP/1.1 101 Switching Protocols\r\n")
      conn:send("Upgrade: websocket\r\n")
      conn:send("Connection: Upgrade\r\n")
      conn:send("Sec-WebSocket-Accept: " .. acceptKey(key) .. "\r\n\r\n")
      buffer = ""
      print("Websocket client", conn)
    else
      conn:send("HTTP/1.1 200 OK\r\nConnection: Close\r\n\r\n<!doctype html>")
      conn:send("<h1>NodeMCU IDE</h1>")
      conn:on("sent", function(conn)
        conn:close()
      end)
    end
  end)
end)

end
