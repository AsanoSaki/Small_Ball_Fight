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
        this.eps = 0.01;  // 误差小于0.01认为是0
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

            this.fireball_coldtime = 1;  // 单位: s
            this.fireball_img = new Image();
            this.fireball_img.src = 'http://localhost:8000/static/image/playground/fireball.png';  // 技能图标资源链接

            this.blink_coldtime = 10;  // 闪现技能冷却时间
            this.blink_img = new Image();
            this.blink_img.src = 'http://localhost:8000/static/image/playground/blink.png';
        } else {
            // Math.random()返回一个0~1之间的数
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
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
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty);  // e.clientX/Y为鼠标点击坐标
            } else if (e.which === 1) {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                if (outer.cur_skill === 'fireball') {
                    outer.shoot_fireball(tx, ty);
                    outer.fireball_coldtime = 1;  // 用完技能后重置冷却时间
                } else if (outer.cur_skill === 'blink') {
                    outer.blink(tx, ty);
                    outer.blink_coldtime = 10;
                }

                outer.cur_skill = null;  // 释放完一次技能后还原
            }
        });
        $(window).keydown(function(e) {
            if (e.which === 81 && outer.fireball_coldtime < outer.eps) {  // Q键
                outer.cur_skill = 'fireball';
                return false;
            } else if (e.which === 70 && outer.blink_coldtime < outer.eps) {  // F键
                outer.cur_skill = 'blink';
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
        let radius = 0.01;
        let theta = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(theta), vy = Math.sin(theta);
        let color = 'orange';
        let speed = 0.5;
        let move_length = 0.8;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 0.01);
    }

    blink(tx, ty) {  // 闪现到(tx, ty)
        let x = this.x, y = this.y;
        let dist = this.get_dist(x, y, tx, ty);
        dist = Math.min(dist, 0.3);  // 最大闪现距离为0.3
        let theta = Math.atan2(ty - y, tx - x);
        this.x += dist * Math.cos(theta);
        this.y += dist * Math.sin(theta);

        this.move_length = 0;  // 闪现完之后应该停下来而不是继续移动
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
        if (this.radius < this.eps) {  // 半径小于eps认为已死
            this.destroy();
            return false;
        }
        this.damage_vx = Math.cos(theta);
        this.damage_vy = Math.sin(theta);
        this.damage_speed = damage * 90;
    }

    update() {
        this.spent_time += this.timedelta / 1000;
        this.update_move();
        if (this.is_me) {  // 只有自己才更新冷却时间
            this.update_coldtime();
        }
        this.render();
    }

    update_move() {
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
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
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
    }

    update_coldtime() {  // 更新技能冷却时间
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);  // 防止变为负数
        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }

    render() {
        let scale = this.playground.scale;  // 要将相对值恢复成绝对值
        if (this.is_me) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            // 角度从0画到2PI，是否逆时针为false
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

        if (this.is_me) {
            this.render_fireball_coldtime();
            this.render_blink_coldtime();
        }
    }

    render_fireball_coldtime() {  // 渲染火球技能图标与冷却时间
        let x = 1.5, y = 0.95, r = 0.03;
        let scale = this.playground.scale;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.fireball_coldtime > 0) {  // 技能还在冷却中则绘制冷却蒙版
            this.ctx.beginPath();
            // 角度由冷却时间决定
            let coldtime_ratio = this.fireball_coldtime / 1;  // 剩余冷却时间占总冷却时间的比例
            this.ctx.moveTo(x * scale, y * scale);  // 设置圆心从(x, y)开始画
            // 减去PI/2的目的是为了从PI/2处开始转圈，而不是从0度开始
            // 最后的参数为false为取逆时针方向，反之为顺时针，但为true后相当于绘制的是冷却时间对立的另一段，因此需要调换一下冷却时间
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - coldtime_ratio) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);  // 画完之后向圆心画一条线
            this.ctx.fillStyle = 'rgba(0, 0, 255, 0.6)';
            this.ctx.fill();
        }
    }

    render_blink_coldtime() {  // 渲染闪现技能图标与冷却时间
        let x = 1.6, y = 0.95, r = 0.03;
        let scale = this.playground.scale;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.blink_coldtime > 0) {
            this.ctx.beginPath();
            let coldtime_ratio = this.blink_coldtime / 10;
            this.ctx.moveTo(x * scale, y * scale);  // 设置圆心从(x, y)开始画
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - coldtime_ratio) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);  // 画完之后向圆心画一条线
            this.ctx.fillStyle = 'rgba(0, 0, 255, 0.6)';
            this.ctx.fill();
        }
    }
}
