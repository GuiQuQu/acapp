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
