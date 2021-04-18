import { api } from './services/axios';
import { logger } from './services/logger';
import { connectToMongoDB, db } from './services/mongo';
import Bluebird from 'bluebird';
import { Task, TaskState } from './models/task';
import { bot } from './services/bot';
import { handleTaskSuccess } from './services/export-task/handle-task-success';
import { startTask } from './services/export-task/start-task';
import { initRootFolders } from './services/init-root-folders';
import { hasBeenSentTemplate } from './services/templates/has-been-sent-template';
import { taskStatusTemplate } from './services/templates/task-status-template';
import { startCommand } from './services/commands/start-command';
import { helpCommand } from './services/commands/help-command';

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

bot.command('start', async (ctx) => {
  logger.silly('start');
  await startCommand(ctx);
});

bot.command('help', async (ctx) => {
  await helpCommand(ctx);
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
      const { data }: { data: IExportData } = await api.get(`/api/rp/v1/Exports/File/${task.exportId}`);

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

  const extensionResult = /\.(frx|fpx)$/i.exec(fileName);

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
    fileExtension: extensionResult[1],
  });

  await startTask(task.ops[0]);
});

bot.command('status', async (ctx) => {
  const tasksCollection = db.collection('tasks');

  const tasks = await tasksCollection
    .find({ chatId: ctx.chat.id, $or: [{ state: TaskState.queued }, { state: TaskState.pendingExport }] })
    .toArray();

  if (tasks.length) {
    const statuses = tasks.map((task) => {
      const { text } = taskStatusTemplate(task);

      return `Файл: ${task.fileName}\nТекущий статус: ${text}`;
    });

    ctx.reply(statuses.join('\n\n'));
  } else {
    ctx.reply('Все загруженные файлы были успешно экспортированы.');
  }
});

bot.command('quit', (ctx) => {
  ctx.telegram.leaveChat(ctx.message.chat.id);
});

bot.on('text', async (ctx) => {
  await startCommand(ctx);
});

bot.on('callback_query', async (ctx) => {
  try {
    const data = (ctx.callbackQuery as any).data;

    if (data === 'update_status') {
      const tasksCollection = db.collection('tasks');

      const task = await tasksCollection.findOne({ statusMessageId: ctx.callbackQuery.message?.message_id });

      const { text, markup } = hasBeenSentTemplate(task);

      await ctx.telegram.editMessageText(
        ctx.callbackQuery.message?.chat.id,
        ctx.callbackQuery.message?.message_id,
        undefined,
        text,
        markup,
      );
    }
  } catch (e) {
    logger.info(e.message);
  }

  await ctx.telegram.answerCbQuery(ctx.callbackQuery.id);
});

bot.on('inline_query', (ctx) => {
  const result: any[] = [];

  ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

init();
