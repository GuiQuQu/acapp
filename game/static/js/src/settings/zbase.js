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
                </div>
                <div class="ac_game_settings_password">
                    <div class="ac_game_settings_item">
                        <input type="password" placeholder="密码">
                    </div>
                </div>
                <div class="ac_game_settings_commit">
                    <div class="ac_game_settings_item">
                        <button>登录</button>
                    </div>
                </div>
                <div class="ac_game_settings_error_message"></div>
                <div class="ac_game_settings_option">注册</div>
                <br>
                <div class="ac_game_settings_acwing">
                    <img width = 30px src="https://app1854.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
                    <br>
                    <div>AcWing一键登录</div>
                </div>

        </div>

        <div class = "ac_game_settings_register">
               <div class="ac_game_settings_title">注册</div>
                <div class="ac_game_settings_username">
                    <div class="ac_game_settings_item">
                        <input type="text" placeholder="用户名">
                    </div>
                </div>
                <div class="ac_game_settings_password ac_game_settings_password_first">
                    <div class="ac_game_settings_item">
                        <input type="password" placeholder="密码">
                    </div>
                </div>
                <div class="ac_game_settings_password ac_game_settings_password_second">
                    <div class="ac_game_settings_item">
                        <input type="password" placeholder="确认密码">
                    </div>
                </div>
                <div class="ac_game_settings_commit">
                    <div class="ac_game_settings_item">
                        <button>注册</button>
                    </div>
                </div>
                <div class="ac_game_settings_error_message"></div>
                <div class="ac_game_settings_option">登录</div>
                <br>
                <div class="ac_game_settings_acwing">
                    <img width = 30px src="https://app1854.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
                    <br>
                    <div>AcWing一键登录</div>
                </div>

        </div>
</div>`);
        this.root.$ac_game.append(this.$settings); //$ac_game是最基础的div

        this.$login = this.$settings.find('.ac_game_settings_login');

        this.$login_username = this.$login.find(".ac_game_settings_username input");
        this.$login_password = this.$login.find(".ac_game_settings_password input");
        this.$login_commit = this.$login.find(".ac_game_settings_commit button");
        this.$login_error_message = this.$login.find(".ac_game_settings_error_message");
        this.$login_to_register = this.$login.find(".ac_game_settings_option");

        this.$login.hide();

        this.$register = this.$settings.find('.ac_game_settings_register');

        this.$register_username = this.$register.find(".ac_game_settings_username input");
        this.$register_password = this.$register.find(".ac_game_settings_password_first input");
        this.$register_password_comfirm = this.$register.find(".ac_game_settings_password_second input");
        this.$register_commit = this.$register.find(".ac_game_settings_commit button");
        this.$register_error_message = this.$register.find(".ac_game_settings_error_message");
        this.$register_to_login = this.$register.find(".ac_game_settings_option");

        this.$register.hide();

        this.start();
    }

    start(){
        this.getinfo();
        this.add_listening_events();
    }

    add_listening_events(){
        //绑定监听函数
        this.add_listening_events_login();
        this.add_listening_events_register();
    }

    add_listening_events_login(){
        let outer = this;
        this.$login_to_register.click(function(){
            outer.register();
        });
        this.$login_commit.click(function(){
            outer.log_in_on_remote();
        });
    }
    log_in_on_remote(){
    //在远程服务器上登录
        let outer = this;
        let username = this.$login_username.val(); //获取input元素的值
        let password = this.$login_password.val();
        this.$login_error_message.empty(); //清空该div的内容
        $.ajax({
            url:"https://app1854.acapp.acwing.com.cn/settings/login/",
            type:"GET",
            data:{
                username:username,
                password:password,
            },
            success:function(resp){
                console.log(resp);
                if (resp.result==="success"){
                    location.reload(); //刷新页面
                }else{
                        outer.$login_error_message.html(resp.result) // 显示错误信息
                }
            }
        });
    }
    
    log_out_on_remote(){
    //在远程服务器上登出
        if (this.platform === "ACAPP") return false;
        $.ajax({
            url:"https://app1854.acapp.acwing.com.cn/settings/logout/",
            type:"GET",
            success:function(resp){
                console.log(resp);
                if (resp.result === "success"){
                    location.reload();
                }
            }
        });
    }
    register_on_remote(){
    //在远程服务器上注册
        let outer = this;
        let username = this.$register_username.val(); //获取input元素的值
        let password = this.$register_password.val();
        let password_comfirm = this.$register_password_comfirm.val();
        this.$register_error_message.empty(); //清空该div的内容
        $.ajax({
            url:"https://app1854.acapp.acwing.com.cn/settings/register/",
            type:"GET",
            data:{
                username:username,
                password:password,
                password_comfirm:password_comfirm
            },
            success:function(resp){
                console.log(resp);
                if (resp.result==="success"){
                    location.reload(); //刷新页面
                }else{
                        outer.$register_error_message.html(resp.result) // 显示错误信息
                }
            }
        });
   
    }

    add_listening_events_register(){
        let outer = this;
        this.$register_to_login.click(function(){
                outer.login();
        });
        this.$register_commit.click(function(){
                outer.register_on_remote();
        });
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
                    //outer.register();
                }
            }
        });
    }


    hide(){
        this.$settings.hide();
    }
    
    show(){
        this.$settings.show();
    }
}
