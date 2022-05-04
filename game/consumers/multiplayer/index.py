from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings # 可以导入django项目的settings文件
from django.core.cache import cache
class MultiPlayer(AsyncWebsocketConsumer):
    # 这个函数是建立连接的时候执行
    async def connect(self):

        self.room_name = None
        for i in range(1000):
            name = f"room-{i}"
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break

        if not self.room_name:
            return

        await self.accept() # 挂起该函数,去执行接受请求

        if not cache.has_key(self.room_name):
            cache.set(self.room_name,[],3600) # 建立一个有效期1个小时的房间

        # 服务器向前端发送当前已有的玩家信息
        for player in cache.get(self.room_name):
            await self.send(text_data = json.dumps({
                    "event":"create player",
                    "uuid":player["uuid"],
                    "username":player["username"],
                    "photo":player["photo"],
                }))

        # django channels提供了组的概念,在组里也提供的群发等api功能
        # 一个连接(channel)被建立之后,将这个连接加入group_name是self.room_name 的组里 
        await self.channel_layer.group_add(self.room_name, self.channel_name)

    # 这个函数是正常断开连接的时候执行,因此我刷新页面的时候会输出disconnect
    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name);

    async def create_player(self,data):

        players = cache.get(self.room_name)
        # print(data)
        players.append({
            "uuid":data["uuid"],
            "username":data["username"],
            "photo":data["photo"],
            })
        cache.set(self.room_name,players,3600)
        # 向组名为self.room_name里的所有channels里群发消息
        await self.channel_layer.group_send(self.room_name,
                {
                    "type":"group_send_event", # 组内接受该消息的的函数名
                    "event":data["event"],
                    "uuid":data["uuid"],
                    "username":data["username"],
                    "photo":data["photo"]
                })

    async def move_to(self,data):
          await self.channel_layer.group_send(self.room_name,
            {
                "type": "group_send_event",
                "event": data["event"],
                "uuid": data["uuid"],
                "tx": data["tx"],
                "ty": data["ty"],
              })

    async def shoot_fireball(self,data):
        await self.channel_layer.group_send(self.room_name,
            {
                "type":"group_send_event",
                "event":data["event"],
                "uuid" : data["uuid"],
                "tx": data["tx"],
                "ty": data["ty"],
                "ball_uuid": data["ball_uuid"],
                })

    async def attack(self,data):
        # print(data)
        await self.channel_layer.group_send(self.room_name,
        {
            "type":"group_send_event",
            "event":data["event"],
            "uuid":data["uuid"],
            "attacked_uuid":data["attacked_uuid"],
            "x":data["x"],
            "y":data["y"],
            "angle":data["angle"],
            "damage":data["damage"],
            "ball_uuid":data["ball_uuid"],
                })

    async def blink(self,data):
        await self.channel_layer.group_send(self.room_name,
                {
                    "type":"group_send_event",
                    "event":data["event"],
                    "uuid":data["uuid"],
                    "tx":data["tx"],
                    "ty":data["ty"],
                    })

    async def group_send_event(self,data):
        # 收到消息直接返回给前端
        # print(data)
        await self.send(text_data = json.dumps(data))

    # 这个函数是收到clinet的消息时执行
    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data["event"]
        # print(event)
        if event == "create player":
            await self.create_player(data)
        elif event == "move to":
            await self.move_to(data)
        elif event == "shoot fireball":
            await self.shoot_fireball(data)
        elif event == "attack":
            await self.attack(data)
        elif event == "blink":
            await self.blink(data)
