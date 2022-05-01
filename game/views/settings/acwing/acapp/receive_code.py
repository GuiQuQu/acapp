from django.http import JsonResponse
from django.shortcuts import redirect
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login
from random import randint

def receive_code(request):
    # index 是根据urls里面路由的参数来的
    # 也可以直接写路由的地址,写"/"就可以重定向到index 页面
    # 当用户选择同意之后,acwing会将code和state发送到我们提供的redirect_uri请求里面，也就是这请求
    data = request.GET

    if "errcode" in data:
        return JsonResponse({
            "result":"apply_failed",
            "errcode":data.get("errcode"),
            "errmsg":data.get("errmsg")
            });

    code = data.get("code")
    state = data.get("state")
    # 通过检查redis里面保存在state来看授权是否存在
    if not cache.has_key(state):
        return JsonResponse({"result":"state not exists"}) # 返回dict作为callback(resp) 的结果

    cache.delete(state);
    # 通过code申请access_token 和openid

    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    params ={
            "appid":"1854",
            "secret":"343ef1c1e2f24093920e0079336ae1ad",
            "code":code,
            }
    print(params)
    access_token_res = requests.get(apply_access_token_url,params = params).json()
    # print(access_token_res)
    # 一般正常都会申请成功,申请失败会报KeyError
    access_token = access_token_res["access_token"]
    openid = access_token_res["openid"]
    
    player = Player.objects.filter(openid = openid)
    if (player.exists()):
        player = player[0]
        # login(request,player[0].user)
        return JsonResponse({
            "result":"success",
            "username":player.user.username,
            "photo":player.photo,
            })
    get_user_info_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
            "access_token":access_token,
            "openid":openid,
            }
    # 这里同理,申请失败会报KeyError
    user_info_res = requests.get(get_user_info_url,params = params).json()
    username = user_info_res["username"]
    photo = user_info_res["photo"]
    
    # 为了避免重名而采用的操作
    # 注意这里User表的user是Player表的外键，如果只从后台删除Player表,但是注册的的User还是存在的,这样的话,仍然可以登录，但是player表中没有这个User的信息
    # 就无法获取photo
    # 如果要删除的可以直接从User表删,因为外键的绑定关系是CASCADE，如果被参照的内容不在了，就会直接删除使用了这个被参照内容的条目
    while User.objects.filter(username = username).exists():
        print(username,end ="   ")
        username += str(randint(0,9))
        print(username)
    
    user = User.objects.create(username = username)
    player = Player.objects.create(user = user,photo = photo,openid = openid)
    # login(request,user)
    return JsonResponse({
            "result":"success",
            "username":player.username,
            "photo":player.photo,
            })
    
