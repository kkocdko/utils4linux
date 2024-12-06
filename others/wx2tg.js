// @ts-check
/// <reference lib="esnext" />
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import child_process from "node:child_process";
import net from "node:net";
import tls from "node:tls";
import https from "node:https";
import events from "node:events";
import util from "node:util";

function httpsOverHttp(options) {
  /** @type {any} */ var agent = new TunnelingAgent(options);
  agent.request = http.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}
function TunnelingAgent(options) {
  /** @type {any} */ var self = this;
  self.options = options || {};
  self.proxyOptions = self.options.proxy || {};
  self.maxSockets =
    self.options.maxSockets ||
    /** @type {any} */ (http.Agent).defaultMaxSockets;
  self.requests = [];
  self.sockets = [];

  self.on("free", function onFree(socket, host, port, localAddress) {
    var options = toOptions(host, port, localAddress);
    for (var i = 0, len = self.requests.length; i < len; ++i) {
      var pending = self.requests[i];
      if (pending.host === options.host && pending.port === options.port) {
        // Detect the request to connect same origin server,
        // reuse the connection.
        self.requests.splice(i, 1);
        pending.request.onSocket(socket);
        return;
      }
    }
    socket.destroy();
    self.removeSocket(socket);
  });
}
util.inherits(TunnelingAgent, events.EventEmitter);
TunnelingAgent.prototype.addRequest = function addRequest(
  req,
  host,
  port,
  localAddress
) {
  /** @type {any} */ var self = this;
  var options = mergeOptions(
    { request: req },
    self.options,
    toOptions(host, port, localAddress)
  );

  if (self.sockets.length >= this.maxSockets) {
    // We are over limit so we'll add it to the queue.
    self.requests.push(options);
    return;
  }

  // If we are under maxSockets create a new one.
  self.createSocket(options, function (socket) {
    socket.on("free", onFree);
    socket.on("close", onCloseOrRemove);
    socket.on("agentRemove", onCloseOrRemove);
    req.onSocket(socket);

    function onFree() {
      self.emit("free", socket, options);
    }

    function onCloseOrRemove(err) {
      self.removeSocket(socket);
      socket.removeListener("free", onFree);
      socket.removeListener("close", onCloseOrRemove);
      socket.removeListener("agentRemove", onCloseOrRemove);
    }
  });
};
TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
  /** @type {any} */ var self = this;
  var placeholder = {};
  self.sockets.push(placeholder);

  var connectOptions = mergeOptions({}, self.proxyOptions, {
    method: "CONNECT",
    path: options.host + ":" + options.port,
    agent: false,
    headers: {
      host: options.host + ":" + options.port,
    },
  });
  if (options.localAddress) {
    connectOptions.localAddress = options.localAddress;
  }
  if (connectOptions.proxyAuth) {
    connectOptions.headers = connectOptions.headers || {};
    connectOptions.headers["Proxy-Authorization"] =
      "Basic " + new Buffer(connectOptions.proxyAuth).toString("base64");
  }

  debug("making CONNECT request");
  var connectReq = self.request(connectOptions);
  connectReq.useChunkedEncodingByDefault = false; // for v0.6
  connectReq.once("response", onResponse); // for v0.6
  connectReq.once("upgrade", onUpgrade); // for v0.6
  connectReq.once("connect", onConnect); // for v0.7 or later
  connectReq.once("error", onError);
  connectReq.end();

  function onResponse(res) {
    // Very hacky. This is necessary to avoid http-parser leaks.
    res.upgrade = true;
  }

  function onUpgrade(res, socket, head) {
    // Hacky.
    process.nextTick(function () {
      onConnect(res, socket, head);
    });
  }

  function onConnect(res, socket, head) {
    connectReq.removeAllListeners();
    socket.removeAllListeners();

    if (res.statusCode !== 200) {
      debug(
        "tunneling socket could not be established, statusCode=%d",
        res.statusCode
      );
      socket.destroy();
      /** @type {any} */ var error = new Error(
        "tunneling socket could not be established, " +
          "statusCode=" +
          res.statusCode
      );
      error.code = "ECONNRESET";
      options.request.emit("error", error);
      self.removeSocket(placeholder);
      return;
    }
    if (head.length > 0) {
      debug("got illegal response body from proxy");
      socket.destroy();
      /** @type {any} */ var error = new Error(
        "got illegal response body from proxy"
      );
      error.code = "ECONNRESET";
      options.request.emit("error", error);
      self.removeSocket(placeholder);
      return;
    }
    debug("tunneling connection has established");
    self.sockets[self.sockets.indexOf(placeholder)] = socket;
    return cb(socket);
  }

  function onError(cause) {
    connectReq.removeAllListeners();

    debug(
      "tunneling socket could not be established, cause=%s\n",
      cause.message,
      cause.stack
    );
    /** @type {any} */
    var error = new Error(
      "tunneling socket could not be established, " + "cause=" + cause.message
    );
    error.code = "ECONNRESET";
    options.request.emit("error", error);
    self.removeSocket(placeholder);
  }
};
TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
  var pos = this.sockets.indexOf(socket);
  if (pos === -1) {
    return;
  }
  this.sockets.splice(pos, 1);

  var pending = this.requests.shift();
  if (pending) {
    // If we have pending requests and a socket gets closed a new one
    // needs to be created to take over in the pool for the one that closed.
    this.createSocket(pending, function (socket) {
      pending.request.onSocket(socket);
    });
  }
};
function createSecureSocket(options, cb) {
  var self = this;
  TunnelingAgent.prototype.createSocket.call(self, options, function (socket) {
    var hostHeader = options.request.getHeader("host");
    var tlsOptions = mergeOptions({}, self.options, {
      socket: socket,
      servername: hostHeader ? hostHeader.replace(/:.*$/, "") : options.host,
    });

    // 0 is dummy port for v0.6
    var secureSocket = tls.connect(0, tlsOptions);
    self.sockets[self.sockets.indexOf(socket)] = secureSocket;
    cb(secureSocket);
  });
}
function toOptions(host, port, localAddress) {
  if (typeof host === "string") {
    // since v0.10
    return {
      host: host,
      port: port,
      localAddress: localAddress,
    };
  }
  return host; // for v0.11 or later
}
function mergeOptions(target) {
  for (var i = 1, len = arguments.length; i < len; ++i) {
    var overrides = arguments[i];
    if (typeof overrides === "object") {
      var keys = Object.keys(overrides);
      for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
        var k = keys[j];
        if (overrides[k] !== undefined) {
          target[k] = overrides[k];
        }
      }
    }
  }
  return target;
}
var debug = (...args) => {};

