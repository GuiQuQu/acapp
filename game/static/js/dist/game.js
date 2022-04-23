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
        //console.log("调用了AcGameObject的构造函数")
    }

    start()  //只会在第一帧执行
    {

    }

    update()  //每一帧都会执行一次
    {
        //console.log('update...')
    }

    on_destory()  //删掉物体前执行,例如给对手加分等操作
    {

    }
    destroy()  //删掉该物体
    {
        this.on_destory();
        for (let i=0;i<AC_GAME_OBJECT.length;i++)
        {//js里最好用3个等号，表示全等
            if (AC_GAME_OBJECT[i]===this){
                AC_GAME_OBJECT.splice(i,1); //从下标i开始，删除一个
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
        //增加透明度为0.2,这样渲染的时候就会慢慢变成黑色，涂多了就是黑色了，有一个渐变的过程
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
        this.vx =0;
        this.vy =0;
        this.move_length =0;
        this.radius = radius;
        this.color = color; 
        this.speed = speed; //speed 使用地图高度的百分比表示
        this.is_me = is_me;
        this.eps = 0.1;
        this.cur_skill =null;
    }

    start(){
        if (this.is_me){
            this.add_listening_events();
        }
        else{
            let tx = Math.random()*this.playground.width;
            let ty = Math.random()*this.playground.height;
            this.move_to(tx,ty);
        }
    }
    get_dist(x1,y1,x2,y2)
    {
        let dx =x2-x1;
        let dy =y2-y1;
        return Math.sqrt(dx*dx+dy*dy);
    }
    move_to(tx,ty)
    {
        this.move_length = this.get_dist(this.x,this.y,tx,ty);
        //console.log(tx,ty);
        let angle =Math.atan2(ty-this.y,tx-this.x);
        this.vx =Math.cos(angle);
        this.vy =Math.sin(angle);
    }

    add_listening_events(){
        //两个监听事件,
        //1是鼠标左键移动
        //2是监听键盘Q+鼠标左键发射火球
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu",function(){
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e){
            if (e.which === 1){
                if (outer.cur_skill === "fireball"){
                    // console.log("fireballand e==1")
                    outer.shoot_fireball(e.clientX,e.clientY);
                    outer.cur_skill=null;
                }
                else{
                    outer.move_to(e.clientX,e.clientY);
                }
            }
        });
        $(window).keydown(function(e){
            if (e.which === 81){
                outer.cur_skill ="fireball";
                // console.log("outer.cur_skill=fireball")
                return false;
            }
        }); 
    }
    shoot_fireball(tx,ty){
        //console.log("shoot fireball",tx,ty);
        let x = this.x;
        let y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty-y,tx-x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 0.8;
        new FireBall(this.playground,this,x,y,radius,vx,vy,color,speed,move_length);
    }
    update(){
        if (this.move_length<this.eps){
            this.move_length = 0;
            this.vx =0;
            this.vy =0;
            if (!this.is_me){
                let tx = Math.random()*this.playground.width;
                let ty = Math.random()*this.playground.height;
                this.move_to(tx,ty);
            }
        }
        else{            
            let moved = Math.min(this.move_length,this.speed*this.timedelta/1000);
            this.x += this.vx*moved;
            this.y += this.vy*moved;
            this.move_length-=moved;
        }
        this.render();
    }


    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        this.ctx.fillStyle =this.color;
        this.ctx.fill();
    }
}
class FireBall extends AcGameObject{
    constructor (playground,player,x,y,radius,vx,vy,color,speed,move_length){
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.eps = 0.1;
        //console.log(x,y,radius,vx,vy,color,speed,move_length);
    }
    start(){
    
    }
    update(){
        if (this.move_length < this.eps){
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length,this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        this.render();
        //console.log("fire ball");
    }
    render(){
        //console.log("fire ball update")
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2,false);
        this.ctx.fillStyle = this.color;
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
        this.players.push(new Player(this,this.width/2,this.height/2,this.height*0.05,"white",this.height*0.2,true));
        
        //添加其他玩家
        for (let i=0;i<5;i++){
            this.players.push(new Player(this,this.width/2,this.height/2,this.height*0.05,"blue",this.height*0.2,false));
        }
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
