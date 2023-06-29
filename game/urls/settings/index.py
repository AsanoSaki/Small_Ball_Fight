from django.urls import path
from game.views.settings.getinfo import getinfo
from game.views.settings.login import mylogin
from game.views.settings.logout import mylogout
from game.views.settings.register import register

urlpatterns = [
    path('getinfo/', getinfo, name='settings_getinfo'),
    path('login/', mylogin, name='settings_login'),
    path('logout/', mylogout, name='settings_logout'),
    path('register/', register, name='settings_register'),
]
