const http = require("node:http");
const dgram = require("node:dgram");
const page = `
  <!DOCTYPE html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" href="data:" />
    <script src="https://registry.npmmirror.com/mpegts.js/1.7.3/files/dist/mpegts.js"></script>
    <style>
      html,
      body {
        background: #000;
        margin: 0;
      }
      video {
        width: calc(1920px / 1.25);
        height: calc(1080px / 1.25);
      }
    </style>
  </head>
  <body>
    <video id="$video" controls muted></video>
    <script>
      let player = mpegts.createPlayer(
        {
          type: "mpegts", // could also be mpegts, m2ts, flv
          url: "/stream",
          isLive: true,
        },
        {
          liveSync: true,
          liveBufferLatencyChasing: true,
        }
      );
      player.attachMediaElement($video);
      player.load();
      // $video.onpointerup = () => {
      //   player.play();
      // };
    </script>
  </body>
`;

const udpSocket = dgram.createSocket("udp4");
udpSocket.bind(9254);
udpSocket.on("error", console.error);

http
  .createServer(({ url }, res) => {
    console.log({ url });
    if (url === "/") return void res.writeHead(200).end(page);
    if (url === "/stream") {
      try {
        // http.get("http://127.0.0.1:9255", (got) => void got.pipe(res));
        res.writeHead(200);
        const h = (buf) => void res.write(buf);
        udpSocket.on("message", h);
        res.on("close", () => {
          udpSocket.removeListener("message", h);
          console.log("res closed");
        });
      } catch (e) {}
    }
  })
  .listen(9254);
