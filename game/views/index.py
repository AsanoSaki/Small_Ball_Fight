from django.shortcuts import render

def index(request):
    return render(request, 'multiends/web.html')  # 默认会在templates目录中寻找
