class AcGameMenu
{
    constructor(root)
    {
        this.root = root;  //root是总对象，传的就是AcGame这个对象
        //$(`xxxx`)，在里面怎么写，就怎么显示到前端。JQuery
        //html里面字符串双引号单引号都可以
        //可以对一个html起多个class名，使用空格隔开即可
        this.$menu = $(`
            <div class="ac_game_menu">
                <div class="ac_game_menu_field">
                    <div class ="ac_game_menu_item ac_game_menu_single_mode">单人模式</div>
                    <br>
                    <div class ="ac_game_menu_item ac_game_menu_multi_mode">多人模式</div>
                    <br>
                    <div class ="ac_game_menu_item ac_game_menu_settings">设置</div>
                    <br>
                </div>
            </div>
            `);
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac_game_menu_single_mode');
        this.$multi_mode = this.$menu.find(".ac_game_menu_multi_mode");
        this.$settings = this.$menu.find(".ac_game_menu_settings");
        
        this.start();
    }

     start() 
    {
        this.add_listening_events();
    }

    add_listening_events() 
    {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function(){
            console.log("click multi mode");
        });
        this.$settings.click(function(){
            console.log("click settings");
        });
    }

    show() //展示菜单界面
    {
        this.$menu.show();
    }

    hide()  //关闭当前界面
    {
        this.$menu.hide();
    }

}
class AcGamePlayGround
{
    constructor(root)
    {
        this.root =root;
        this.$playground = $(`
<div>游戏界面</div>
            `)
    this.hide();
    this.root.$ac_game.append(this.$playground);

    this.start();

    }

    start()
    {

    }

    show()
    {
        this.$playground.show();
    }

    hide()
    {
        this.$playground.hide();
    }

}
class AcGame
{
    constructor(id)
    {
        this.id =id;
        //$()表示这个是一个html元素，JQuery可通过'#'+id来找到对应id的html元素
        this.$ac_game = $('#'+this.id);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayGround(this);
    }
}
