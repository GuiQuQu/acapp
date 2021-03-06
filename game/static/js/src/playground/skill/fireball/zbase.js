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
