from django.http import HttpResponse


def index(Request):
    line1 = '<h1 style="text-align:center">我的第一个网页</h1>'
    line2 = '<a href ="admin/">进入管理页面</a>'
    return HttpResponse(line1+line2)

def play(Request):
    line1 = '<h1 style="text-align:center">游戏界面</h1>'
    line2 = '<a href ="/">返回主页面</a>'
    return HttpResponse(line1+line2)
