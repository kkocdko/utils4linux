# qaac - utils4linux

Using Apple AAC (aka QAAC) audio encoder inner Docker.

**I DO NOT MAKE PROMISES ABOUT THE LICENSE ISSUE!**

<!-- `CoreAudioToolbox.dll` 20210408 20200829 -->

[qaac-docker.tar.xz](https://github.com/kkocdko/kblog/releases/download/simple_storage/qaac-docker.tar.xz)

```sh
# import image
xz -d -c -T 0 qaac-docker.tar.xz | docker import - qaac
# show version info
docker run --rm -i --network none qaac qaac --check
# do encode
ffmpeg -hide_banner -i call_me_maybe.mp3 -vn -f wav - | docker run --rm -i --network none qaac sh -c 'qaac -o a.m4a - ; cat a.m4a' > a.m4a
```

<!--
alias ffmpeg='/home/kkocdko/misc/apps/ffmpeg'
-->
