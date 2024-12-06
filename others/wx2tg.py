# python -m venv venv
# venv\scripts\activate
# pip install -i https://mirrors.bfsu.edu.cn/pypi/web/simple --upgrade wcferry python-telegram-bot pillow
# https://mp.weixin.qq.com/s/g9AjM3A04sAylP-Q-17fAg
# https://docs.python-telegram-bot.org/en/stable/examples.rawapibot.html

import wcferry.client
import signal
import os
import sys
import requests
import queue
import json
import time
import threading
import asyncio
import pathlib
import telegram
import xml.etree.ElementTree
import PIL.Image

# remark


config_file_path = "wx2tg.json"
config_file = None
config = {}


def sync_config():
    config_file.seek(0)
    json.dump(config, config_file, indent=2)
    config_file.truncate()


if not os.path.exists(config_file_path):
    config = {
        "tg_offset": 0,
        "tg_wx_map": {
            "4010": "gh_3dfda90e39d6",  # 微信支付
        },
    }
    config_file = open(config_file_path, "w+")
    sync_config()
    config_file.close()

config_file = open(config_file_path, "r+")
config = json.load(config_file)

download_dir = "download_attachment"
if not os.path.exists(download_dir):
    os.mkdir(download_dir)

wcf = wcferry.client.Wcf(port=9225, debug=True, block=True)
wcf.enable_receiving_msg()
wcf_contacts = wcf.get_contacts()
wcf_lock = threading.Lock()
bot = telegram.Bot(config["tg_bot_token"])


def signal_handler(sig, frame):
    wcf.cleanup()
    exit(0)


signal.signal(signal.SIGINT, signal_handler)

# print(wcf.get_contacts())
# print(wcf.get_msg_types()) # {0: '朋友圈消息', 1: '文字', 3: '图片', 34: '语音', 37: '好友确认', 40: 'POSSIBLEFRIEND_MSG', 42: '名片', 43: '视频', 47: '石头剪刀布 | 表情图片', 48: '位置', 49: '共享实时位置、文件、转账、链接', 50: 'VOIPMSG', 51: '微信初始化', 52: 'VOIPNOTIFY', 53: 'VOIPINVITE', 62: '小视频', 66: '微信红包', 9999: 'SYSNOTICE', 10000: '红包、系统消息', 10002: '撤回消息', 1048625: '搜狗表情', 16777265: '链接', 436207665: '微信红包', 536936497: '红包封面', 754974769: '视频号视频', 771751985: '视频号名片', 822083633: '引用消息', 922746929: '拍一拍', 973078577: '视频号直播', 974127153: '商品链接', 975175729: '视频号直播', 1040187441: '音乐链接', 1090519089: '文件'}


