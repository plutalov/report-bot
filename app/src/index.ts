import { logger } from './services/logger';
import { connectToMongoDB, db } from './services/mongo';
import Bluebird from 'bluebird';
import { Task, TaskState } from './models/task';
import { bot } from './services/bot';
import { initRootFolders } from './services/init-root-folders';
import { hasBeenSentTemplate } from './services/templates/has-been-sent-template';
import { startCommand } from './services/commands/start-command';
import { helpCommand } from './services/commands/help-command';
import { statusCommand } from './services/commands/status-command';
import { upload } from './services/export-task/upload';
import { handleTask } from './services/export-task/handle-task';
import { updateStatusCallback } from './services/callbacks/update-status-callback';

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
      await handleTask(task);
    });
  } finally {
    setTimeout(resolvePendingExports, 2500);
  }
}

bot.on('document', async (ctx) => {
  await upload(ctx);
});

bot.command('status', async (ctx) => {
  await statusCommand(ctx);
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
      await updateStatusCallback(ctx);
    }
  } catch (e) {
    logger.info(e.message);
  }

  try {
    await ctx.telegram.answerCbQuery(ctx.callbackQuery.id);
  } catch (e) {
    logger.error(e, { ctx });
  }
});

bot.on('inline_query', (ctx) => {
  const result: any[] = [];

  try {
    ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result);
  } catch (e) {
    logger.error(e, { ctx });
  }
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

init();
