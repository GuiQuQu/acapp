from django.http import JsonResponse
from django.contrib.auth import login
from django.contrib.auth.models import User
from game.models.player.player import Player

def register(request):
    data = request.GET;
    # 获取不到就赋为空,否则strip()对None会报错
    username = data.get("username","").strip()
    password =data.get("password","").strip()
    password_comfirm = data.get("password_comfirm","").strip()
    if not username or not password:
        return JsonResponse({
                'result':'用户名或密码不能为空'
            })
    if password != password_comfirm:
        return JsonResponse({
                'result':'两次密码不一致'
            })
    if User.objects.filter(username = username).exists(): # 查看数据库
        return JsonResponse({
                'result':'用户名已经存在'
            })
    user = User(username = username)
    user.set_password(password)
    user.save()
    # django 数据库创建语句
    Player.objects.create(user=user,photo = "://cdn.acwing.com/media/user/profile/photo/117856_lg_b7be16fb18.jpg")
    login(request,user)
    return JsonResponse({'result':'success'})
