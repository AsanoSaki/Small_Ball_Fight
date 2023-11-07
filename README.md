# 基于Django的球球大作战在线小游戏

## 项目介绍

本项目为基于前端三剑客 + Python 后端 Web 开发框架 Django 开发的球球大作战小游戏，项目在云端 Docker 容器中开发部署，可以轻松地将项目打包移植。

游戏画面使用 Canvas 绘制，由 `requestAnimationFrame` 函数实时刷新渲染，通过 Nginx + uWSGI 与 AcWing 平台的 AcApp 进行对接，通过 OAuth2 + Redis 实现 AcWing 平台一键登录功能，多人联机对战模式使用 WebSocket 协议同步多名玩家（多个游戏窗口）的画面以及实现在线聊天功能。

实现联机功能的完整版项目地址：[Small_Ball_Fight](https://git.acwing.com/AsanoSaki/small_ball_fight)。

## 演示Demo

![Demo](demo/Small%20Ball%20Fight%20Demo.gif)

## 操作说明

 - 鼠标右键点击移动
 - 按 `q` 键选定火球技能后点击左键发射（冷却时间1秒）
 - 按 `f` 键选定闪现技能后点击左键闪现到点击的位置（冷却时间10秒）
 - 按 `Enter` 键打开问候模式，在问候模式下按 `ESC` 键关闭问候模式，继续按 `Enter` 键发送问候话语，玩家死后可以继续问候别人

## 运行方式

 - 本地运行：`python manage.py runserver`
 - 本地修改 JS 文件后打包方式：进入 `scripts` 目录打开 Git Bash，输入 `sh compress_game_js.sh`
 - 部署云服务器：首先修改 `djangoapp` 目录中的 `settings.py` 配置文件，将自己的服务器 IP 添加到 `ALLOWED_HOSTS` 中；然后修改 `game/static/js/src/settings` 目录中的 `Settings` 类，修改 `ajax` 请求的地址（将 `localhost` 换成公网 IP）；最后使用命令 `python3 manage.py runserver 0.0.0.0:8000` 启动项目

## 管理员账户

 - 账号：admin
 - 密码：admin
