# python -m venv .venv
# source .venv/bin/activate
# pip install telethon # Telethon-1.40.0-py3-none-any.whl.metadata

from telethon import TelegramClient, events, sync,tl
import telethon
# These example values won't work. You must get your own api_id and
# api_hash from https://my.telegram.org, under API Development.
api_id = 12345
api_hash = '0123456789abcdef0123456789abcdef'

client = TelegramClient('session_name', api_id, api_hash)
client.start()
# tl.tlobject.