/**
 * Assert the value is true, or throw an error. Like "node:assert", but cross platform.
 * @type {{ (value: false, info?): never; (value, info?): asserts value; }}
 */
const assert = (value, info = "assertion failed") => {
  if (value) return /** @type {never} */ (true); // what the fuck
  throw new Error(info);
};

/**
 * Returns a debounced variant of the input function.
 * @template {Function} T
 * @param {T} f
 * @param {number} ms
 * @returns {T}
 */
const debounce = (f, ms) => {
  let timer;
  return /** @type {any} */ (
    (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        f(...args);
      }, ms);
    }
  );
};

/**
 * Open a json file and returns mapping object. Like [valtio](https://github.com/pmndrs/valtio).
 * @param {fs.PathLike} path
 */
const openJsonMmap = async (path) => {
  if (!fs.existsSync(path)) fs.writeFileSync(path, "{}"); // create if not exist
  const file = await fs.promises.open(path, "r+"); // we do not care about the `.close`
  let locked = false;
  const syncToFile = debounce(async () => {
    if (locked) return syncToFile(); // avoid race, see docs of `.write`
    locked = true;
    const data = JSON.stringify(ret, null, 2) + "\n";
    const { bytesWritten } = await file.write(data, 0); // do not use `.writeFile`
    await file.truncate(bytesWritten); // truncate after write, do not reverse
    locked = false;
  }, 50); // 50ms is enough for most machines, and the JSON.stringify is sync which can delay the await sleep in electron's app.on("window-all-closed", ...)
  const ret = new Proxy(JSON.parse((await file.readFile()).toString()), {
    set(obj, k, v) {
      obj[k] = Object.isExtensible(v) ? new Proxy(v, this) : v;
      touchProps(obj[k]); // supports recursive
      syncToFile();
      return true;
    },
    deleteProperty(obj, k) {
      delete obj[k];
      syncToFile();
      return true;
    },
  });
  const touchProps = (obj) => {
    for (const k in obj) if (Object.isExtensible(obj[k])) obj[k] = obj[k]; // trigger `.set`
  };
  touchProps(ret);
  return ret;
};

/**
 * Read request body then parse json.
 * @param {http.IncomingMessage} incoming
 */
