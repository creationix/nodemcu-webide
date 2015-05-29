window.onload = function () {
  "use strict";
  var textarea = document.querySelector("textarea");
  var form = document.querySelector("form");
  var input = document.querySelector("input");
  input.focus();

  var socket = new WebSocket("ws://192.168.1.148/");
  socket.binaryType = "arraybuffer";
  var onbinary;

  function decodeUtf8(utf8) {
    return decodeURIComponent(window.escape(utf8));
  }

  function encodeUtf8(unicode) {
    return window.unescape(encodeURIComponent(unicode));
  }

  function toRaw(binary, start, end) {
    var raw = "";
    if (end === undefined) {
      end = binary.length;
      if (start === undefined) start = 0;
    }
    for (var i = start; i < end; i++) {
      raw += String.fromCharCode(binary[i]);
    }
    return raw;
  }

  function fromRaw(raw, binary, offset) {
    var length = raw.length;
    if (offset === undefined) {
      offset = 0;
      if (binary === undefined) binary = new Uint8Array(length);
    }
    for (var i = 0; i < length; i++) {
      binary[offset + i] = raw.charCodeAt(i);
    }
    return binary;
  }

  function toUnicode(binary, start, end) {
    return decodeUtf8(toRaw(binary, start, end));
  }

  function fromUnicode(unicode, binary, offset) {
    return fromRaw(encodeUtf8(unicode), binary, offset);
  }

  function loadFile(path, callback) {
    socket.send("load:" + path);
    onbinary = function (buffer) {
      onbinary = null;
      return callback(toUnicode(buffer));
    };
  }

  function listFiles(callback) {
    socket.send("ls");
    onbinary = function (buffer) {
      onbinary = null;
      var files = [];
      var list = toUnicode(buffer).split("\0");
      for (var i = 0, l = list.length; i < l; i += 2) {
        var name = list[i];
        var size = list[i + 1]|0;
        files.push({name:name,size:size});
      }
      files.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
      callback(files);
    };
  }

  function remoteEval(lua, name) {
    socket.send(fromUnicode(lua));
    socket.send("eval:" + name);
  }

  function pushData(data) {
    textarea.textContent += data;
    textarea.scrollTop = textarea.scrollHeight;
  }

  form.onsubmit = function (evt) {
    evt.preventDefault();
    pushData("> " + input.value + "\n");
    remoteEval(input.value, "console");
    input.value = "";
  };

  socket.onopen = function () {
    // listFiles(function (files) {
    // });
    // loadFile("main.lua", function (data) {
    //   console.log("data", data);
    // });
  };
  socket.onmessage = function (evt) {
    if (typeof evt.data == "string") {
      pushData(evt.data);
    }
    else {
      onbinary(new Uint8Array(evt.data));
    }
  };
};
