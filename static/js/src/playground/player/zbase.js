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
        }
        // 向服务器发送创建玩家的信息 {"event":create player,"uuid":uuid,"username":username,"photo":photod
        this.username = username;
    }

    start()
    {
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

                let tx = (e.clientX-rect.left) / scale;
                let ty = (e.clientY-rect.top) / scale;
                if (outer.cur_skill === "fireball")
                {
                    let fireball = outer.shoot_fireball(tx,ty);
                    outer.cur_skill = null;
                    if (outer.playground.mode === "multi-mode")
                    {
                        outer.playground.mps.send_shoot_fireball (tx,ty,fireball.uuid);
                    }
                }
            }
            else if (e.which === 3)
            {
                let tx = (e.clientX-rect.left) / scale;
                let ty = (e.clientY-rect.top) / scale;
                outer.move_to(tx,ty);
                if (outer.playground.mode === "multi-mode")
                {
                    outer.playground.mps.send_move_to(tx,ty);
                }
            }
        });
        $(window).keydown(function(e){
            if (e.which === 81){
                outer.cur_skill ="fireball";
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
        return fireball;
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
        this.update_move();
        this.render();
    }

    update_move()
    {
        this.spend_time += this.timedelta / 1000;
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
    }
}
