from django.http import JsonResponse
from game.models.player.player import Player

def getinfo_acapp(request):
    player = Player.objects.all()[0]  # 先默认返回第一个玩家的信息
    return JsonResponse({
        'result': 'success',  # 查询结果
        'username': player.user.username,
        'avatar': player.avatar,
    })

def getinfo_web(request):
    user = request.user
    if not user.is_authenticated:  # 用户未登录
        return JsonResponse({
            'result': 'not login',
        })
    else:
        player = Player.objects.get(user=user)  # 获取user的player信息
        return JsonResponse({
            'result': 'success',
            'username': player.user.username,
            'avatar': player.avatar,
        })

def getinfo(request):
    platform = request.GET.get('platform')  # 是哪个平台发起的请求
    if platform == 'ACAPP':
        return getinfo_acapp(request)
    # elif platform == 'WEB':
    else:
        return getinfo_web(request)
