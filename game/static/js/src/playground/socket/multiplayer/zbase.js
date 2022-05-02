class MultiPlayerSocket{

    constructor(playground){
        this.playground = playground;
        //创建一个WebSocket连接,后面的/wss/multiplayer 是自己实现的路由
        this.ws = new WebSocket("wss://app1854.acapp.acwing.com.cn/wss/multiplayer/");
        this.uuid = -1;
        this.start();
    }

    start(){
    }

    send_create_player(){
        let outer = this;
        //利用ws想服务器发送请求
        this.ws.send(JSON.stringify({
        "message":"create player",
        "uuid":outer.uuid,
        }));
    }

    receiv_create_player(){

    }
}

