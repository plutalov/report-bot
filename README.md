<p align="center">
    <h1 align="center">Report Bot</h1>
</p>

<h4>Реализованная функциональность</h4>
<ul>
	<li>Команды /start, /help, /status;</li>
    <li>Отправка файлов;</li>
    <li>Получение файлов;</li>
    <li>Выбор формата и имени файла;</li>
	<li>Кнопки;</li>
</ul>
<h4>Особенность проекта в следующем:</h4>
<ul>
 <li>Нам не нужна боьшая инфраструктура для поддержки работоспособности бота;</li>
 <li>У нас нет хранения стейта в оперативной памяти, все в базе данных;</li>
 <li>Возможно горизонтальное масштабирование без больших изменений кода;</li>
	<li>У нас еще и докер, сможем развернуться где угодно;</li>
 </ul>
<h4>Основной стек технологий:</h4>
<ul>
	<li>TypeScript.</li>
	<li>React, Node.js.</li>
    <li>docusaurus, telegraph, winston, bluebird, axios</li>
    <li>MongoDB.</li>
	<li>Git.</li>
	<li>Docker, GitHub.</li>
 </ul>
<h4>Демо</h4>
<p>Демо сервиса доступно по адресу: https://t.me/hackathon_report_bot </p>

## СРЕДА ЗАПУСКА

1. развертывание сервиса производится на debian-like linux (debian 9+);
2. требуется установленный docker  19.03.13 и docker-compose 1.25.0
3. требуется установленная MongoDB;

## УСТАНОВКА

### Установка пакета report-bot

Выполните

```
git clone https://github.com/plutalov/report-bot.git
cd report-bot
...
```

## РАЗВОРАЧИВАНИЕ

Выполните команду в корне проекта

```
docker-compose up -d
```

### Установка зависимостей проекта

Установка зависимостей осуществляется с помощью npm или yarn.

После этого выполнить команду в директории app:

```
npm install
```

```
yarn install
```

РАЗРАБОТЧИКИ

<h4>Александр Плуталов CORE https://vk.com/alexnipple</h4>
<h4>Илья Болотов DOCS https://vk.com/i_atlas</h4>
