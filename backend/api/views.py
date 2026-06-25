from django.shortcuts import render
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from .models import *
from .serializers import *
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

# Create your views here.
class KullanıcıOlustur(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = KullanıcıOlusturSerializer
    permission_classes = [AllowAny]

class KullanıcıListele(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = KullanıcıListeleSerializer
    permission_classes = [IsAuthenticated]

class KisiSwitch(generics.RetrieveUpdateAPIView):
    serializer_class = AcKapaSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        ayar, created = KullaniciAyari.objects.get_or_create(kullanici=self.request.user)
        return ayar

class MesajlasmaAlanıOlustur(generics.CreateAPIView):
    queryset = MesajlasmaAlanı.objects.all()
    serializer_class = MesajlasmaAlanıSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwarg):
        katılımcılar = request.data.get('katılımcılar', [])
        isim = request.data.get('isim', '')
        
        if len(katılımcılar) < 2:
            return Response({'error': 'En az 2 kullanıcı belirlenmeden mesajlaşma alanı oluşturamazsınız.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if len(katılımcılar) != len(set(katılımcılar)):
            return Response({'hata': 'aynı kullanıcı id si birden fazla kez belirlenemez'}, status=status.HTTP_400_BAD_REQUEST)
        
        for kullanıcı_id in katılımcılar:
            kullanici = User.objects.filter(id=kullanıcı_id).first()
            
            if not kullanici:
                return Response({'hata': f'Geçersiz kullanıcı id si: {kullanıcı_id}'}, status=status.HTTP_400_BAD_REQUEST)
            
            if kullanici.id != request.user.id:
                has_ayar = hasattr(kullanici, 'ayar')
                print(f"Kontrol edilen kullanıcı: {kullanici.username}")
                print(f"Ayar profili var mı?: {has_ayar}")
                if has_ayar:
                    print(f"Kullanıcının oda_izni değeri: {kullanici.ayar.oda_izni}")

                if hasattr(kullanici, 'ayar') and kullanici.ayar.oda_izni == False:
                    return Response({'hata': f'{kullanici.username} buna izin vermiyor!'}, status=status.HTTP_403_FORBIDDEN)
        
        mesajlasma_alani = MesajlasmaAlanı.objects.create(isim=isim)
        mesajlasma_alani.katılımcılar.set(katılımcılar)
        
        serializer = self.get_serializer(mesajlasma_alani)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MesajlasmaAlanıListele(generics.ListAPIView):
    serializer_class = MesajlasmaAlanıSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return MesajlasmaAlanı.objects.filter(
            katılımcılar=self.request.user
        )

class MesajOlustur(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MesajOlusturSerializer
    
    def create(self, request, *args, **kwargs):
        mesajlasma_alani_id = self.kwargs.get('mesajlasma_alani_id')
        icerik = request.data.get('icerik', '').strip()
        
        if not MesajlasmaAlanı.objects.filter(
            id=mesajlasma_alani_id
        ).exists():
            return Response({'error': 'Belirtilen mesajlaşma alanı bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)
        
        if not MesajlasmaAlanı.objects.filter(
            id=mesajlasma_alani_id,
            katılımcılar=request.user
        ).exists():
            return Response({'error': 'Bu mesajlaşma alanına erişim izniniz yok.'}, status=status.HTTP_403_FORBIDDEN)
        

        if not icerik:
            return Response(
                {'error': 'Boş mesaj gönderemezsiniz.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        mesaj = Mesaj.objects.create(
            mesajlasma_alanı_id=mesajlasma_alani_id,
            gönderici=request.user,
            icerik=icerik,
            gönderilme_tarihi=timezone.now()
        )
        serializer = self.get_serializer(mesaj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MesajListele(generics.ListAPIView):
    serializer_class = MesajListeleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        mesajlasma_alani_id = self.kwargs.get('mesajlasma_alani_id')
        return Mesaj.objects.filter(mesajlasma_alanı_id=mesajlasma_alani_id)
    
    def list(self, request, *args, **kwargs):
        mesajlasma_alani_id = self.kwargs.get('mesajlasma_alani_id')
        
        if not MesajlasmaAlanı.objects.filter(
            id=mesajlasma_alani_id,
            katılımcılar=request.user
        ).exists():
            return Response({'error': 'Bu mesajlaşma alanına erişim izniniz yok.'}, status=status.HTTP_403_FORBIDDEN)
        
        return super().list(request, *args, **kwargs)