from django.db import models
from django.contrib.auth.models import User
from django.db.models import Prefetch
from django.utils import timezone

# Create your models here.
class MesajlasmaAlanı(models.Model):
    isim = models.CharField(max_length=100, null=True, blank=True)
    katılımcılar = models.ManyToManyField(User, related_name='mesajlasma_alanları')
    olusturulma_tarihi = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"mesajlasma alanı {self.id} - katılımcılar: {[str(k) for k in self.katılımcılar.all()]}"

class Mesaj(models.Model):
    mesajlasma_alanı = models.ForeignKey(MesajlasmaAlanı, on_delete=models.CASCADE, related_name = 'mesajlar')
    gönderici = models.ForeignKey(User, on_delete=models.CASCADE)
    icerik = models.TextField()
    gönderilme_tarihi = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"mesajı gönderen kişi: {self.gönderici.username} - mesaj içeriği: {self.icerik[:20]}"

class KullaniciAyari(models.Model):
    kullanici = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ayar')
    oda_izni = models.BooleanField(default=True)