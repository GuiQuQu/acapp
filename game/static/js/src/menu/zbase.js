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
        //find函数可以帮助我们寻找对象，使用class名前需要加上.
        this.$single_mode = this.menu.find('.ac_game_menu_single_mode');
        this.$multi_mode = this.menu.find(".ac_game_menu_multi_mode");
        this.$settings = hits.menu,find(".ac_game_menu_settings");
        
    }
}
