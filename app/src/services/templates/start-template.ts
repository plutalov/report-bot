import { Markup } from 'telegraf';

export function startTemplate(): { text: string; markup: any } {
  const mainMenuKeyboard = Markup.keyboard([
    Markup.button.callback('/help', 'global_help'),
    Markup.button.callback('/status', 'global_status'),
  ]).resize(true);

  return {
    text: `Бот для отчетов приветствует Вас! Посмотреть список доступных команд можно с помощью /help`,
    markup: mainMenuKeyboard,
  };
}
