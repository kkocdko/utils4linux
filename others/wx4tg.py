# python\python.exe -m venv .venv # .venv\scripts\activate # pip install -i https://mirrors.bfsu.edu.cn/pypi/web/simple --upgrade wcferry==39.4.2.2 python-telegram-bot[socks]
# https://mp.weixin.qq.com/s/g9AjM3A04sAylP-Q-17fAg # https://docs.python-telegram-bot.org/en/stable/examples.rawapibot.html

import wcferry.client
import telegram
import telegram.error
import os
import signal
import queue
import json
import time
import threading
import asyncio
import pathlib
import xml.etree.ElementTree
import urllib.parse

config = {  # 不要写一些无法编码成 json 的东西
    "tg_bot_token": "123123:ABCDEF--ABC123-ABC123",
    "tg_sticker_preview": "https://workers.cloudflare.com",  # https://api.moeworld.top/messageSync/member.php?origin=QQ&avatar=2533307356&bigTitle=空梦『永不落幕的次元之界』&subTitle=软.
    "tg_offset": 0,
    "tg_master": 123,
    "tg_rotate_message_id": 12,
    "tg_rotate_message_content": "",
    "tg_wx_map": {  # tgid -> {wxid,label}
        # https://t.me/c/123/13
        "-4321212121": {"wxid": "gh_3dfda90e39d6", "label": "微信支付"},
        # "284": {"wxid": "filehandler", "label": "文件传输助手"},
        # "12": {"wxid": "12@chatroom", "label": "桥测试群1"},
    },
}
config_file_path = "wx4tg.json"
config_file = None


def sync_config():
    config_file.seek(0)
    json.dump(config, config_file, indent=2, ensure_ascii=False)
    config_file.truncate()


if not os.path.exists(config_file_path):
    config_file = open(config_file_path, "w+", encoding="utf-8")
    sync_config()
    config_file.close()

config_file = open(config_file_path, "r+", encoding="utf-8")
config = json.load(config_file)

download_dir = "download_attachment"
if not os.path.exists(download_dir):
    os.mkdir(download_dir)

wcf = wcferry.client.Wcf(port=9225, debug=True, block=True)
wcf.enable_receiving_msg()
wcf_self_info = wcf.get_user_info()
print(wcf_self_info)
wcf_contacts = wcf.get_contacts()
wcf_lock = threading.Lock()
httpx_request = telegram.request.HTTPXRequest(
    proxy="socks5://127.0.0.1:9091",
    connection_pool_size=3,
    pool_timeout=5,
    # http_version="2", # httpx's h2 is unstable, don't use it!
)
bot = telegram.Bot(
    config["tg_bot_token"],
    request=httpx_request,
    get_updates_request=httpx_request,
)


def signal_handler(sig, frame):
    # wcf.cleanup()
    exit(0)


signal.signal(signal.SIGINT, signal_handler)

# for v in wcf_contacts:
#     print([v["wxid"], v["remark"], v["name"]])
# print(wcf.get_msg_types()) # {0: '朋友圈消息', 1: '文字', 3: '图片', 34: '语音', 37: '好友确认', 40: 'POSSIBLEFRIEND_MSG', 42: '名片', 43: '视频', 47: '石头剪刀布 | 表情图片', 48: '位置', 49: '共享实时位置、文件、转账、链接', 50: 'VOIPMSG', 51: '微信初始化', 52: 'VOIPNOTIFY', 53: 'VOIPINVITE', 62: '小视频', 66: '微信红包', 9999: 'SYSNOTICE', 10000: '红包、系统消息', 10002: '撤回消息', 1048625: '搜狗表情', 16777265: '链接', 436207665: '微信红包', 536936497: '红包封面', 754974769: '视频号视频', 771751985: '视频号名片', 822083633: '引用消息', 922746929: '拍一拍', 973078577: '视频号直播', 974127153: '商品链接', 975175729: '视频号直播', 1040187441: '音乐链接', 1090519089: '文件'}

# [Smile][Grimace][Drool][Scowl][CoolGuy][Sob][Shy][Silent][Sleep][Cry][Awkward][Angry][Tongue][Grin][Surprise][Frown][Blush][Scream][Puke][Chuckle][Joyful][Slight][Smug][Drowsy][Panic][Laugh][Commando][Scold][Shocked][Shhh][Dizzy][Toasted][Skull][Hammer][Wave][Speechless][NosePick][Clap][Trick][Bah！R][Pooh-pooh][Shrunken][TearingUp][Sly][Kiss][Whimper][Happy][Sick][Flushed][Lol][Terror][LetDown][Duh][Hey][Facepalm][Smirk][Smart][Concerned][Yeah!][Onlooker][GoForIt][Sweats][OMG][Emm][Respect][Doge][NoProb][MyBad][Wow][Boring][Awesome][LetMeSee][Sigh][Hurt][Broken][Lips][Heart][BrokenHeart][Hug][ThumbsUp][ThumbsDown][Shake][Peace][Fight][Beckon][Fist][OK][Worship][Beer][Coffee][Cake][Rose][Wilt][Cleaver][Bomb][Poop][Moon][Sun][Party][Gift][Packet][Rich][Blessing][Fireworks][爆竹][Pig][Waddle][Tremble][Twirl]
wx_emotion_map = "CoolGuy=😎,"
# "".replace("[CoolGuy]","😎").replace("[CoolGuy]","😎")