const readJson = (incoming) => {
  const { resolve, reject, promise } = Promise.withResolvers();
  let body = "";
  incoming.on("data", (chunk) => (body += chunk));
  incoming.on("end", () => resolve(JSON.parse(body)));
  incoming.on("error", reject);
  return promise;
};

const defaultConfig = Object.seal({
  tgOffset: 0,
});
/** @type {typeof defaultConfig} */
const config = await openJsonMmap("wx2tg.json"); // developers write js extensions, common users will not modify config file manually, so the non-comments json is enough
for (const k in defaultConfig) {
  // be relax, Object.hasOwn({ a: undefined }, "a") === true
  if (!Object.hasOwn(config, k)) {
    config[k] = defaultConfig[k];
  }
}

const rpcWx = async (name, data = {}) => {
  const url = "http://127.0.0.1:9225/api/" + name;
  const body = JSON.stringify(data);
  const response = await fetch(url, { method: "POST", body });
  return await response.json();
};

const rpcTg = async (name, data = {}) => {
  const { resolve, reject, promise } = Promise.withResolvers();
  const tunnelingAgent = httpsOverHttp({
    proxy: { host: "127.0.0.1", port: 1080 },
  });
  const req = https.request(
    {
      hostname: "api.telegram.org",
      port: 443,
      path: "/bot" + config.tgBotToken + "/" + name,
      method: "POST",
      agent: tunnelingAgent,
      headers: { "Content-Type": "application/json" },
    },
    (res) => {
      readJson(res).then(resolve).catch(reject);
    }
  );
  req.write(JSON.stringify(data));
  req.end();
  return promise;
};

assert((await rpcWx("checkLogin")).code === 1);
assert((await rpcWx("userInfo")).data.wxid === "wxid_vi7xihjiuuag22");
for (const entry of (await rpcWx("getContactList")).data) {
  // console.log(entry.wxid + " | " + entry.nickname + " | " + entry.remark);
}
const wxMsgResetRecv = debounce(async () => {
  console.log("wxMsgResetRecv");
  await rpcWx("unhookSyncMsg");
  console.log(await rpcWx("hookSyncMsg", {
    port: "9226",
    ip: "127.0.0.1",
    url: "http://127.0.0.1:9226",
    timeout: "100",
    enableHttp: true,
  }));
}, 1000);
const server = http.createServer(async (_, res) => {
  console.log("incoming from wx hook");
  const request = await readJson(res.req);
  res.end();
  res.destroy();

  console.log(request);

  if (request.type === 1) {
    // text
    const wxid = request.fromUser;
    const pair = Object.entries(config.tgWxMap).find(([k, v]) => v === wxid);
    if (!pair) return console.log("unknown wxid = " + wxid);
    const response = await rpcTg("sendMessage", {
      chat_id: config.tgGroup,
      message_thread_id: pair[0],
      text: request.content,
    });
    return;
  } else if (request.type === 3) {
    //image
    const wxid = request.fromUser;
    // const pair = Object.entries(config.tgWxMap).find(([k, v]) => v === wxid);
    // if (!pair) return console.log("unknown wxid = " + wxid);
    const r = await rpcWx("downloadAttach", {
      msgId: request.msgId,
    });
    console.log(r);
  }
  // console.log("wx2tg", request.content, response);
});
server.listen(9226, "127.0.0.1");
wxMsgResetRecv();
while (true) {
  const response = await rpcTg("getUpdates", {
    offset: config.tgOffset,
    timeout: 120,
  });
  for (const entry of response.result) {
    if (entry?.message?.chat?.id !== config.tgGroup) continue;
    if (!entry.message?.message_thread_id) continue;
    const wxid = config.tgWxMap[entry.message.message_thread_id];
    if (!wxid) continue;
    await rpcWx("sendTextMsg", {
      wxid,
      msg: entry.message.text,
    });
  }
  const lastUpdateId = response.result[response.result.length - 1]?.update_id;
  if (lastUpdateId) config.tgOffset = lastUpdateId + 1;
  console.log(response);
}

// netstat -ano | findstr 19088
// https://github.com/tom-snow/wechat-windows-versions/releases/download/v3.9.8.25/WeChatSetup-3.9.8.25.exe
// https://github.com/ttttupup/wxhelper/releases/download/3.9.8.25-v2/wxhelper.dll
// https://github.com/ttttupup/wxhelper/blob/dev-3.9.8.25/doc/3.9.8.25.md

// ConsoleApplication.exe -i WeChat.exe -p wxhelper.dll
// curl --data-raw "{}" -X post http://127.0.0.1:19088/api/userInfo
