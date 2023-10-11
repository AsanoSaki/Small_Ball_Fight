class Settings {
    constructor(root) {
        this.root = root;
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
