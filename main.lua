
websocket.createServer(80, function (socket)
  function socket.onmessage(payload, opcode)
    if opcode == 1 then
      print(payload)
    else
      print("<" .. crypto.toHex(payload) .. ">")
    end
    socket.send(payload, opcode)
  end
end)
