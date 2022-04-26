from django.contrib import admin
from game.models.player.player import Player
# 将Player表注册进来,这样就可以在/admin 里看到

admin.site.register(Player) # 注册
# Register your models here.
