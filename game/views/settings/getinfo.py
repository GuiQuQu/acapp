from django.http import JsonResponse
from game.models.player.player import Player

def getinfo_acapp(request):
    //acwing app端无脑返回登录,不做检测
    player = Player.objects.all()[0]
    return JsonResponse({
        'result':'success',
        'user':player.user.username,
        'photo':player.photo,
        })


def getinfo_web(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse(
            {'result':'not login'},
                )
    else:
        player = Player.objects.all()[0]
        return JsonResponse({
            'result':'success',
            'user':player.user.username,
            'photo':player.photo,
            })


def getinfo(request):
    # platform 是自己定义的，前端需要对应
    platform = request.GET.get('platform')
    if platform == 'ACAPP':
        return getinfo_acapp(request)
    else:
        return getinfo_web(request)

