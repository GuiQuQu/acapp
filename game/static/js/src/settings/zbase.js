class Settings{

    constructor(root){
        // root 是 AcGame
        this.root = root;
        //和 getinfo函数那里对应
        this.platform = "WEB";
        if (this.root.acwingos){
            this.platform = "ACAPP"
        }
        this.username = "";
        this.photo = "";
        this.$settings =$(
//前端html代码需要用``括起来才有效
`<div class = ac_game_settings>
        <div class = "ac_game_settings_login">
            <div class="ac_game_settings_title">登录</div>
            <div class="ac_game_settings_username">
                <div class="ac_game_settings_item">
                    <input type="text" placeholder="用户名">
                </div>
                <div class="ac_game_settings_password">
                    <div class="ac_game_settings_item">
                        <input type="password",placeholder="密码">
                    </div>
                <div>
                <div class="ac_game_settings_commit">
                    <div class="ac_game_settings_item">
                        <button>登录</button>
                    </div>
                <div>
                <div class="ac_game_settings_error_message">用户名或密码错误</div>
                <div class="ac_game_settings_option">注册</div>
                <br>
                <div class="ac_game_settings_acwing">
                    <img width = 30px src="https://app1854.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
                    <br>
                    <div>AcWing一键登录</div>
                </div>
            </div>

        </div>
        <div class = "ac_game_settings_register">
        </div>
            </div>`);
        this.root.$ac_game.append(this.$settings); //$ac_game是最基础的div
        this.$login = this.$settings.find('.ac_game_settings_login');
        this.$register = this.$settings.find('.ac_game_settings_register');
        this.$login.hide();
        this.$login.hide();
        this.start();
    }

    register(){
        this.$login.hide();
        this.$register.show();
    }
    
    login(){
        //console.log("enter show");
        this.$login.show();
        this.$register.hide();
    }
    
    getinfo(){
        let outer = this;
        $.ajax({
            //url
            url:"https://app1854.acapp.acwing.com.cn/settings/getinfo/",
            //请求类型
            type:"GET",
            //携带数据
            data:{
                platform:outer.platform
            },
            //调用成功的回调函数,请求返回的内容在resp中
            success:function(resp){
                console.log(resp);
                if (resp.result=="success"){
                    outer.hide();
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.root.menu.show();
                }
                else{
                    //弹出登录界面
                    //console.log("enter login")
                    outer.login();
                }
            }
        });
    }

    start(){
        this.getinfo();
    }

    hide(){
        this.$settings.hide();
    }
    
    show(){
        this.$settings.show();
    }
}
