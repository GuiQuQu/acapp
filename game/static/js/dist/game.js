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
                    <div class ="ac_game_menu_item ac_game_menu_settings">退出</div>
                    <br>
                </div>
            </div>
            `);
        this.hide();
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
            outer.root.playground.show("single-mode");
        });
        this.$multi_mode.click(function(){
            outer.hide();
            outer.root.playground.show("multi-mode");
        });
        this.$settings.click(function(){
            //console.log("click settings");
            outer.root.settings.log_out_on_remote();
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
        this.uuid = this.create_uuid();
    }
    //uuid 来表示这个物品的唯一的id,这样在多人联机对战的时候就可以通过uuid确认这个谁发的消息,
    //这里保证uuid唯一的逻辑是随机8位数,重复的概率很低
    create_uuid(){
        let res ="";
        for (let i =0;i<8;i++){
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
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
        this.on_destroy();
        for (let i=0;i<AC_GAME_OBJECT.length;i++)
        {//js里最好用3个等号，表示全等
            if (AC_GAME_OBJECT[i]===this){
                AC_GAME_OBJECT.splice(i,1); //从下标i开始，删除一个
                break;
            }
        }

    }
}

let last_timestamp = 0;
let AC_GAME_ANIMATION = function(timestamp){
    //timestamp 当前时间戳
    //console.log(AC_GAME_OBJECT.length);
    for (let i = 0;i < AC_GAME_OBJECT.length ; i ++)
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

class ChatField
{

    constructor(playground)
    {
        this.playground = playground;

        this.$history = $(`<div class ="ac_game_chat_field_history">历史记录</div>`);
        this.$input = $(`<input type="text" class="ac_game_chat_field_input">`);

        this.$history.hide();
        this.$input.hide();

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.func_id = null;
        this.start();
    }

    start ()
    {
        this.add_listening_events();
    }

    update ()
    {

    }
    
    add_listening_events()
    {
        let outer = this;
        this.$input.keydown(function(e){
            if (e.which === 27)
            {
                outer.hide_input();
                return false;
            }
            else if (e.which === 13)
            {
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val();
                if (text)
                {
                    outer.$input.val("");
                    outer.add_message(username,text);
                    outer.playground.mps.send_message(username,text);
                }
                return false; // 表示回车按键不向上传递
            }
        });
    }

    add_message(username,text)
    {
        this.show_history();
        let message = `[${username}]:${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
        
        //console.log(this.$history.length);
        //this.$history[this.$history.length-1].scrollIntoView(false);
    }

    render_message(message){
        return `<div>${message}<div>`
    }

    show_history()
    {
        //console.log("show history")
        //需要实现的逻辑是
        //每次打开input,显示history,esc input,history不消失,等待3秒消失
        //但是当打开新的input的时候history需要刷新倒计时
        this.$history.fadeIn();
        let outer = this;
        //如果当前有正在进行的倒计时,清空这个函数id,然后绑定新的倒计时
        if (this.func_id)
            clearTimeout(this.func_id);
        //设置新的函数id
        this.func_id = setTimeout(function(){
            //执行完操作之后清空函数id
            outer.$history.fadeOut();
            outer.func_id = null;
        },3000);
    }
    show_input()
    {
        this.$input.show();
        this.show_history();
        this.$input.focus();
    }

    hide_input()
    {
        this.$input.hide();
        this.playground.game_map.$canvas.focus();
    }
}
class GameMap extends AcGameObject //继承自基类
{
    constructor(playground)
    {
        super(); //调用基类构造函数
        this.playground = playground;
        // 添加tabindex之后,能够让canvas监听输入信息
        this.$canvas = $(`<canvas tabindex=0></canvas>`); //画布渲染工具
        this.ctx =this.$canvas[0].getContext("2d"); //在canvas的Context里面操作,2d画布
        this.ctx.canvas.width =this.playground.width;
        this.ctx.canvas.height =this.playground.height;
        this.playground.$playground.append(this.$canvas);
        //console.log("GameMap");
    }

