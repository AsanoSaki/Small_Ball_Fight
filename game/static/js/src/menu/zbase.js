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
