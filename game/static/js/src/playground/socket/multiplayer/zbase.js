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
            console.log(data);
            let uuid = data.uuid;
            if (uuid === outer.uuid)
                   return false;
           outer.receive_create_player(uuid,data.username,data.photo);
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

    receive_create_player(uuid,username,photo){
        let pg = this.playground;
        let player =new Player(
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
}