    start()
    {
        this.$canvas.focus();
    }
    resize(){
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height =this.playground.height;
        //每次改变完大小之后,屏幕会出现渐变的闪的效果,需要把这个效果处理掉
        this.ctx.fillStyle = "rgba(0,0,0,1)"; //强行涂一层不透明的蒙版,用黑的盖掉掉原来透明渐变的
        this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
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
class NoticeBoard extends AcGameObject
{
    constructor (playground)
    {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text = "已就绪 0 人";
        //this.start();
    }

    start()
    {

    }

    update()
    {
        this.render();
    }

    write(text)
    {
        this.text = text;
    }
    
    render()
    {
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width / 2, 30);
    }
}
class Particle extends AcGameObject{
    constructor (playground,x,y,radius,vx,vy,color,speed,move_length)
    {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.friction = 0.95;
        this.move_length = move_length;
        this.eps = 0.005; // 绝对 2 相对
    }

    start(){
    }

    update(){
        if (this.speed < this.eps || this.move_length < this.eps)
        {
            this.destroy();
            //this.render();
            return false;
        }
        let moved = Math.min(this.move_length,this.speed * this.timedelta / 1000); 
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }

    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends AcGameObject{
    constructor(playground,x,y,radius,color,speed,player_type,username,photo)
    {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.friction = 0.9;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed; //speed 使用地图高度的百分比表示
        this.player_type = player_type;
        this.eps = 0.01; // 绝对 改 相对
        this.spend_time = 0;
        this.cur_skill =null;
        this.fireballs = [];
        if (this.player_type !== "robot")
        {
            this.img = new Image();
            this.img.src = photo;
            // 向服务器发送创建玩家的信息 {"event":create player,"uuid":uuid,"username":username,"photo":photod
            this.username = username;
        }
        if (this.player_type === "me")
        {
            this.fireball_coldtime = 3;
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";
            //闪现CD
            this.blink_coldtime = 5;
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }
    }

    start()
    {
        this.playground.player_count ++ ;
        this.playground.noticeboard.write("已就绪: " + this.playground.player_count + " 人");
        if (this.playground.player_count >= 3)
        {
            this.playground.state = "fighting";
            this.playground.noticeboard.write("Fighting")
        }
        if (this.player_type === "me")
        {
            this.add_listening_events();
        }
        else if (this.player_type === "robot")
        {
            //绝对 to 相对
            let scale = this.playground.scale;
            let tx = Math.random() * this.playground.width / scale;
            let ty = Math.random() * this.playground.height / scale;
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
        let angle =Math.atan2(ty-this.y,tx-this.x);
        this.vx =Math.cos(angle);
        this.vy =Math.sin(angle);
    }

    add_listening_events()
    {
        //两个监听事件,
        //1是鼠标左键移动
        //2是监听键盘Q+鼠标左键发射火球
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu",function(){
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e){
            //绝对 to 相对
            let scale = outer.playground.scale;
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 1)
            {
                if (outer.playground.state !== "fighting")
                    return false;
                //射击
                let tx = (e.clientX-rect.left) / scale;
                let ty = (e.clientY-rect.top) / scale;
                if (outer.cur_skill === "fireball")
                {
                    if (outer.fireball_coldtime > outer.eps)
                        return false;
                    let fireball = outer.shoot_fireball(tx,ty);
                    outer.cur_skill = null;
                    if (outer.playground.mode === "multi-mode")
                    {
                        outer.playground.mps.send_shoot_fireball (tx,ty,fireball.uuid);
                    }
                }
                else if (outer.cur_skill === "blink")
                {
                    if (outer.blink_coldtime > outer.eps)
                        return false;
                    outer.blink(tx,ty);
                    if (outer.playground.mode === "multi-mode")
                    {
                        outer.playground.mps.send_blink(tx,ty);
                    }
                }
            }
            else if (e.which === 3)
            {    
                if (outer.playground.state !== "fighting")
                    return false;
                //移动
                let tx = (e.clientX-rect.left) / scale;
                let ty = (e.clientY-rect.top) / scale;
                outer.move_to(tx,ty);
                if (outer.playground.mode === "multi-mode")
                {
                    outer.playground.mps.send_move_to(tx,ty);
                }
            }
        });
        //$(window).keydown(function(e)
        //使用原来代码,一个页面内的每一个窗口都会接受键盘的输入,当同时
        //打开多个窗口时,会出现bug
        this.playground.game_map.$canvas.keydown(function(e)
        {
            if (e.which === 13)
            {
                if (outer.playground.mode === "multi-mode")
                {
                    outer.playground.chat_field.show_input();
                }
            }
            else if (e.which === 27)
            {
                if (outer.playground.mode === "multi-mode")
                {
                    outer.playground.chat_field.hide_input();
                }
            }

            if (outer.playground.state !="fighting")
                return true;

            if (e.which === 81)
            {
                if (outer.fireball_coldtime > outer.eps)
                    return true;
                outer.cur_skill ="fireball";
                return false;
            } else if (e.which === 70)
            {
                if (outer.fireball_coldtime > outer.eps)
                    return true;
                outer.cur_skill = "blink";
                return false;
            }
        });
    }

