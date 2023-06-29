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
