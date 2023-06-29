## 基于Django的小球大战！！！

### 管理员账户

 - 账号：admin
 - 密码：admin

### 操作说明

 - 点击鼠标右键移动
 - 按 `q` 选中火球技能后点击鼠标左键发射

### 运行方式

 - 本地运行：`python manage.py runserver`
 - 本地修改 JS 文件后打包方式：进入 `scripts` 目录打开 Git Bash，输入 `sh compress_game_js.sh`
 - 部署云服务器：首先修改 `djangoapp` 目录中的 `settings.py` 配置文件，将自己的服务器 IP 添加到 `ALLOWED_HOSTS` 中；然后修改 `game/static/js/src/settings` 目录中的 `Settings` 类，修改 `ajax` 请求的地址（将 `localhost` 换成公网 IP）；最后使用命令 `python3 manage.py runserver 0.0.0.0:8000` 启动项目
