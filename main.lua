
websocket.createServer(80, function (socket)
  local data
  node.output(function (msg)
    return socket.send(msg, 1)
  end, 1)
  print("New websocket client connected")

  function socket.onmessage(payload, opcode)
    if opcode == 1 then
      if payload == "ls" then
        local list = file.list()
        local lines = {}
        for k, v in pairs(list) do
          lines[#lines + 1] = k .. "\0" .. v
        end
        socket.send(table.concat(lines, "\0"), 2)
        return
      end
      local command, name = payload:match("^([a-z]+):(.*)$")
      if command == "load" then
        file.open(name, "r")
        socket.send(file.read(), 2)
        file.close()
      elseif command == "save" then
        file.open(name, "w")
        file.write(data)
        data = nil
        file.close()
      elseif command == "compile" then
        node.compile(name)
      elseif command == "run" then
        dofile(name)
      elseif command == "eval" then 
        local fn = loadstring(data, name)
        data = nil
        fn()
      else
        print("Invalid command: " .. command)
      end
    elseif opcode == 2 then
      data = payload
    end
  end
end)
