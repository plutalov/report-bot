import { api } from './services/axios';
import { logger } from './services/logger';
import { connectToMongoDB, db } from './services/mongo';
import Bluebird from 'bluebird';
import { Task, TaskState } from './models/task';
import { bot } from './services/bot';
import { handleTaskSuccess } from './services/export-task/handle-task-success';
import { startTask } from './services/export-task/start-task';
import { initRootFolders } from './services/init-root-folders';

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
  await connectToMongoDB();

  await initRootFolders();

  await bot.launch();

  logger.info('The bot has been launched!');

  setTimeout(resolvePendingExports, 2500);
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
        state: TaskState.pendingExport,
      })
      .toArray();

    await Bluebird.map(tasks, async (task) => {
      const { data } = await api.get(`/api/rp/v1/Exports/File/${task.exportId}`);

      if (data.status === 'Success') {
        await handleTaskSuccess(task, data);
      }
    });
  } finally {
    setTimeout(resolvePendingExports, 2500);
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

  const tasksCollection = db.collection('tasks');

  const task = await tasksCollection.insertOne({
    chatId: ctx.chat.id,
    state: TaskState.queued,
    fileUrl: fileUrl.toString(),
    fileName,
  });

  await startTask(task.ops[0]);
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
