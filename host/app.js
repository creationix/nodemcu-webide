function Remote(ip, onOut) {
  var socket;
  var onBinary;
  var open = false;
  var opening = false;
  var callbacks = [];
  ensure();

  function ensure(callback) {
    if (open) {
      if (callback) { callback(); }
      return;
    }
    if (callback) {
      callbacks.push(callback);
    }
    if (opening) { return; }
    opening = true;
    onOut(["span.notice", "Connecting to ", ip]);
    socket = new WebSocket("ws://" + ip + "/");
    socket.onopen = onOpen;
    socket.onerror = onError;
    socket.onclose = onClose;
    socket.onmessage = onMessage;
  }

  function onOpen() {
    open = true;
    opening = false;
    onOut(["span.notice", "Socket Established"]);
    var fns = callbacks.slice();
    callbacks.length = 0;
    fns.forEach(function (fn) {
      fn();
    });
  }

  function onError(evt) {
    opening = false;
    console.log(evt);
    onOut(["span.notice", "Socket Error"]);
  }

  function onClose() {
    open = false;
    opening = false;
    onOut(["span.notice", "Socket Closed"]);
    setTimeout(ensure, 3000);
  }

  function onMessage(evt) {
    if (typeof evt.data == "string") {
      onOut(evt.data);
    }
    else if (onBinary) {
      var fn = onBinary;
      onBinary = undefined;
      fn(new Uint8Array(evt.data));
    }
  }

  return {
    eval: function remoteEval(lua, callback) {
      ensure(function () {
        socket.send(bodec.fromUnicode(lua));
        socket.send("eval:" + name);
        if (callback) { callback(); }
      });
    }
  };
}

function App(emit, refresh, refs) {
  var lines = [];
  // TODO: let UI choose address
  var remote;
  var ip;
  return {
    render: render,
    on: { send: onSend }
  };

  function render(newIp) {
    if (newIp !== ip) {
      ip = newIp;
      remote = Remote(ip, onOut);
    }
    return [".app$app", [Console, lines]];
  }

  function onSend(line) {
    lines.push(["span.command", line]);
    refresh();
    focus();
    remote.eval(line);
  }

  function onOut(data) {
    var last = lines[lines.length - 1];
    if (typeof data == "string" && typeof last == "string") {
      lines[lines.length - 1] = last + data;
    }
    else {
      lines.push(data);
    }
    refresh();
    focus();
  }

  function focus() {
    var input = document.querySelector(".console input");
    if (!input) { return; }
    input.focus();
    var box = document.querySelector(".lines");
    box.scrollTop = box.scrollHeight;
  }
}

function Console(emit, refresh) {
  "use strict";
  var history = [""];
  var index = 0;
  return { render: render };

  function render(lines) {
    return [".console",
      ["ul.lines", lines.map(function (line) {
        return ["li", line];
      })],
      ["form", {onsubmit: onSubmit},
        ["input.command", {
          onkeypress: onPress,
          onkeyup: update,
          onkeydown: update,
          value: history[index]
        }]
      ]
    ];
  }

  function onSubmit(evt) {
    evt.preventDefault();
    var line = history[index];
    if (!line) { return; }
    if (index < history.length - 1) {
      history.pop();
    }
    index = history.length;
    if (history[index - 1] !== line) {
      history[index++] = line;
    }
    history[index] = "";
    emit("send", line);
    refresh();
  }

  function update(evt) {
    if (evt.key == "ArrowUp" || evt.key == "ArrowDown") { return; }
    var line = evt.target.value;
    index = history.length - 1;
    if (line !== history[index]) {
      history[index] = line;
    }
  }

  function onPress(evt) {
    var move = 0;
    if (evt.key === "ArrowUp") {
      move = -1;
    }
    else if (evt.key === "ArrowDown") {
      move = 1;
    }
    else {
      update(evt);
    }
    if (move) {
      evt.preventDefault();
      if (history[index + move] === undefined) { return; }
      index += move;
      refresh();
    }
  }

}

window.onload = function () {
  "use strict";
  var ip = window.location.hash.substring(1);
  if (!ip) {
    ip = window.prompt("Enter IP address of nodeMCU");
    window.location.hash = ip;
  }
  window.domChanger(App, document.body).update(ip);
  document.querySelector(".console input").focus();


  // function loadFile(path, callback) {
  //   socket.send("load:" + path);
  //   onbinary = function (buffer) {
  //     onbinary = null;
  //     return callback(toUnicode(buffer));
  //   };
  // }
  //
  // function listFiles(callback) {
  //   socket.send("ls");
  //   onbinary = function (buffer) {
  //     onbinary = null;
  //     var files = [];
  //     var list = toUnicode(buffer).split("\0");
  //     for (var i = 0, l = list.length; i < l; i += 2) {
  //       var name = list[i];
  //       var size = list[i + 1]|0;
  //       files.push({name:name,size:size});
  //     }
  //     files.sort(function (a, b) {
  //       return a.name.localeCompare(b.name);
  //     });
  //     callback(files);
  //   };
  // }
  //
  // function remoteEval(lua, name) {
  //   socket.send(fromUnicode(lua));
  //   socket.send("eval:" + name);
  // }
  //
  // function pushData(data) {
  //   textarea.textContent += data;
  //   textarea.scrollTop = textarea.scrollHeight;
  // }
  //
  // form.onsubmit = function (evt) {
  //   evt.preventDefault();
  //   pushData("> " + input.value + "\n");
  //   remoteEval(input.value, "console");
  //   input.value = "";
  // };
  //
  // };
};
