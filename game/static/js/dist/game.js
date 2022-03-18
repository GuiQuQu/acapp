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
            //属于js强制转换了，浏览器无法返回
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
let AC_GAME_OBJECT =[]; //全局数组保存游戏内的每一个对象，他们都需要在每一帧刷新

class AcGameObject
{
    constructor()
    {
        AC_GAME_OBJECT.push(this);
        this.has_called_start =false; //是否执行过start函数
        this.timedelta = 0; //当前帧距离上一帧的时间间隔,单位毫秒
        //因为可能不同浏览器的刷新频率不同，每次刷新都执行update的话，
        //不同浏览器实际的刷新频率就不一样，因此需要使用时间来衡量
        console.log("调用了AcGameObject的构造函数")
    }

    start()  //只会在第一帧执行
    {

    }

    update()  //每一帧都会执行一次
    {
        //console.log('update...')
    }

    on_destroy()  //删掉物体前执行,例如给对手加分等操作
    {

    }
    destroy()  //删掉该物体
    {
        this.on_destory();
        for (let i=0;i<AC_GAME_OBJECT.length;i++)
        {//js里最好用3个等号，表示全等
            if (AC_GAME_OBJECT[i]===this){
                AC_GAME_OBJECT.split(i,1); //从下标i开始，删除一个
                break;
            }
        }

    }
}

let last_timestamp=0;
let AC_GAME_ANIMATION = function(timestamp){
    //timestamp 当前时间戳
    //console.log(AC_GAME_OBJECT.length);
    for (let i = 0;i<AC_GAME_OBJECT.length;i++)
    {
        let obj = AC_GAME_OBJECT[i];
        if (!obj.has_called_start){
            obj.start();
            obj.has_called_start= true;
        }
        else
        {
            obj.timedelta = timestamp -last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(AC_GAME_ANIMATION); //通过递归保证循环执行
}

requestAnimationFrame(AC_GAME_ANIMATION); //js提供的一个函数，传入一个函数进去，它会在下一帧执行

class GameMap extends AcGameObject //继承自基类
{
    constructor(playground)
    {
        super(); //调用基类构造函数
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`); //画布渲染工具
        this.ctx =this.$canvas[0].getContext("2d"); //在canvas的Context里面操作,2d画布
        this.ctx.canvas.width =this.playground.width;
        this.ctx.canvas.height =this.playground.height;
        this.playground.$playground.append(this.$canvas);
        console.log("GameMap");
    }

    start()
    {
    }

    update()
    {
        this.render();
    }

    render()
    {
        //console.log("render...")
        this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
    }
}
class Player extends AcGameObject{
    constructor(playground,x,y,radius,color,speed,is_me)
    {
        super();
        console.log("player")
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color; 
        this.speed = speed; //speed 使用地图高度的百分比表示
        this.is_me = is_me;
        this.eps = 0.1;
    
    }

    start(){
    
    }
    update(){
        this.render();
    }

    render(){

        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        this.ctx.fillStyle =this.color;
        this.ctx.fill();
    }
}
class AcGamePlayGround
{
    constructor(root)
    {
        this.root =root;
        this.$playground = $(`<div class="ac_game_playground"></div>`);
        this.root.$ac_game.append(this.$playground);
        //this.hide();
        console.log(this.$playground.width());
        console.log(this.$playground.height());
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this,this.width/2,this.height/2,this.height*0.05,"white",this.height*0.15,true));
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
export class AcGame
{
    constructor(id)
    {
        this.id =id;
        //$()表示这个是一个html元素，JQuery可通过'#'+id来找到对应id的html元素
        this.$ac_game = $('#'+this.id);
//        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayGround(this);
    }
}
