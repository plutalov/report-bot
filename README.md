<p align="center">
    <h1 align="center">Report Bot</h1>
</p>

<h4>Реализованная функциональность</h4>
<ul>
    <li>Функционал 1;</li>
    <li>Функционал 2;</li>
    <li>Функционал 3;</li>
</ul>
<h4>Особенность проекта в следующем:</h4>
<ul>
 <li>Киллерфича-1;</li>
 <li>Киллерфича-2;</li>
 <li>Киллерфича-3;</li>
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
<p>Демо сервиса доступно по адресу: http://demo.test </p>
<p>Реквизиты тестового пользователя: email: <b>testuser@test.ru</b>, пароль: <b>testuser</b></p>

## СРЕДА ЗАПУСКА

1. развертывание сервиса производится на debian-like linux (debian 9+);
2. требуется установленный web-сервер с поддержкой PHP(версия 7.4+) интерпретации (apache, nginx);
3. требуется установленная СУБД MariaDB (версия 10+);
4. требуется установленный пакет name1 для работы с...;

## УСТАНОВКА

### Установка пакета name

Выполните

```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install name1
sudo apt-get install mariadb-client mariadb-server
git clone https://github.com/Sinclear/default_readme
cd default_readme
...
```

### База данных

Необходимо создать пустую базу данных, а подключение к базе прописать в конфигурационный файл сервиса по адресу: папка_сервиса/...

```
sudo systemctl restart mariadb
sudo mysql_secure_installation
mysql -u root -p
mypassword
CREATE DATABASE mynewdb;
quit
```

### Выполнение миграций

Для заполнения базы данных системной информацией выполните в корневой папке сервиса:

```
mysql -u root -p -f mynewdb < папка_сервиса/...
mypassword
```

и согласитесь с запросом

### Установка зависимостей проекта

Установка зависимостей осуществляется с помощью [Composer](http://getcomposer.org/). Если у вас его нет вы можете установить его по инструкции
на [getcomposer.org](http://getcomposer.org/doc/00-intro.md#installation-nix).

После этого выполнить команду в директории проекта:

```
composer install
```

РАЗРАБОТЧИКИ

<h4>Александр Плуталов CORE https://t.me/test@name1</h4>
<h4>Илья Болотов DOCS https://t.me/test@name1</h4>
