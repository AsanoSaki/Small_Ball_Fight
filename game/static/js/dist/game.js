class AcGameMenu {
    constructor(root) {  // root用来传AcGame对象
        this.root = root;
        // 如果是HTML对象通常会加一个'$'符号
        this.$menu = $(`
            <div class='ac_game_menu'>
                <div class='ac_game_menu_btgroup'>
                    <div class='ac_game_menu_btgroup_bt ac_game_menu_btgroup_bt_single'>
                        单人模式
                    </div>
                    <br>
                    <div class='ac_game_menu_btgroup_bt ac_game_menu_btgroup_bt_multi'>
                        多人模式
                    </div>
                    <br>
                    <div class='ac_game_menu_btgroup_bt ac_game_menu_btgroup_bt_settings'>
                        登出
                    </div>
                </div>
            </div>
        `);
        this.root.$ac_game.append(this.$menu);  // 将this.$menu添加到主类的div中
        this.$single = this.$menu.find('.ac_game_menu_btgroup_bt_single');  // class名前面要加'.'
        this.$multi = this.$menu.find('.ac_game_menu_btgroup_bt_multi');
        this.$settings = this.$menu.find('.ac_game_menu_btgroup_bt_settings');

        this.start();
    }

    start() {
        this.hide();
        this.add_listening_events();
    }

    // 给按钮绑定监听函数
    add_listening_events() {
        let outer = this;
        // 注意在function中调用this指的是function本身，因此需要先将外面的this存起来
        this.$single.click(function() {
            outer.hide();  // 关闭menu界面
            outer.root.playground.show();  // 显示playground界面
        });
        this.$multi.click(function() {
        });
        this.$settings.click(function() {
            outer.root.settings.logout_on_remote();
        });
    }

    // 显示menu界面
    show() {
        this.$menu.show();
    }

    // 关闭menu界面
    hide() {
        this.$menu.hide();
    }
}
let AC_GAME_OBJECTS = [];  // 将所有对象加到一个全局数组里，之后可以遍历每个对象刷新一次

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);

        this.has_called_start = false;  // 是否执行过start函数
        this.timedelta = 0;  // 当前帧距离上一帧的时间间隔，因为如果用帧来衡量的话不同浏览器可能帧数不一样会导致不同的效果
    }

    start() {  // 只会在第一帧执行一次
    }

    update() {  // 每一帧都会执行一次
    }

    on_destroy() {  // 在被删除前执行一次

    }

    destroy() {  // 删掉该对象
        this.on_destroy();

        for (let i = 0; i < AC_GAME_OBJECTS.length; i++) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);  // 从位置i开始删除1个
                break;
            }
        }
    }
}

let last_timestamp;  // 上一帧的时间戳

let AC_GAME_ANIMATION = function(timestamp) {  // timestamp表示在哪个时刻调用的这个函数
    for (let i = 0; i < AC_GAME_OBJECTS.length; i++) {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start) {  // 如果没有执行过start
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;  // 更新一下时间间隔
            obj.update();
        }
    }
    last_timestamp = timestamp;

    requestAnimationFrame(AC_GAME_ANIMATION)  // 递归实现每一帧都调用一次该函数
}

