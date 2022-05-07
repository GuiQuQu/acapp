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
            this.fireball_coldtime_total = 0.1;
            this.fireball_coldtime = this.fireball_coldtime_total;
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
                if (outer.blink_coldtime > outer.eps)
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
        this.fireball_coldtime = this.fireball_coldtime_total;
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
        {   if (this.playground.state === "fighting"){
                this.playground.state = "over";
                this.playground.scoreboard.lose();
            }
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
        this.update_win();
        this.render();
    }
    update_win(){
        if (this.playground.state === "fighting" && this.player_type === "me" && this.playground.players.length == 1){
            //注意只更新一次游戏胜利判定,确定胜利之后把本局状态更新为over,这样就不会继续判定胜利了
            this.playground.state = "over";
            this.playground.scoreboard.win();
        }
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
            this.ctx.arc(x * scale,y * scale,r * scale,0 - Math.PI / 2,Math.PI * 2 * (1 -  this.fireball_coldtime / this.fireball_coldtime_total) - Math.PI / 2 ,true);
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
