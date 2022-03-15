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
            <div class ="ac_game_menu_item ac_game_menu_single_mode">单人模式</div>
            <div class ="ac_game_menu_item ac_game_menu_multi_mode">多人模式</div>
            <div class ="ac_game_menu_item ac_game_menu_settings">设置</div>
            </div>
            `);
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('ac_game_menu_single_mode');
        this.$multi_mode = this.$menu.find("ac_game_menu_multi_mode");
        this.$settings = this.$menu,find("ac_game_menu_settings");
        
        this.start();
    }

    start()
    {
        this.add_listening_events();
    }

    add_listening_events()
    {
        this.$single_mode.click(function(){
            console.log("click single_mode");
        });
        this.$multi_mode.click(function(){
            console.log("click multi_mode");
        });
        this.$settings.click(function(){
            console.log("click settings");
        });
    }
}
