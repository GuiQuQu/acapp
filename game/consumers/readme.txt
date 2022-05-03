websocket协议和http协议之间的区别的是
    
webscoket前后端通信是双向的,前后端都可以主动向对方发送请求或者是收到消息做出某种动作

    而http前后端之间的通信是单向的,必须是前端发送请求,然后后端才可以针对这个请求做出回应

    这个项目需要通过websocket实现多人对战,在同步不同玩家的操作的时候,采用了同步事件,而并没有暴力地同步坐标,这样通信的频率就会降低,降低服务器使用的带宽

    需要同步的事件有4个
        1.create player
        2.
        3.
        4.attack

1.create player
当玩家点击"多人模式"，进入游戏界面的时候,前端为该玩家创建了一个可操控角色,这个角色的创建需要通知到当前和该玩家在同一局游戏的其他玩家
前端
WebSocket,在该玩家进入多人模式时和后端建立连接
```AcGamePlayground 58 line js
if (mode==="multi-mode"){
    this.mps = new MultiPlayerSocket(this)
    this.mps.ws.onopen = function(){
        //当链接建立之后，回调该函数,向服务器发送创建玩家的消息
        outer.mps.send_create_player()
    }
}
```
后端
在和前端建立连接的时候执行
```py 
   async def connect(self,):
       """
        1.为该玩家分配一个房间(一局游戏,并将这局游戏其他玩家的信息发回给前端)
       """
        pass
```

```py
    async receive(self,text_data):
        data = json.loads(text_data)
        event = data["event"]
        #当服务器收到前端发来的创建玩家的消息时,需要将该玩家加入redis数据库中,并把这局的玩家信息广播给该局游戏内的其他人
        injiaf event == "create player"
            await self.create_player()
```
