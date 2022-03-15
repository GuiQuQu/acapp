from django.shortcuts import render

# game app 下，views文件夹下的index.py,是game app的一个总的函数保存的地方
def index(request):
    # render函数,渲染html文件
    return render(request,'multiends/web.html')