# loop pull msg from queue by  wcf.get_msg()
async def from_wx():
    while True:
        try:
            msg = wcf.get_msg()
            # https://wechatferry.readthedocs.io/zh/latest/autoapi/wcferry/wxmsg/index.html
            wx_tg_map = {v: k for k, v in config["tg_wx_map"].items()}
            match_wxid = msg.sender
            if msg.from_group():
                match_wxid = msg.roomid
            if not match_wxid in wx_tg_map:
                print("wxid " + match_wxid + " not found")
                continue
            thread_id = wx_tg_map[match_wxid]
            text_prefix = ""

            def get_user_label(wxid):
                sender_name = ""
                for contact in wcf_contacts:
                    if contact["wxid"] == wxid and contact["remark"] != "":
                        sender_name = contact["remark"]
                        break
                if sender_name == "" and msg.from_group():
                    sender_name = wcf.get_alias_in_chatroom(wxid, msg.roomid)
                if sender_name == "":
                    sender_name = wxid
                    # sender_name = wcf.get_info_by_wxid(wxid).name
                return sender_name

            if msg.from_group():
                text_prefix = "[" + get_user_label(msg.sender) + "] "
            if msg.type == 1:
                await bot.send_message(
                    chat_id=config["tg_group"],
                    message_thread_id=thread_id,
                    text=text_prefix + msg.content,
                )
            if msg.type == 3:
                image_path = wcf.download_image(msg.id, msg.extra, download_dir, 20)
                await bot.send_photo(
                    chat_id=config["tg_group"],
                    message_thread_id=thread_id,
                    caption=text_prefix + "[image]",
                    photo=pathlib.Path(image_path),
                )
            if msg.type == 43:
                video_path = wcf.download_image(msg.id, msg.extra, download_dir, 20)
                await bot.send_video(
                    chat_id=config["tg_group"],
                    message_thread_id=thread_id,
                    caption=text_prefix + "[video]",
                    video=pathlib.Path(video_path),
                )
            if msg.type == 47:
                tree = xml.etree.ElementTree.ElementTree(
                    xml.etree.ElementTree.fromstring(msg.content)
                )
                element = tree.findall("./emoji")[0]
                stiker_type = element.get("type")
                stiker_md5 = element.get("md5")
                stiker_thumburl = element.get("thumburl")
                stiker_cdnurl = element.get("cdnurl")
                if stiker_cdnurl == None or stiker_cdnurl == "":
                    stiker_cdnurl = "http://none.example.com"
                stiker_url = stiker_thumburl
                if stiker_url == None or stiker_url == "":
                    stiker_url = stiker_cdnurl
                if stiker_type == "1" or stiker_type == "2":
                    # 是 收藏的表情 或者 商城的表情。商城表情虽然响应的 mime 能用，但是 tg 的链接预览不稳定，所以这里还是使用下载后上传的方案
                    stiker_file_path = pathlib.Path(download_dir, stiker_md5)
                    photo = stiker_file_path
                    if os.path.exists(stiker_file_path):
                        with open(stiker_file_path, "r") as f:
                            file_id = f.read()
                            photo = telegram.PhotoSize(file_id, file_id, 120, 120)
                    else:
                        r = requests.get(stiker_url)
                        with open(stiker_file_path, "wb") as f:
                            f.write(r.content)
                        if stiker_url != stiker_thumburl:
                            thumb_path = str(stiker_file_path) + "_thumb"
                            img = PIL.Image.open(stiker_file_path)
                            img = img.convert("RGB")
                            max_side = 120
                            if img.size[0] > max_side or img.size[1] > max_side:
                                img.thumbnail((max_side, max_side))
                                img.save(thumb_path, "JPEG", quality=75)
                                img.close()
                                os.remove(stiker_file_path)
                                os.renames(thumb_path, stiker_file_path)
                            else:
                                img.close()
                    sent = await bot.send_photo(
                        chat_id=config["tg_group"],
                        message_thread_id=thread_id,
                        caption=(
                            text_prefix  # 微信的昵称不允许 "<>/" 字符，这里可以偷懒不管
                            + f'[stiker <a href="{stiker_url}">url</a>]'
                        ),
                        parse_mode=telegram.constants.ParseMode.HTML,
                        photo=photo,
                    )
                    if photo == stiker_file_path:
                        with open(stiker_file_path, "wb") as f:
                            f.write(bytes(sent.photo[0].file_id, "utf-8"))
                else:
                    print("unknown stiker type: " + stiker_type)
            if msg.type == 49:
                tree = xml.etree.ElementTree.ElementTree(
                    xml.etree.ElementTree.fromstring(msg.content)
                )
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
                        text += "[xml]"
                    elif refer_type == "47":
                        text += "[stiker]"
                    else:
                        text += "[unknown_refer_type=" + refer_type + "]"
                    print([text, refer_type, refer_chatusr, refer_content])
                    await bot.send_message(
                        chat_id=config["tg_group"],
                        message_thread_id=thread_id,
                        text=text_prefix + text,
                    )
            if msg.type == 34:
                audio_path = wcf.get_audio_msg(msg.id, download_dir)
                if audio_path == "":
                    print("wcf.get_audio_msg() failed")
                    continue
                await bot.send_voice(
                    chat_id=config["tg_group"],
                    message_thread_id=thread_id,
                    voice=pathlib.Path(audio_path),
                    caption=text_prefix + "[audio]",
                )
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
                if update.message is None or update.message.message_thread_id is None:
                    continue
                thread_id = str(update.message.message_thread_id)
                if thread_id not in config["tg_wx_map"]:
                    continue
                wxid = config["tg_wx_map"][thread_id]
                # for attr in dir(update.message):
                #     print(f"{attr}: {getattr(update.message, attr)}")
                if update.message.text != None:
                    wcf_lock.acquire()
                    wcf.send_text(receiver=wxid, msg=update.message.text)
                    wcf_lock.release()
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


t1 = threading.Thread(target=lambda: asyncio.run(from_wx()))
t2 = threading.Thread(target=lambda: asyncio.run(from_tg()))
t1.start()
t2.start()
t1.join()
t2.join()

# todo:
# [video] wx->tg
# [file] wx->tg + tg->wx
# [call notify] wx->tg

# balance = 0
# lock = threading.Lock()
# def run_thread(n):
#     for i in range(100000):
#         # 先要获取锁:
#         lock.acquire()
#         try:
#             # 放心地改吧:
#             change_it(n)
#         finally:
#             # 改完了一定要释放锁:
#             lock.release()

# vim delete all = :%d