    shoot_fireball(tx,ty){
        let x = this.x;
        let y = this.y;
        let scale = this.playground.scale;
        let radius = this.playground.height / scale * 0.01;
        let angle = Math.atan2(ty-y,tx-x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height / scale * 0.5;
        let move_length = this.playground.height / scale * 0.8;
        let fireball = new FireBall(this.playground,this,x,y,radius,vx,vy,color,speed,move_length,this.playground.height / scale * 0.01);
        this.fireballs.push(fireball);
        this.fireball_coldtime = 3;
        return fireball;
    }

    blink(tx,ty)
    {
        let dist = this.get_dist(this.x,this.y,tx,ty);
        let d = Math.min(dist, 0.8);
        let angle = Math.atan2(ty-this.y,tx-this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);
        this.move_length = 0 //闪现之后停下来
        this.blink_coldtime = 5;
    }
    destroy_fireball(uuid)
    {
        for (let i=0;i<this.fireballs.length;i++)
        {
            let fireball = this.fireballs[i];
            if (uuid === fireball.uuid)
            {
                fireball.destroy();
                break;
            }
        }
    }

    is_attacked(angle,damage)
    {
        for (let i =0 ;i< 30 + Math.random() * 15 ;i++)
        {
            let scale = this.playground.scale;
            let x = this.x,y =this.y;
            let radius = this.radius * Math.random() * 0.15;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle);
            let vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 0.5;
            let move_length = damage * 5 * Math.random();
            new Particle(this.playground,x,y,radius,vx,vy,color,speed,move_length);
        }
        this.radius -= damage;
        if (this.radius<this.eps)
        {
            //this.on_destroy();
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 0.8;
    }

    receive_attacked (x,y,angle,damage,ball_uuid,attacker)
    {
        attacker.destroy_fireball(ball_uuid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle,damage);
    }
    on_destroy()
    {
        if (this.player_type === "me")
        {
            this.playground.state = "over";
        }
        for (let i = 0;i<this.playground.players.length;i++)
        {
            if (this === this.playground.players[i])
            {
                this.playground.players.splice(i,1);
                break;
            }
        }
    }
    update()
    {
        this.spend_time += this.timedelta / 1000;
        if (this.player_type === "me" && this.playground.state === "fighting")
        {
            this.update_coldtime();
        }
        this.update_move();
        this.render();
    }

    update_coldtime()
    {
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(0,this.fireball_coldtime);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(0,this.blink_coldtime);
    }

    update_move()
    {
        if (this.player_type==="robot" && this.spend_time > 2 && Math.random() < 1 / 180.0 )
        {
            let target = Math.floor(Math.random() * this.playground.players.length);
            let player = this.playground.players[target];
            if (player!== this)
                this.shoot_fireball(player.x,player.y);
        }
        if (this.damage_speed > this.eps )
        {
            this.vx = 0,this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }
        else
        {
            if (this.move_length < this.eps)
            {
                let scale = this.playground.scale
                this.move_length = 0;
                this.vx = 0;
                this.vy = 0;
                if (this.player_type === "robot")
                {
                    let tx = Math.random() * this.playground.width / scale;
                    let ty = Math.random() * this.playground.height / scale;
                    this.move_to(tx,ty);
                }
            }
            else
            {
                let moved = Math.min(this.move_length,this.speed * this.timedelta/1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
    }

    render()
    {
        let scale = this.playground.scale;
        if (this.player_type !== "robot"){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(
                this.img,
                (this.x - this.radius) * scale,
                (this.y - this.radius) * scale,
                this.radius * 2 * scale,
                this.radius * 2 * scale);
            this.ctx.restore();
        }
        else{
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale,this.y * scale,this.radius * scale,0,Math.PI * 2,false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
        if (this.player_type === "me" && this.playground.state === "fighting")
        {
            this.render_skill_coldtime();
        }
    }

    render_skill_coldtime()
    {
        let scale = this.playground.scale;
        //scale 单位是页面高度,因此宽度的长度为 16/9*scale 约等于1.7
        let x = 1.5 , y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(
            this.fireball_img,
            (x - r) * scale,
            (y - r) * scale,
            r * 2 * scale,
            r * 2 * scale);
        this.ctx.restore();
        if (this.fireball_coldtime > 0){
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            //调整绘制的角度,让冷却时间顺时针转
            this.ctx.arc(x * scale,y * scale,r * scale,0 - Math.PI / 2,Math.PI * 2 * (1 -  this.fireball_coldtime / 3) - Math.PI / 2 ,true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0,0,255,0.6)";
            this.ctx.fill();
        }
        x = 1.62 , y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(
            this.blink_img,
            (x - r) * scale,
            (y - r) * scale,
            r * 2 * scale,
            r * 2 * scale);
        this.ctx.restore();
        if (this.blink_coldtime > 0){
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            //调整绘制的角度,让冷却时间顺时针转
            this.ctx.arc(x * scale,y * scale,r * scale,0 - Math.PI / 2,Math.PI * 2 * (1 -  this.blink_coldtime / 5) - Math.PI / 2 ,true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0,0,255,0.6)";
            this.ctx.fill();
        }
    }
}
class FireBall extends AcGameObject{
    constructor (playground,player,x,y,radius,vx,vy,color,speed,move_length,damage){
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
        this.damage = damage;
        this.eps = 0.01; //绝对 to 相对
    }
    start()
    {
        this.spend_time += this.timedelta / 1000;
        if (!this.is_me && this.spend_time > 2 && Math.random() < 1 / 180.0 )
        {
            var player = this.playground.players[0];
            if (this === player)
            {
                player = this.playground.players[this.playground.players.length-1];
            }
            //每次总选择players[0]
            if (player !== this)
            {
                let tx = player.x;
                let ty = player.y;
                this.shoot_fireball(tx,ty);
            }
        }
        if (this.damage_speed > 10 )
        {
            this.vx = 0,this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;

            this.damage_speed *= this.friction;
        }
        else
        {
            if (this.move_length < this.eps)
            {
                this.move_length = 0;
                this.vx = 0;
                this.vy = 0;
                if (!this.is_me)
                {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx,ty);
                }
            }
            else
            {
                let moved = Math.min(this.move_length,this.speed*this.timedelta/1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
    }

    update()
    {
        if (this.move_length < this.eps)
        {
            this.destroy();
            return false;
        }
        this.update_move();
        // 每一个窗口只为非敌人球球判断碰撞,其他窗口里自己发射的炮弹不判断碰撞,只是动画
        if (this.player.player_type !== "enemy")
        {
            this.update_attack();
        }
        this.render();
    }

    update_move()
    {
        let moved = Math.min(this.move_length,this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }

    update_attack()
    {
        //判断碰撞
        for (let i=0;i<this.playground.players.length;i++)
        {
            let player = this.playground.players[i];
            if (player !==this.player && this.is_collision(player))
            {
                this.attack(player);
                break; //这样火球只会攻击一名玩家
            }
        }
    }

    get_dist(x,y,tx,ty)
    {
        let dx = tx-x;
        let dy = ty-y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player)
    {
        return this.get_dist(this.x,this.y,player.x,player.y) < this.radius + player.radius;
    }

    attack(player)
    {
        let angle = Math.atan2(player.y-this.y,player.x-this.x);
        player.is_attacked(angle,this.damage);
        if (this.playground.mode === "multi-mode")
        {
            this.playground.mps.send_attack(player.uuid,player.x,player.y,angle,this.damage,this.uuid);
        }
        this.destroy();
    }

    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale,this.y * scale,this.radius * scale,0,Math.PI * 2,false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy()
    {
        let fireballs = this.player.fireballs;
        for (let i = 0; i < fireballs.length ; i++)
        {
            let tfb = fireballs[i];
            if (tfb==this)
            {
                fireballs.splice(i,1);
                break;
            }
        }
    }
}
class MultiPlayerSocket{

    constructor(playground){
        this.playground = playground;
        //创建一个WebSocket连接,后面的/wss/multiplayer 是自己实现的路由
        this.ws = new WebSocket("wss://app1854.acapp.acwing.com.cn/wss/multiplayer/");
        this.uuid = -1;
        this.start();
    }

    start () {
        this.receive();
    }
    
    receive () {
        let outer = this;
        //指定当收到服务器发来的消息的时候的回调函数
        this.ws.onmessage = function(e){
            let data = JSON.parse(e.data);
            //console.log(data);
            let uuid = data.uuid;
            if (uuid === outer.uuid)
                   return false;
            let event = data.event;
            if (event === "create player")
                outer.receive_create_player(uuid,data.username,data.photo);
            else if (event === "move to")
                outer.receive_move_to(uuid,data.tx,data.ty);
            else if (event === "shoot fireball")
                outer.receive_shoot_fireball(uuid,data.tx,data.ty,data.ball_uuid);
            else if (event === "attack")
                outer.receive_attack(
                    uuid,
                    data.attacked_uuid,
                    data.x,
                    data.y,
                    data.angle,
                    data.damage,
                    data.ball_uuid);
            else if (event === "blink")
                outer.receive_blink(uuid,data.tx,data.ty);
            else if (event === "message")
                outer.receive_message(uuid,data.message);
        };
    }

    send_create_player(username,photo){
        let outer = this;
        //利用ws想服务器发送请求
        //console.log("send create player")
        //console.log(username)
        this.ws.send(JSON.stringify({
        "event":"create player",
        "uuid":outer.uuid,
        "username":username,
        "photo":photo,
        }));
    }

    receive_create_player(uuid,username,photo)
    {
        let pg = this.playground;
        let player = new Player(
            pg,
            pg.width / 2 / pg.scale,
            pg.height / 2 / pg.scale,
            pg.height / pg.scale * 0.05,
            "white",
            pg.height / pg.scale * 0.2,
            "enemy",
            username,
            photo,
        );
        player.uuid = uuid;
        pg.players.push(player);
    }

    send_move_to (tx,ty) 
    {
        let outer = this;
        this.ws.send(JSON.stringify({
            "event":"move to",
            "uuid": outer.uuid,
            "tx":tx,
            "ty":ty,
        }));
    }

    receive_move_to (uuid,tx,ty) 
    {
        let pg = this.playground;
        let player = this.get_player(uuid);
        if (player)
                player.move_to(tx,ty);
    }

    get_player(uuid)
    {
        let players = this.playground.players;
        for (let i = 0 ; i<players.length ; i++){
            let player = players[i];
            if (player.uuid === uuid)
                   return player;
        }
        return null;
    }

    send_shoot_fireball(tx,ty,ball_uuid)
    {
        let outer = this;
        this.ws.send(JSON.stringify({
            "event":"shoot fireball",
            "uuid":outer.uuid,
            "tx":tx,
            "ty":ty,
            "ball_uuid":ball_uuid,
        }));
    }
    receive_shoot_fireball(uuid,tx,ty,ball_uuid)
    {
        let pg =this.playground;
        let player = this.get_player(uuid);
        if (player)
        {
            let fireball = player.shoot_fireball(tx,ty);
            fireball.uuid = ball_uuid;
        }
    }

    send_attack(attacked_uuid,x,y,angle,damage,ball_uuid)
    {
        //被击中的人的uuid, x,y 被击中角度,被击中伤害,使用的炮弹的uuid,用来删除其他窗口仅作特效的炮弹
        //被击中时,会强行同步所有窗口被击中者的位置
        //console.log("send_attack",damage);
        let outer = this;
        this.ws.send(JSON.stringify({
            "event":"attack",
            "uuid":outer.uuid,
            "attacked_uuid":attacked_uuid,
            "x":x,
            "y":y,
            "angle":angle,
            "damage":damage,
            "ball_uuid":ball_uuid,
        }));
    }

    receive_attack(attacker_uuid,attacked_uuid,x,y ,angle,damage,ball_uuid)
    {
        let attacker = this.get_player(attacker_uuid);
        let attacked = this.get_player(attacked_uuid);
        if (attacker && attacked)
        {
            attacked.receive_attacked(x,y,angle,damage,ball_uuid,attacker);
        }
    }

    send_blink(tx,ty)
    {
        let outer = this;
        this.ws.send(JSON.stringify({
            "event":"blink",
            "uuid":outer.uuid,
            "tx":tx,
            "ty":ty,
        }));
    }

    receive_blink(uuid,tx,ty)
    {
        let player = this.get_player(uuid);
        if (player)
        {
            player.blink(tx,ty);
        }
    }

    send_message(username,message)
    {
        let outer = this;
        this.ws.send(JSON.stringify({
            "event":"message",
            "uuid":outer.uuid,
            "username":username,
            "message":message,
        }));
    }

    receive_message(uuid,message){
        let player = this.get_player(uuid);
        if (player)
        {
            player.playground.chat_field.add_message(player.username,message);
        }
        
    }
}

class AcGamePlayGround
{
    constructor(root)
    {
        this.root = root;
        this.$playground = $(`<div class="ac_game_playground"></div>`);
        this.root.$ac_game.append(this.$playground);
        this.hide();
        this.start();
    }

    get_random_color()
    {
        let colors = ["blue","red","orange","pink","green","yellow"];
        return colors[Math.floor(Math.random()* colors.length)];
    }

    start()
    {
        let outer = this;
        $(window).resize(function(){
            outer.resize();
        });
    }

    resize()
    {
        //把窗口大小放缩到当前窗口大小,并且保证长宽比为16：9
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;
        if (this.game_map) this.game_map.resize();
        // 在拖动窗口的时候,界面上的元素都需要随着窗口大小变化而变化，因此需要一个基准,选择height作为单位1,然后游戏内的元素都是用相对距离
    }

    show(mode)
    {
        let outer = this;
        this.$playground.show();
        this.mode = mode;
        this.game_map = new GameMap(this);
        this.resize();
        this.players = [];
        this.noticeboard = new NoticeBoard(this);
        this.player_count = 0;
        this.state = "waiting"  // waiting -> fighting -> over
        // 绝对 to 相对
        this.players.push(new Player(
            this,
            this.width/2 / this.scale ,
            this.height/ 2 / this.scale ,
            this.height / this.scale * 0.05 ,
            "white",
            this.height / this.scale * 0.2,
            "me",
            this.root.settings.username,
            this.root.settings.photo,
        ));
        //添加其他玩家
        if (mode === "single-mode")
        {
            for (let i=0;i<5;i++)
            {
                this.players.push(new Player(
                    this,
                    this.width / 2 / this.scale,
                    this.height / 2 / this.scale, 
                    this.height / this.scale * 0.05,
                    this.get_random_color(),
                    this.height / this.scale * 0.2,
                    "robot"
                ));
            }
        }
        else if (mode === "multi-mode")
        {
            this.chat_field = new ChatField(this);
            //声明了该类(MultiPlayerSocket)之后,会为我们创建WebSocket连接
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            // socket链接创建成功之后的回调函数
            this.mps.ws.onopen = function ()
            {
                outer.mps.send_create_player(outer.root.settings.username,outer.root.settings.photo);
            };
        }
    }

    hide()
    {
        this.$playground.hide();
    }

}
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
        this.$register_password_comfirm = this.$register.find(".ac_game_settings_password_second  input");
        this.$register_commit = this.$register.find(".ac_game_settings_commit button");
        this.$register_error_message = this.$register.find(".ac_game_settings_error_message");
        this.$register_to_login = this.$register.find(".ac_game_settings_option");

        this.$register.hide();
        
        this.$acwing_login_img = this.$settings.find(".ac_game_settings_acwing > img");
        this.$acwing_login_div = this.$settings.find(".ac_game_settings_acwing > div");
        this.start();
    }

    start(){
        if (this.platform ==="ACAPP"){
            //console.log("enter getinfo acapp")
            this.getinfo_acapp();
        }else
        {
        this.getinfo_web();
        this.add_listening_events();
        }
    }

    add_listening_events(){
        //绑定监听函数
        let outer = this;
        this.add_listening_events_login();
        this.add_listening_events_register();

        this.$acwing_login_img.click(function(){
            outer.acwing_login();
        });
        this.$acwing_login_div.click(function(){
            outer.acwing_login();
        });
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

    acwing_login(){
        //web端acwing登录
        console.log("click acwing login");
        $.ajax({
            url:"https://app1854.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            success:function(resp){
                // console.log(resp)
                if (resp.result==="success"){
                        //重定向页面
                        window.location.replace(resp.apply_code_url);
                }
            }
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
                // console.log(resp);
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
        if (this.platform === "ACAPP") {
            this.root.acwingos.api.window.close();
        }
        else{
            $.ajax({
                url:"https://app1854.acapp.acwing.com.cn/settings/logout/",
                type:"GET",
                success:function(resp){
                    // console.log(resp);
                    if (resp.result === "success"){
                        location.reload();
                    }
                }
            });}
    }
    register_on_remote(){
        //web端,在远程服务器上注册
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
                // console.log(resp);
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

    getinfo_acapp(){
        let outer = this;
        //console.log("ener ajax");
        $.ajax({
            url:"https://app1854.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type:"GET",
            success:function(resp){
                if (resp.result ==="success"){
                    outer.acapp_login(resp.appid,resp.redirect_uri,resp.scope,resp.state)
                }
            }
        });
    }

    acapp_login(appid,redirect_uri,scope,state){
        let outer = this;
        //console.log("use acwingos");
        //console.log(state)
        this.root.acwingos.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp){
            //resp的返回值是receive_code 的返回值
            //console.log(resp)
            if (resp.result==="success"){
                //console.log("enter menu main")
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }

    getinfo_web(){
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
                //console.log(resp);
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


    hide(){
        this.$settings.hide();
    }

    show(){
        this.$settings.show();
    }
}
export class AcGame
{
    constructor(id,acwingos)
    {
        //如果在acwing里打开,就会传这个参数,提供了一些接口,也可以判断是在那里执行的
        this.acwingos = acwingos
        this.id =id;
        //$()表示这个是一个html元素，JQuery可通过'#'+id来找到对应id的html元素
        this.$ac_game = $('#'+this.id);
        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayGround(this);
    }
}
