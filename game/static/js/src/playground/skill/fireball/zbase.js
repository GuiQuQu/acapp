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
        
        //判断碰撞
        for (let i=0;i<this.playground.players.length;i++)
        {
            let player = this.playground.players[i];
            //console.log(this.is_collision(player));
            if (player !==this.player && this.is_collision(player))
            {
                this.attack(player);
            }
        }
        this.render();
        //console.log("fire ball");
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
        this.destroy();
    }
    render(){
        //console.log("fire ball update")
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2,false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
