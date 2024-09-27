import { Bot, InlineKeyboard,InputFile } from "grammy";
/** @import {Message,InputMediaPhoto,InputMediaDocument, InputFile} from "grammy/types" */

//Create a new bot
const bot = new Bot("");

//This function handles the /scream command
bot.command("scream", () => {
  screaming = true;
});

//This function would be added to the dispatcher as a handler for messages coming from the Bot API
bot.on("message", async (ctx) => {
  // /** @type {InputFile} */
  // const a = {}
  await ctx.replyWithPhoto(
    new InputFile(
      new URL(
        `https://api.telegram.org/file/bot${bot.token}/${
          (
            await bot.api.getFile(ctx.message.document.file_id)
          ).file_path
        }`
      )
    )
  );
  //   ctx.replyWithPhoto(ctx.message.document.file_id);

  //   await fetch()
});

//Start the Bot
console.log("begin");
bot.start();
