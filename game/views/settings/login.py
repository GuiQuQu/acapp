from django.http import JsonResponse
from django.contrib.auth import authenticate,login

def log_in(request):
    data = request.GET
    username = data.get("username")
    password = data.get("password")
    # 数据库里面并没有保存密码,而是保存了密码的哈希值
    # 认证的时候只算当前密码的哈希值和该用户对应的密码哈希值是否相同
    user = authenticate(username=username,password = password) # 认证函数
    if not user:
        return JsonResponse({"result":"用户名或密码不正确"})
    login(request,user) # 登录函数
    return JsonResponse({"result":"success"})
