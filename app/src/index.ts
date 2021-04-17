import { Telegraf } from 'telegraf';
import { Db } from 'mongodb';
import { api, axios } from './services/axios';
import { logger } from './services/logger';
import { connectToMongoDB } from './services/mongo';
import Bluebird from 'bluebird';
import { Task, TaskState } from './models/task';

if (process.env.BOT_TOKEN == null) throw new Error(`BOT_TOKEN environment variable must be set`);

let templateRootFolder: string;
let reportRootFolder: string;
let exportRootFolder: string;
let db: Db;

const bot = new Telegraf(process.env.BOT_TOKEN);

interface IData {
  reportInfo: {
    author: null | string;
    created: string;
    creatorVersion: string;
    description: null | string;
    modified: string;
    name: null | string;
    picture: null | string;
    previewPictureRatio: number;
    saveMode: string;
    savePreviewPicture: boolean;
    tag: null | string;
    version: null | string;
  };
  name: string;
  parentId: string;
  tags: null | string;
  icon: null | string;
  type: string;
  size: number;
  subscriptionId: string;
  status: string;
  id: string;
  createdTime: string;
  creatorUserId: string;
  editedTime: string;
  editorUserId: string;
}

interface IExportData {
  format: string;
  reportId: string;
  name: string;
  parentId: string;
  tags: null | string;
  icon: null | string;
  type: string;
  size: number;
  subscriptionId: string;
  status: string;
  id: string;
  createdTime: string;
  creatorUserId: string;
  editedTime: string;
  editorUserId: string;
}

async function init() {
  db = await connectToMongoDB();

  const [
    {
      data: { id: templateFolderId },
    },
    {
      data: { id: reportFolderId },
    },
    {
      data: { id: exportFolderId },
    },
  ] = await Promise.all([
    api.get('/api/rp/v1/Templates/Root'),
    api.get('/api/rp/v1/Reports/Root'),
    api.get('/api/rp/v1/Exports/Root'),
  ]);

  templateRootFolder = templateFolderId;
  reportRootFolder = reportFolderId;
  exportRootFolder = exportFolderId;

  await bot.launch();

  logger.info('The bot has been launched!');

  setTimeout(resolvePendingExports, 5000);
}

bot.command('help', (ctx) => {
  ctx.replyWithMarkdown(
    '**Report Bot**\n\nСписок доступных команд:\n```/start```\n```/help```\n```/status```\n\nАвторы:\nIlya\nSanya\n\nhttps://fastreport.cloud/',
  );
});

async function resolvePendingExports() {
  try {
    const tasksCollection = db.collection('tasks');

    const tasks: Task[] = await tasksCollection
      .find({
        state: TaskState.pending,
      })
      .toArray();

    await Bluebird.map(tasks, async (task) => {
      const { data } = await api.get(`/api/rp/v1/Exports/File/${task.exportId}`);

      if (data.status === 'Success') {
        const { data: resultData } = await api.get(`/download/e/${task.exportId}`, { responseType: 'stream' });

        await bot.telegram.sendDocument(task.chatId, {
          source: resultData,
          filename: data.name,
        });

        await tasksCollection.updateOne({ _id: task._id }, { $set: { state: TaskState.resolved } });

        logger.info(`The task ${task._id} has been resolved`);
      }
    });
  } finally {
    setTimeout(resolvePendingExports, 5000);
  }
}

bot.on('document', async (ctx) => {
  const file = ctx.update.message.document;

  const { file_id: fileId, file_name: fileName } = file;

  if (fileName == null) {
    ctx.reply('The file has no name');

    return;
  }

  const extensionResult = /\.(frx|fpx)$/i.test(fileName);

  if (!extensionResult) {
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

  logger.info(data, { action: 'upload file' });

  const { data: exportData } = await api.post(
    `/api/rp/v1/Templates/File/${data.id}/Export`,
    {
      fileName,
      folderId: exportRootFolder,
      format: 'Pdf',
    },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json-patch+json',
      },
    },
  );

  logger.info(exportData, { action: 'export' });

  const tasksCollection = db.collection('tasks');

  await tasksCollection.insertOne({
    chatId: ctx.chat.id,
    exportId: exportData.id,
    state: TaskState.pending,
  });

  ctx.reply(
    `Файл ${fileName} был добавлен в очередь для генерации отчета.\nИспользуйте команду /status ${exportData.id} для проверки статуса.`,
  );
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
