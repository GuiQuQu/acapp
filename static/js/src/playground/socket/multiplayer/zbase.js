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
}

