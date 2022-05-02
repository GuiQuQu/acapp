from django.urls import path
from game.consumers.multiplayer.index import MultiPlayer

# 这个文件相当于http协议的urls，负责路由
websocket_urlpatterns =[
        path("wss/multiplayer/",MultiPlayer.as_asgi(),name = "wss_multiplayer"),
        ]

