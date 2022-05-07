from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings # 可以导入django项目的settings文件
from django.core.cache import cache

from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol

from match_system.src.match_server.match_service import Match

from game.models.player.player import Player
from channels.db import database_sync_to_async

class MultiPlayer(AsyncWebsocketConsumer):
    # 这个函数是建立连接的时候执行
    async def connect(self):
        await self.accept()

    # 这个函数是正常断开连接的时候执行,因此我刷新页面的时候会输出disconnect
    async def disconnect(self, close_code):
        print('disconnect')
        if self.room_name:
            await self.channel_layer.group_discard(self.room_name, self.channel_name);

    async def create_player(self,data):
        self.room_name = None
        self.uuid = data["uuid"]
        # 增加匹配服务之后,重写create_player
        # Make socket
        transport = TSocket.TSocket('127.0.0.1', 9090)

        # Buffering is critical. Raw sockets are very slow
        transport = TTransport.TBufferedTransport(transport)

        # Wrap in a protocol
        protocol = TBinaryProtocol.TBinaryProtocol(transport)

        # Create a client to use the protocol encoder
        client = Match.Client(protocol)

        def db_get_player():
            return Player.objects.get(user__username=data["username"])
        player = await database_sync_to_async(db_get_player)()
        # Connect!
        transport.open()

        client.add_player(player.score,data["uuid"],data["username"],data["photo"],self.channel_name)

        # Close!
        transport.close()



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
        if not self.room_name:
            return 
        players = cache.get(self.room_name)
        if not players:
            return
        for player in players:
            if player["uuid"] == data["attacked_uuid"]:
                player["hp"] -= 25

        remain_cnt = 0
        for player in players:
            if player["hp"] > 0: remain_cnt += 1
        if remain_cnt > 1:
            if self.room_name:
                cache.set(self.room_name,players,3600)
        else:
            def update_player_score(username,score):
                # get 只要返回的结果不是一个,就会报异常
                # filter 要么0个，要么多个,不会报异常
                player = Player.objects.get(user__username=username)
                player.score += score
                player.save()
            for player in players:
                if player["hp"]<=0:
                    await database_sync_to_async(update_player_score)(player["username"],-5)
                else:
                    await database_sync_to_async(update_player_score)(player["username"],10)

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

    async def message(self,data):
        # print(data)
        await self.channel_layer.group_send(self.room_name,
            {
                "type":"group_send_event",
                "event":data["event"],
                "uuid":data["uuid"],
                "username":data["username"],
                "message":data["message"],
                })

    async def group_send_event(self,data):
        # 在cache里查找匹配系统为自己匹配的房间号,便于后面的所有同步操作使用
        keys = cache.keys("*%s*" % (self.uuid))
        if len(keys) > 0:
            self.room_name = keys[0]
            # print(self.room_name)
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
        elif event == "message":
            await self.message(data)
