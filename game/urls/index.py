from django.urls import path,include
from game.views.index import index


# gameapp下 urls文件夹的index.py文件，统领game app下的连接与函数的关系
urlpatterns=[
    path('',index,name ='index'), # 在views.index里面，渲染html文件
    path('menu',include('game.urls.menu.index')), # 内部的views
    path('playground',include('game.urls.playground.index')),
    path('settings',include('game.urls.settings.index')),
]

