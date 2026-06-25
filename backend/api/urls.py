from django.contrib import admin
from django.urls import path, include
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('auth/kayit/', KullanıcıOlustur.as_view(), name='kullanıcı-kayıt'),
    path('auth/giris/', TokenObtainPairView.as_view(), name='kullanıcı-giriş'),
    path('auth/yenile/', TokenRefreshView.as_view(), name='token-yenile'),
    path('anasayfa/', MesajlasmaAlanıListele.as_view(), name='anasayfa'),
    path('anasayfa/kullanıcılar/', KullanıcıListele.as_view(), name='kullanıcılar'),
    path('anasayfa/oda-izni/', KisiSwitch.as_view(), name='oda-izni'),
    path('anasayfa/mesajlasma-alanı-olustur/', MesajlasmaAlanıOlustur.as_view(), name='mesajlasma-alanı-olustur'),
    path('anasayfa/<int:mesajlasma_alani_id>/mesaj-olustur/', MesajOlustur.as_view(), name='mesaj-olustur'),
    path('anasayfa/<int:mesajlasma_alani_id>/mesajlar/', MesajListele.as_view(), name='mesajlar')
]