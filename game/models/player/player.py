from django.db import models
from django.contrib.auth.models import User

# Player有两个关键字，user表示是和哪个User对应的，avatar表示头像
class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)  # 当删除User时也将其关联的Player一块删掉
    avatar = models.URLField(max_length=256, blank=True)  # 头像用链接存
    openid = models.CharField(default='', max_length=50, blank=True, null=True)

    def __str__(self):  # 显示每个Player的数据
        return str(self.user)
