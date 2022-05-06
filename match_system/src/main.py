#! /usr/bin/env python3
import glob
import sys
sys.path.insert(0, glob.glob('../../')[0])

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

from match_server.match_service import Match
from queue import Queue
from time import sleep
from threading import Thread


from acapp.asgi import channel_layer
from asgiref.sync import async_to_sync
from django.core.cache import cache

queue = Queue() # 全局的消息队列
class Player:
    def __init__(self,score,uuid,username,photo,channel_name):
        self.score = score
        self.uuid = uuid
        self.username = username
        self.photo = photo
        self.channel_name = channel_name
        self.waiting_time = 0 # 随着等待时间的增长,匹配的阈值会降得越来越低 

class Pool: 
    def __init__(self,):
        self.players = []

    def add_player(self,player):
        self.players.append(player)

    def check_match(self,a,b):
        dt = abs(a.score - b.score)
        a_max_dif = a.waiting_time * 50
        b_max_dif = b.waiting_time * 50
        return dt <= a_max_dif and dt <= b_max_dif

    def increase_waiting_time(self):
        for player in self.players:
            player.waiting_time += 1

    def match(self,):
        flag = False
        while len(self.players) >= 3:
            self.players = sorted(self.players, key = lambda p:p.score)
            for i in range(len(self.players) - 2):
                a , b , c = self.players[i],self.players[i+1],self.players[i+2]

                if self.check_match(a,b) and self.check_match(b,c) and self.check_match(a,c):
                    self.match_success([a,b,c])
                    self.players = self.players[:i] + self.players[i + 3:]
                    flag = True
                    break
            if not flag:
                break
        self.increase_waiting_time()

    def match_success(self,ps):
        print("Match success: %s %s %s" % (ps[0].username,ps[1].username,ps[2].username))
        room_name = "room-%s-%s-%s" % (ps[0].uuid,ps[1].uuid,ps[2].uuid)
        players = []
        cache.set(room_name,players,3600) #有效期 1hour
        for p in ps:
            async_to_sync(channel_layer.group_add)(room_name,p.channel_name)
            players.append({
            "uuid":p.uuid,
            "username":p.username,
            "photo":p.photo,
            "hp":100,
                })

        for p in ps:
            async_to_sync(channel_layer.group_send)(
                room_name,
                {
                    "type":"group_send_event",
                    "event":"create player",
                    "uuid":p.uuid,
                    "username":p.username,
                    "photo":p.photo,
                    }
                    )
def get_player_from_queue():
    try:
        return queue.get_nowait()
    except:
        return None


def worker():
    pool = Pool()
    while True:
        player = get_player_from_queue()
        if player:
            pool.add_player(player)
        else:
            pool.match()
            sleep(1)


class MatchHandler:
    # 这个匹配系统需要一个消息队列,当有新的玩家加入匹配的时候,如果当前正在匹配,那么就需要将这个玩家的信息缓存下来,所以就需要消息队列
    def add_player(self,score,uuid,username,photo,channel_name):
        player = Player(score,uuid,username,photo,channel_name)
        print("Add Player: %s %d" % (player.username,player.score))
        queue.put(player)
        return 0 # 没有返回值会报错

if __name__ == '__main__':
    handler = MatchHandler()
    processor = Match.Processor(handler)
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9090)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()

    server = TServer.TThreadedServer(
         processor, transport, tfactory, pfactory)
    # daemon=True 关闭主线程的时候,该守护线程也会随之关闭
    Thread(target=worker,daemon=True).start()

    print('Starting the server...')
    server.serve()
    print('done.')
