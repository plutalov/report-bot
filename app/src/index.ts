import { Telegraf } from 'telegraf';
import axios from 'axios';
import { logger } from './logger';
import { Db } from 'mongodb';
import { connectToMongoDB } from './mongo';

if (process.env.BOT_TOKEN == null) throw new Error(`BOT_TOKEN environment variable must be set`);
if (process.env.FASTREPORT_API_TOKEN == null) throw new Error(`FASTREPORT_API_TOKEN environment variable must be set`);

const api = axios.create({
  baseURL: 'https://fastreport.cloud',
  headers: {
    Authorization: `Basic ${Buffer.from(`apikey:${process.env.FASTREPORT_API_TOKEN}`).toString('base64')}`,
  },
});

let templateRootFolder: string;
let reportRootFolder: string;
let db: Db;

const bot = new Telegraf(process.env.BOT_TOKEN);

async function init() {
  db = await connectToMongoDB();

  const testCollection = db.collection('test');

  await testCollection.insertOne({ test: 1234 });

  const response = await testCollection.find().toArray();

  logger.silly(response);

  const [
    {
      data: { id: templateFolderId },
    },
    {
      data: { id: reportFolderId },
    },
  ] = await Promise.all([
    api.get('/api/rp/v1/Templates/Root'),
    api.get('/api/rp/v1/Reports/Root'),
    api.get('/api/rp/v1/Exports/Root'),
  ]);

  templateRootFolder = templateFolderId;
  reportRootFolder = reportFolderId;

  bot.launch().then(() => logger.info('The bot has been launched!'));
}

bot.command('help', (ctx) => {
  ctx.replyWithMarkdown(
    '**No help here!**\nThere are spots even on the Sun.\n\nAuthors:\nIlya\nSanya\n\nhttps://fastreport.cloud/',
  );
});

bot.on('document', async (ctx) => {
  const file = ctx.update.message.document;

  const { file_id: fileId, file_name: fileName } = file;

  if (fileName == null) {
    ctx.reply('The file has no name');

    return;
  }

  const isExtensionSupported = /\.(frx|fpx)$/i.test(fileName);

  if (!isExtensionSupported) {
    ctx.reply('The file has an unsupported extension');

    return;
  }

  const fileUrl = await ctx.telegram.getFileLink(fileId);

  const response = await axios.get<Buffer>(fileUrl.toString(), {
    responseType: 'arraybuffer',
  });

  const { data } = await api.post(
    `/api/rp/v1/Templates/Folder/${templateRootFolder}/File`,
    {
      name: fileName,
      content: response.data.toString('base64'),
    },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json-patch+json',
      },
    },
  );

  logger.info(data);

  const { data: reportData } = await api.post(
    `/api/rp/v1/Templates/File/${data.id}/Prepare`,
    {
      name: fileName,
      parentFolderId: reportRootFolder,
    },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json-patch+json',
      },
    },
  );

  logger.info(reportData);

  ctx.reply(`The file has been added to the queue. Use /status ${reportData.id} for checking`);
});

bot.command('status', async (ctx) => {
  const parseResult = /^\/status (.+)$/.exec(ctx.message.text);

  if (!parseResult) {
    ctx.reply('Use the following syntax: /status id');

    return;
  }

  const [, id] = parseResult;

  const { data } = await api.get(`/api/rp/v1/Reports/File/${id}`);

  ctx.reply(data.status);
});

bot.command('download', async (ctx) => {
  const parseResult = /^\/download (.+)$/.exec(ctx.message.text);

  if (!parseResult) {
    ctx.reply('Use the following syntax: /status id');

    return;
  }

  const [, id] = parseResult;

  const { data } = await api.get<Buffer>(`/download/r/${id}`, { responseType: 'arraybuffer' });

  await ctx.replyWithDocument({ source: data, filename: id + '.frx' });
});

bot.command('quit', (ctx) => {
  ctx.telegram.leaveChat(ctx.message.chat.id);
});

bot.on('text', (ctx) => {
  ctx.telegram.sendMessage(ctx.message.chat.id, `Hello ${ctx.state.role} (${ctx.message.text})`);
});

bot.on('callback_query', (ctx) => {
  ctx.telegram.answerCbQuery(ctx.callbackQuery.id);
});

bot.on('inline_query', (ctx) => {
  const result: any[] = [];

  ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

init();
