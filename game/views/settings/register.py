from django.contrib.auth import login
from django.contrib.auth.models import User
from django.http import JsonResponse
from game.models.player.player import Player

def register(request):
    data = request.GET
    username = data.get('username', '').strip()  # 如果没有的话返回空，且过滤掉空格
    password = data.get('password', '').strip()
    confirm_password = data.get('confirm_password', '').strip()
    if not username or not password:  # 用户名或密码为空
        return JsonResponse({
            'result': 'Username or password can\'t be empty!',
        })
    elif password != confirm_password:  # 两次密码不一致
        return JsonResponse({
            'result': 'Password inconsistency!'
        })
    elif User.objects.filter(username=username).exists():  # 用户名已存在
        return JsonResponse({
            'result': 'Username has existed!'
        })
    user = User(username=username)
    user.set_password(password)
    user.save()
    Player.objects.create(user=user, avatar='https://cdn.acwing.com/media/article/image/2021/11/18/1_ea3d5e7448-logo64x64_2.png')
    login(request, user)
    return JsonResponse({
        'result': 'success',
    })
