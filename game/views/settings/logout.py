from django.http import JsonResponse
from django.contrib.auth import logout

def log_out(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            'result':'success'
            })
    logout(request) # 这里登出的操作相当于把对应的cookie删掉
    return JsonResponse({
            'result':'success'
        })
