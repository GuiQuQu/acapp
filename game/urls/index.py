from django.urls import path,include
from game.views.index import index


# gameapp下 urls文件夹的index.py文件，统领game app下的连接与函数的关系
# 一般推荐把后面的斜杠打上,这样往后写的时候不容易出错
urlpatterns=[
    path('',index,name ='index'), # 在views.index里面，渲染html文件
    path('menu/',include('game.urls.menu.index')), # 内部的views
    path('playground/',include('game.urls.playground.index')),
    path('settings/',include('game.urls.settings.index')),
]