async def rotate_message(s):
    text = str(config["tg_rotate_message_content"])
    text += "\n－ " + time.strftime("%H:%M") + " " + s + "\n"
    while len(text) > 2048:
        lines = text.split("\n")
        lines.pop(0)  # Remove first line
        text = "\n".join(lines)
    text = text.lstrip()
    config["tg_rotate_message_content"] = text
    sync_config()
    try:
        await bot.edit_message_text(
            chat_id=config["tg_master"],
            message_id=config["tg_rotate_message_id"],
            text=text,
            link_preview_options=telegram.LinkPreviewOptions(
                is_disabled=True,
            ),
        )
    except telegram.error.BadRequest as e:
        if "Message to edit not found" in str(e):
            message = await bot.send_message(
                chat_id=config["tg_master"],
                text=text,
                link_preview_options=telegram.LinkPreviewOptions(
                    is_disabled=True,
                ),
            )
            config["tg_rotate_message_id"] = message.message_id
            sync_config()


async def from_wx():
    while True:
        try:
            msg = wcf.get_msg()
            # https://wechatferry.readthedocs.io/zh/latest/autoapi/wcferry/wxmsg/index.html
            # print(f"{'-'*60}\n.type = [{msg.type}]\n.content = [{msg.content}]\n")
            wx_tg_map = {v["wxid"]: k for k, v in config["tg_wx_map"].items()}
            match_wxid = msg.sender
            if msg.from_group():
                match_wxid = msg.roomid
            text_prefix = ""

            def get_user_label(wxid):
                if wxid is None or wcf_self_info["wxid"] == wxid:
                    return "_"
                for contact in wcf_contacts:
                    if contact["wxid"] == wxid and contact["remark"]:
                        return contact["remark"]
                if msg.from_group():
                    alias_in_chatroom = wcf.get_alias_in_chatroom(wxid, msg.roomid)
                    if alias_in_chatroom:
                        return alias_in_chatroom
                return wxid  # sender_name = wcf.get_info_by_wxid(wxid).name

            if msg.from_group() and (not match_wxid in wx_tg_map):
                text_prefix += "[" + get_user_label(msg.roomid) + "] "
            if msg.from_group() or (not match_wxid in wx_tg_map):
                text_prefix += "[" + get_user_label(msg.sender) + "] "
            if msg.type == 1:
                if not match_wxid in wx_tg_map:
                    await rotate_message(text_prefix + msg.content)
                    continue
                print(f"tgid={wx_tg_map[match_wxid]}")
                await bot.send_message(
                    chat_id=wx_tg_map[match_wxid],
                    text=text_prefix + msg.content,
                )
                print(msg.content)
            if msg.type == 3:
                if not match_wxid in wx_tg_map:
                    await rotate_message(text_prefix + "[photo]")
                    continue
                image_path = wcf.download_image(msg.id, msg.extra, download_dir, 20)
                await bot.send_photo(
                    chat_id=wx_tg_map[match_wxid],
                    photo=pathlib.Path(image_path),
                    caption=(text_prefix + "[image]") if msg.from_group() else None,
                )
            if msg.type == 43:
                if not match_wxid in wx_tg_map:
                    await rotate_message(text_prefix + "[video]")
                    continue
                while not os.path.exists(msg.thumb):
                    await asyncio.sleep(0.2)
                await bot.send_photo(
                    chat_id=wx_tg_map[match_wxid],
                    caption=text_prefix + "[video_thumb]",
                    photo=pathlib.Path(msg.thumb),
                )
                continue
            if msg.type == 47:
                if not match_wxid in wx_tg_map:
                    await rotate_message(text_prefix + "[sticker]")
                    continue
                tree = xml.etree.ElementTree.fromstring(msg.content)
                element = tree.findall("./emoji")[0]
                sticker_md5 = element.get("md5")
                sticker_thumburl = element.get("thumburl")
                sticker_cdnurl = element.get("cdnurl")
                sticker_previewurl = sticker_thumburl
                if not sticker_previewurl:
                    sticker_previewurl = sticker_cdnurl
                sticker_previewurl = urllib.parse.quote(sticker_previewurl)
                sticker_previewurl = config["tg_sticker_preview"] + sticker_previewurl
                # 是 收藏的表情 或者 商城的表情。商城表情虽然响应的 mime 能用，但是 tg 的链接预览不稳定，所以这里需要 cloudflare worker
                await bot.send_message(
                    chat_id=wx_tg_map[match_wxid],
                    text=(
                        text_prefix
                        + f'[sticker <a href="{sticker_previewurl}">preview</a> <a href="{sticker_cdnurl}">full</a>]'
                    ),
                    parse_mode=telegram.constants.ParseMode.HTML,  # 微信的昵称不允许 "<>/" 字符，这里可以偷懒不管
                    link_preview_options=telegram.LinkPreviewOptions(
                        is_disabled=False,
                        url=sticker_previewurl,
                        prefer_small_media=True,
                    ),
                )
            if msg.type == 49:
                tree = xml.etree.ElementTree.fromstring(msg.content)
                t = lambda p: [e.text for e in tree.findall(p)][0]
                appmsg_type = t("./appmsg/type")
                if appmsg_type == "57":
                    # 是 引用消息。被引用的消息有多种，但是引用时发送的消息只能是文字
                    text = t("./appmsg/title") + "\n"
                    refer_type = t("./appmsg/refermsg/type")
                    refer_chatusr = t("./appmsg/refermsg/chatusr")
                    refer_content = t("./appmsg/refermsg/content")
                    refer_createtime = t("./appmsg/refermsg/createtime")
                    passed_time = str(int(time.time()) - int(refer_createtime))
                    text += f"> ({passed_time}s ago) [{get_user_label(refer_chatusr)}] "
                    if refer_type == "1":
                        text += refer_content[:20].replace("\n", "\\n")
                    elif refer_type == "3":
                        text += "[image]"
                    elif refer_type == "43":
                        text += "[video]"
                    elif refer_type == "49":
                        text += "[xml]"  # 我们这里就不递归解析了
                    elif refer_type == "47":
                        text += "[sticker]"
                    else:
                        text += "[unknown_refer_type=" + refer_type + "]"
                    if not match_wxid in wx_tg_map:
                        await rotate_message(text_prefix + text.replace("\n", "\\n"))
                        continue
                    await bot.send_message(
                        chat_id=wx_tg_map[match_wxid],
                        text=text_prefix + text,
                    )
                if appmsg_type == "19":
                    # 合并转发
                    if not match_wxid in wx_tg_map:
                        await rotate_message(text_prefix + "[bundled_forward] todo")
                        continue
                    await bot.send_message(
                        chat_id=wx_tg_map[match_wxid],
                        text=text_prefix + "[bundled_forward] todo",
                    )
                if appmsg_type == "6":
                    # 文件
                    if not match_wxid in wx_tg_map:
                        await rotate_message(text_prefix + "[file] todo")
                        continue
                    await bot.send_message(
                        chat_id=wx_tg_map[match_wxid],
                        text=text_prefix + "[file] todo",
                    )
                if appmsg_type == "17":
                    # 开始实时位置分享
                    if not match_wxid in wx_tg_map:
                        await rotate_message(text_prefix + "[location_realtime] todo")
                        continue
                    await bot.send_message(
                        chat_id=wx_tg_map[match_wxid],
                        text=text_prefix + "[location_realtime] todo",
                    )
            if msg.type == 34:
                if not match_wxid in wx_tg_map:
                    await rotate_message(text_prefix + "[voice]")
                    continue
                audio_path = wcf.get_audio_msg(msg.id, download_dir)
                if audio_path == "":
                    print("wcf.get_audio_msg() failed")
                    continue
                await bot.send_voice(
                    chat_id=wx_tg_map[match_wxid],
                    voice=pathlib.Path(audio_path),
                )
            if msg.type == 48:
                tree = xml.etree.ElementTree.fromstring(msg.content)
                element = tree.findall("./location")[0]
                text = (
                    "[location"
                    + (" x=" + str(element.get("x")))
                    + (" y=" + str(element.get("y")))
                    + (" scale=" + str(element.get("scale")))
                    + (" label=" + str(element.get("label")))
                    + (" pointname=" + str(element.get("pointname")))
                    + "]"
                )
                if not match_wxid in wx_tg_map:
                    await rotate_message(text_prefix + text)
                    continue
                await bot.send_message(
                    chat_id=wx_tg_map[match_wxid],
                    text=text_prefix + text,
                )
            if msg.type == 10000:
                # 包括拍一拍等等系统通知
                text = "[system] " + str(msg.content)[:60]
                if not match_wxid in wx_tg_map:
                    await rotate_message(text_prefix + text)
                    continue
                await bot.send_message(
                    chat_id=wx_tg_map[match_wxid],
                    text=text_prefix + text,
                )
            if msg.type == 10002:
                # 撤回消息目前收到不到， https://github.com/lich0821/WeChatFerry/issues/162
                await bot.send_message(
                    chat_id=wx_tg_map[match_wxid],
                    text=text_prefix + "[revoke]",
                )
            # todo: 合并转发，小程序卡片，红包和转帐，音频视频通话，文件。部分难以实现的要增加提示信息返回
        except queue.Empty:
            pass
        except Exception as error:
            print(error)
        # allow other threads to acquire wcf_lock
        time.sleep(0.1)