requestAnimationFrame(AC_GAME_ANIMATION);
class GameMap extends AcGameObject {
    constructor(playground) {  // 需要将AcGamePlayground传进来
        super();  // 调用基类构造函数，相当于将自己添加到了AC_GAME_OBJECTS中
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);  // 画布，用来渲染画面
        this.ctx = this.$canvas[0].getContext('2d');  // 二维画布
        this.ctx.canvas.width = this.playground.width;  // 设置画布宽度
        this.ctx.canvas.height = this.playground.height;  // 设置画布高度
        this.playground.$playground.append(this.$canvas);  // 将画布添加到HTML中
    }

    start() {
    }

    update() {
        this.render();  // 每一帧都要画一次
    }

    render() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';  // 黑色背景
        // 左上角坐标(0, 0)，右下角坐标(w, h)
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
class Particle extends AcGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.eps = 1;
        this.friction = 0.9;
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
            return false;
        }
        let true_move = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * true_move;
        this.y += this.vy * true_move;
        this.speed *= this.friction;
        this.move_length -= true_move;
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;  // x轴方向上的速度
        this.vy = 0;  // y轴方向上的速度
        this.damage_vx = 0;  // 被击中后在x轴方向上的速度
        this.damage_vy = 0;  // 被击中后在y轴方向上的速度
        this.damage_speed = 0;
        this.move_length = 0;  // 要移动的距离
        this.radius = radius;
        this.color = color;
        this.speed = speed;  // 每秒移动的距离
        this.is_me = is_me;
        this.eps = 0.1;  // 误差小于0.1认为是0
        this.friction = 0.9;  // 摩擦力
        this.spent_time = 0;  // 记录游戏时间，刚开局不能攻击

        this.cur_skill = null;  // 当前选的技能是什么

        if (this.is_me) {  // 用户自己的头像从服务器端获取
            this.img = new Image();
            this.img.src = this.playground.root.settings.avatar;
        }
    }

    start() {
        if (this.is_me) {
            this.add_listening_events();
        } else {
            // Math.random()返回一个0~1之间的数
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on('contextmenu', function() {
            return false;
        });  // 取消右键的菜单功能
        this.playground.game_map.$canvas.mousedown(function(e) {
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {  // 1表示左键，2表示滚轮，3表示右键
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);  // e.clientX/Y为鼠标点击坐标
            } else if (e.which === 1) {
                if (outer.cur_skill === 'fireball') {
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
                }

                outer.cur_skill = null;  // 释放完一次技能后还原
            }
        });
        $(window).keydown(function(e) {
            if (e.which === 81) {  // Q键
                outer.cur_skill = 'fireball';
                return false;
            }
        });
    }

    // 计算两点之间的欧几里得距离
    get_dist(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    // 向(tx, ty)位置发射火球
    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let theta = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(theta), vy = Math.sin(theta);
        let color = 'orange';
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 0.8;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let theta = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(theta);
        this.vy = Math.sin(theta);
    }

    is_attacked(theta, damage) {  // 被攻击到
        // 创建粒子效果
        for (let i = 0; i < 10 + Math.random() * 5; i++) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.2;
            let theta = Math.PI * 2 * Math.random();
            let vx = Math.cos(theta), vy = Math.sin(theta);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 10;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }

        this.radius -= damage;
        this.speed *= 1.08;  // 血量越少移动越快
        if (this.radius < 10) {  // 半径小于10像素认为已死
            this.destroy();
            return false;
        }
        this.damage_vx = Math.cos(theta);
        this.damage_vy = Math.sin(theta);
        this.damage_speed = damage * 90;
    }

    update() {
        this.spent_time += this.timedelta / 1000;
        // AI敌人随机向玩家射击，游戏刚开始前三秒AI不能射击
        if (this.spent_time > 3 && !this.is_me && Math.random() < 1 / 360.0) {
            let player = this.playground.players[0];
            this.shoot_fireball(player.x, player.y);
        }

        if (this.damage_speed > this.eps) {  // 有击退效果时玩家无法移动
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_vx * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_vy * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {  // AI敌人不能停下来
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } else {
                // 计算真实移动距离，与一帧的移动距离取min防止移出界
                let true_move = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * true_move;
                this.y += this.vy * true_move;
                this.move_length -= true_move;
            }
        }
        this.render();
    }

    render() {
        if (this.is_me) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            // 角度从0画到2PI，是否逆时针为false
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }
}
class FireBall extends AcGameObject {
    // 火球需要标记是哪个玩家发射的，且射出后的速度方向与大小是固定的，射程为move_length
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;  // 伤害
        this.eps = 0.1;
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }

        let true_move = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * true_move;
        this.y += this.vy * true_move;
        this.move_length -= true_move;

        // 碰撞检测
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (player !== this.player && this.is_collision(player)) {
                this.attack(player);  // this攻击player
            }
        }

        this.render();
    }

    get_dist(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    is_collision(player) {
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < this.radius + player.radius)
            return true;
        return false;
    }

    attack(player) {
        let theta = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(theta, this.damage);
        this.destroy();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
            <div class='ac_game_playground'>
            </div>
        `);
        this.root.$ac_game.append(this.$playground);

        this.start();
    }

    get_random_color() {
        let colors = ['blue', 'red', 'pink', 'grey', 'green'];
        return colors[Math.floor(Math.random() * 5)];
    }

    start() {
        this.hide();  // 初始化时需要先关闭playground界面
    }

    // 显示playground界面
    show() {
        // 将界面的宽高先存下来
        this.width = this.$playground.width();
        this.height = this.$playground.height();

        this.game_map = new GameMap(this);  // 创建游戏画面

        this.players = [];  // 所有玩家
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, 'white', this.height * 0.15, true));  // 创建自己

        // 创建敌人
        for (let i = 0; i < 8; i++) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }

        this.$playground.show();
    }

    // 关闭playground界面
    hide() {
        this.$playground.hide();
    }
}
class Settings {
    constructor(root) {
        this.root = root;
        this.platform = 'WEB';  // 默认为Web前端
        this.username = '';  // 初始用户信息为空
        this.avatar = '';

        this.$settings = $(`
            <div class='ac_game_settings'>
                <div class='ac_game_settings_login'>
                    <div class='ac_game_settings_title'>
                        Login
                    </div>
                    <div class='ac_game_settings_username'>
                        <div class='ac_game_settings_item'>
                            <input type='text' placeholder='Username'>
                        </div>
                    </div>
                    <div class='ac_game_settings_password'>
                        <div class='ac_game_settings_item'>
                            <input type='password' placeholder='Password'>
                        </div>
                    </div>
                    <div class='ac_game_settings_submit'>
                        <div class='ac_game_settings_item'>
                            <button>Login</button>
                        </div>
                    </div>
                    <div class='ac_game_settings_errormessage'>
                    </div>
                    <div class='ac_game_settings_option'>
                        Register
                    </div>
                </div>
                <div class='ac_game_settings_register'>
                    <div class='ac_game_settings_title'>
                        Register
                    </div>
                    <div class='ac_game_settings_username'>
                        <div class='ac_game_settings_item'>
                            <input type='text' placeholder='Username'>
                        </div>
                    </div>
                    <div class='ac_game_settings_password ac_game_settings_password_first'>
                        <div class='ac_game_settings_item'>
                            <input type='password' placeholder='Password'>
                        </div>
                    </div>
                    <div class='ac_game_settings_password ac_game_settings_password_second'>
                        <div class='ac_game_settings_item'>
                            <input type='password' placeholder='Confirm Password'>
                        </div>
                    </div>
                    <div class='ac_game_settings_submit'>
                        <div class='ac_game_settings_item'>
                            <button>Register</button>
                        </div>
                    </div>
                    <div class='ac_game_settings_errormessage'>
                    </div>
                    <div class='ac_game_settings_option'>
                        Login
                    </div>
                </div>
            </div>
        `);

        this.$login = this.$settings.find('.ac_game_settings_login');
        this.$login_username = this.$login.find('.ac_game_settings_username input');
        this.$login_password = this.$login.find('.ac_game_settings_password input');
        this.$login_submit = this.$login.find('.ac_game_settings_submit button');
        this.$login_errormessage = this.$login.find('.ac_game_settings_errormessage');
        this.$login_register = this.$login.find('.ac_game_settings_option');
        this.$login.hide();

        this.$register = this.$settings.find('.ac_game_settings_register');
        this.$register_username = this.$register.find('.ac_game_settings_username input');
        this.$register_password = this.$register.find('.ac_game_settings_password_first input');
        this.$register_confirm_password = this.$register.find('.ac_game_settings_password_second input');
        this.$register_submit = this.$register.find('.ac_game_settings_submit button');
        this.$register_errormessage = this.$register.find('.ac_game_settings_errormessage');
        this.$register_login = this.$register.find('.ac_game_settings_option')
        this.$register.hide();

        this.root.$ac_game.append(this.$settings);

        this.start();
    }

    start() {
        this.getinfo();  // 在初始化时需要从服务器端获取用户信息
        this.add_listening_events();
    }

    add_listening_events() {  // 绑定监听函数
        this.add_listening_events_login();
        this.add_listening_events_register();
    }

    add_listening_events_login() {
        let outer = this;
        this.$login_register.click(function() {
            outer.register();
        });
        this.$login_submit.click(function() {
            outer.login_on_remote();
        });
    }

    add_listening_events_register() {
        let outer = this;
        this.$register_login.click(function() {
            outer.login();
        });
        this.$register_submit.click(function() {
            outer.register_on_remote();
        });
    }

    login_on_remote() {  // 在远程服务器上登录
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_errormessage.empty();  // 先清空报错信息

        $.ajax({
            url: 'http://localhost:8000/settings/login/',
            type: 'GET',
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                console.log(resp);
                if (resp.result === 'success') {  // 登录成功
                    location.reload();  // 刷新页面
                } else {  // 登录失败
                    outer.$login_errormessage.html(resp.result);  // 显示报错信息
                }
            }
        });
    }

    register_on_remote() {  // 在远程服务器上注册
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let confirm_password = this.$register_confirm_password.val();
        this.$register_errormessage.empty();

        $.ajax({
            url: 'http://localhost:8000/settings/register/',
            type: 'GET',
            data: {
                username: username,
                password: password,
                confirm_password: confirm_password,
            },
            success: function(resp) {
                console.log(resp);
                if (resp.result === 'success') {
                    location.reload();
                } else {
                    outer.$register_errormessage.html(resp.result);
                }
            }
        });
    }

    logout_on_remote() {  // 在远程服务器上登出
        if (this.platform === 'ACAPP') return false;  // AcApp应该是直接关闭窗口退出

        $.ajax({
            url: 'http://localhost:8000/settings/logout/',
            type: 'GET',
            success: function(resp) {
                console.log(resp);
                if (resp.result === 'success') {
                    location.reload();
                }
            }
        });
    }

    register() {  // 打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    login() {  // 打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    getinfo() {  // 在远程服务器上获取用户是否登录的信息
        let outer = this;

        $.ajax({
            url: 'http://localhost:8000/settings/getinfo/',
            type: 'GET',
            data: {
                platform: outer.platform,
            },
            success: function(resp) {  // 调用成功的回调函数，返回的Json字典会传给resp
                console.log(resp);  // 控制台输出查看结果
                if (resp.result === 'success') {
                    outer.username = resp.username;
                    outer.avatar = resp.avatar;
                    outer.hide();
                    outer.root.menu.show();  // 用户已登录则进入菜单界面
                } else {  // 如果未登录则需要弹出登录界面
                    outer.login();
                }
            }
        });
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }
}
class AcGame {
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#' + id);  // jQuery通过id找对象的方式

        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    start() {
    }
}
