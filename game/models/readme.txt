修改后端的代码的时候，记得将DEBUG改为False,这样才能在网站前端看到报错

models文件夹管理数据库数据
我们创建的数据库的表就放在这里
python3 manage.py createsuperuser 创建超级用户
可以访问/admin来管理用户
python3 manage.oy changepassword admin 修改用户admin的密码
如果我们在这里创建了名为player的数据表,就可以在/admin那里看到

python3 manage.py shell 可以调出交互式python,里面有自动补全

每次定好新的表之后
1. 注册 ,在 admin.py
2.执行 
    python3 manage.py makemigrations
    python3 manage.py migrate
3. 如果看不到表,请重启网站

实现前端后端交互的写法，需要在三个地方一块写
1.views.py 后端具体的实现逻辑
2.urls.py 完成路由功能
3.前端(在js里面实现一个调用)

实现getinfo函数,前端想后端请求自己的用户名和头像,后端返回用户名和头像到前端
y总推荐的流程
STEP 1 :views.py
    接受前端的请求,并返回对应的Response
STEP 2 :urls.py
    网址/settings/getinfo/
这两个写完之后测试一下后端逻辑是否正常,访问 网址/settings/getinfo
STEP 3:前端js