async def from_tg():
    while True:
        try:
            updates = await bot.get_updates(
                offset=config["tg_offset"],
                allowed_updates=telegram.Update.ALL_TYPES,
                timeout=60,
            )
            for update in updates:
                config["tg_offset"] = update.update_id + 1
                sync_config()
                # print(f"> {update.message.chat_id}: {update.message.text}\n\n")
                # continue
                # print(f"msgid:{update.message.message_id}")
                if update.message is None:
                    continue
                if update.message.chat_id is None:
                    continue
                tgid = str(update.message.chat_id)
                if tgid not in config["tg_wx_map"]:
                    continue
                wxid = config["tg_wx_map"][tgid]["wxid"]
                # for attr in dir(update.message):
                #     print(f"{attr}: {getattr(update.message, attr)}")
                if update.message.text != None:
                    # wcf_lock.acquire()
                    wcf.send_text(receiver=wxid, msg=update.message.text)
                    # wcf_lock.release()
                    continue
                if update.message.video != None:
                    file = await update.message.video.get_file()
                    # 这里一定要是 mp4 后缀，否则 微信那头会出问题，不给发
                    path = str(pathlib.Path(download_dir, file.file_id + ".mp4"))
                    if not os.path.exists(path):
                        await file.download_to_drive(path)
                    wcf_lock.acquire()
                    wcf.send_image(receiver=wxid, path=path)
                    wcf_lock.release()
                if len(update.message.photo) != 0:
                    photo = update.message.photo[0]
                    for p in update.message.photo:
                        if p.file_size > photo.file_size:
                            photo = p
                    file = await photo.get_file()
                    path = str(pathlib.Path(download_dir, file.file_id))
                    if not os.path.exists(path):
                        await file.download_to_drive(path)
                    wcf_lock.acquire()
                    wcf.send_image(receiver=wxid, path=path)
                    wcf_lock.release()
        except Exception as error:
            print(error)


