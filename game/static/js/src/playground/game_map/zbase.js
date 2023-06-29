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
