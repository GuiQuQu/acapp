from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings # 可以导入django项目的settings文件
from django.core.cache import cache
class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = None
        # 这个函数是建立连接的时候执行
        for i in range(1000):
            name = f"room-{i}"
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break
        
        if not self.room_name:
            return

        await self.accept() # 挂起该函数,去执行接受请求
        # print('accept')
        if not cache.has_key(self.room_name):
        ############################################################
        ###########     停在这里 ##############################
            cache.set(self.room_name,[])
        # django channels提供了组的概念,在组里也提供的群发等api功能
        self.room_name = "room"
        await self.channel_layer.group_add(self.room_name, self.channel_name)

    async def disconnect(self, close_code):
        # 这个函数是正常断开连接的时候执行,因此我刷新页面的时候会输出disconnect
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name);


    async def receive(self, text_data):
        # 这个函数是收到clinet的消息时执行
        data = json.loads(text_data)
        print(data)

