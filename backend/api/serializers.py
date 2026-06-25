from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *


class KullanıcıOlusturSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['username', 'password']
        extra_kwargs = {'password': {'write_only': True}}
    
    def validate_username(self, value):
        if User.objects.filter(username = value).exists():
            raise serializers.ValidationError("bu kullanıcı adı zaten alınmış")
        
        return value
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class KullanıcıListeleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class MesajlasmaAlanıSerializer(serializers.ModelSerializer):
    katılımcılar = KullanıcıListeleSerializer(many=True, read_only=True)
    class Meta:
        model = MesajlasmaAlanı
        fields = ['id', 'isim', 'katılımcılar', 'olusturulma_tarihi']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['katılımcı_sayısı'] = instance.katılımcılar.count()
        return data
    
class AcKapaSerializer(serializers.ModelSerializer):
    class Meta:
        model = KullaniciAyari
        fields = ['oda_izni']
        
class MesajListeleSerializer(serializers.ModelSerializer):
    gönderici = KullanıcıListeleSerializer(read_only=True)
    class Meta:
        model = Mesaj
        fields = ['id', 'gönderici', 'icerik', 'gönderilme_tarihi']

class MesajOlusturSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mesaj
        fields = ['mesajlasma_alanı', 'icerik']