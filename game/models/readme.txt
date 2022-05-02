models文件夹管理数据库数据,我们创建的数据库的表就放在这里

修改后端的代码的时候，记得将DEBUG改为False,这样才能在网站前端看到报错

python3 manage.py createsuperuser 创建超级用户
可以访问/admin来管理用户

python3 manage.py changepassword admin 修改用户admin的密码
如果我们在这里创建了并注册名为player的数据表,就可以在/admin那里看到

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
    接受前端的请求(request),并返回对应的Response
STEP 2 :urls.py
    网址/settings/getinfo/
这两个写完之后测试一下后端逻辑是否正常,访问 网址/settings/getinfo
STEP 3:前端js

实现登录函数，登出函数，注册函数都是相同的流程
其中需要注意的就是Django数据库的操作，是如何创建数据或者是查询数据的


redis 内存数据库，数据保存在内存中，存取更快
redis 保存的全部都是 key-value对
redis 是单线程的,不会出现读写冲突


安装
pip install django_redis

在settings.py 里面配置缓存机制
CACHES = { 
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        },  
    },  
}
USER_AGENTS_CACHE = 'default'

启动redis-server
sudo redis-server /etc/redis/redis.conf
查看redis服务是否已经启动,可以在top里面查看,该进程的USER是root

django 操控 redis
```python
from django.core.cache import cache

# 查找当前数据库内容
# keys 支持正则表达式查找
cache.keys("*")

# 设置关键字,第三个参数表示过期时间,单位是秒,写成None之后就不会过期
cache.set("wkl",1,5)

# 查看某个键值是否存在
cache.has_key("abc")

# 删除关键字
cache.delete("wkl")
```
