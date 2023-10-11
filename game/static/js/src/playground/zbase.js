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

        let outer = this;
        $(window).resize(function() {
            outer.resize();
        });  // 用户改变窗口大小时改函数会触发
    }

    // 将长宽比调整为16:9
    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;  // 当窗口大小改变时所有目标的相对大小和位置也要改变

        if (this.game_map) this.game_map.resize();  // 如果地图存在需要调用地图的resize函数
    }

    // 显示playground界面
    show() {
        this.$playground.show();

        // 将界面的宽高先存下来
        this.width = this.$playground.width();
        this.height = this.$playground.height();

        this.game_map = new GameMap(this);  // 创建游戏画面

        this.resize();  // 界面打开后需要resize一次，需要将game_map也resize

        this.players = [];  // 所有玩家
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, 'white', 0.15, true));  // 创建自己

        // 创建敌人
        for (let i = 0; i < 8; i++) {
            this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, false));
        }
    }

    // 关闭playground界面
    hide() {
        this.$playground.hide();
    }
}
