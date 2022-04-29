from django.urls import path
from game.views.settings.getinfo import getinfo
from game.views.settings.login import log_in
from game.views.settings.logout import log_out
from game.views.settings.register import register
urlpatterns=[
    path("getinfo/",getinfo,name = "settings_getinfo"),
    path("login/",log_in,name = "settings_login"),
    path("logout/",log_out,name = "settings_logout"),
    path("register/",register,name = "settings_register"),
        ]
