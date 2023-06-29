from django.contrib import admin
from game.models.player.player import Player  # 将表导进来

# Register your models here.

admin.site.register(Player)