threading.Thread(target=lambda: asyncio.run(from_wx()), daemon=True).start()
threading.Thread(target=lambda: asyncio.run(from_tg()), daemon=True).start()

while True:
    time.sleep(10)

"""
import { PhotonImage, SamplingFilter, Rgba } from "@cf-wasm/photon";
import { resize, padding_right, padding_bottom } from "@cf-wasm/photon";
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    if (token !== "000000") {
      return new Response("token invalid");
    }
    if (url.pathname === "/imgthumb") {
      const imgRes = await fetch(url.searchParams.get("url"));
      const imgBytes = new Uint8Array(await imgRes.arrayBuffer());
      const originImg = PhotonImage.new_from_byteslice(imgBytes); // https://unpkg.com/@cf-wasm/photon@0.1.28/dist/dts/lib/photon_rs.d.ts
      const outputWidth = 160;
      const outputHeight = 90;
      let width = originImg.get_width();
      let height = originImg.get_height();
      let widthScale = outputWidth / width;
      let heightScale = outputHeight / height;
      let minScale = Math.min(widthScale, heightScale);
      width = Math.round(width * minScale);
      height = Math.round(height * minScale);
      const sampling = SamplingFilter.Triangle;
      const resizedImg = resize(originImg, width, height, sampling);
      const bgColor = new Rgba(63, 63, 63, 255);
      const paddedImg =
        widthScale < heightScale
          ? padding_bottom(resizedImg, outputHeight - height, bgColor)
          : padding_right(resizedImg, outputWidth - width, bgColor);
      const outputBytes = paddedImg.get_bytes_jpeg(68);
      originImg.free();
      resizedImg.free();
      paddedImg.free();
      return new Response(outputBytes, {
        headers: { "Content-Type": "image/jpeg" },
      });
    }
    return new Response("hi");
  },
};
// package.json
{
  "name": "imgthumb",
  "version": "0.0.1",
  "type": "module",
  "scripts": {},
  "dependencies": {
    "@cf-wasm/photon": "^0.1.28"
  }
}
// wrangler.json
{
  "name": "imgthumb",
  "main": "index.js",
  "compatibility_date": "2023-05-18"
}
// npm install -g wrangler
// wrangler deploy
"""
