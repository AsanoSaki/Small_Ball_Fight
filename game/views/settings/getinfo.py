from django.http import JsonResponse
from game.models.player.player import Player

def getinfo(request):
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
