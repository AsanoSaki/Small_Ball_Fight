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
