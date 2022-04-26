class Settings{

    constructor(root){
        // root 是 AcGame
        this.root = root;
        //和 getinfo函数那里对应
        this.platform = "WEB";
        if (this.root.acwingos){
            this.platform = "ACAPP"
        }
        this.getinfo();
    }
    
    register(){

    }
    
    login(){

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
                    outer.root.menu.show();
                }
                else{
                    //弹出登录界面
                    outer.login();
                }
            }
        });
    }

    start(){
        this.getinfo();
    }

    hide(){

    }
    
    show(){

    }
}
