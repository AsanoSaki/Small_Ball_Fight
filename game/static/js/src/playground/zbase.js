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
