from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import MesajlasmaAlanı, Mesaj
import json
from django.db import close_old_connections

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.alan_id = self.scope['url_route']['kwargs']['mesajlasma_alani_id']
        self.room_group_name = f'chat_{self.alan_id}'
        self.kullanıcı = self.scope['user']

        if not self.kullanıcı.is_authenticated:
            await self.close()
            return

        katılımcı_mı = await self.katilimci_kontrol()
        if not katılımcı_mı:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        print(f"DISCONNECT - close_code: {close_code}")
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # katılımcı_mı = await self.katilimci_kontrol()
        
        # if not katılımcı_mı:
        #     await self.close()
        #     return
        
        data = json.loads(text_data)
        
        
        icerik = data.get('message', '').strip()

        if not icerik:
            return

        mesaj = await self.mesaj_kaydet(icerik)
        

        try:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'id': self.kullanıcı.id,
                    'gönderici': self.kullanıcı.username,
                    'icerik': icerik,
                    'gönderilme_tarihi': str(mesaj.gönderilme_tarihi),
                }
            )
        except Exception as e:
            print(f"\n!!! REDIS YAYIN HATASI !!!: {e}\n")

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'id': event['id'],
            'gönderici': event['gönderici'],
            'icerik': event['icerik'],
            'gönderilme_tarihi': event['gönderilme_tarihi'],
        }))

    @database_sync_to_async
    def katilimci_kontrol(self):
        close_old_connections()
        try:
            return MesajlasmaAlanı.objects.filter(
                id=self.alan_id,
                katılımcılar=self.kullanıcı
            ).exists()
        finally:
            close_old_connections()
        

    @database_sync_to_async
    def mesaj_kaydet(self, icerik):
        close_old_connections()
        try:
            return Mesaj.objects.create(
                mesajlasma_alanı_id=self.alan_id,
                gönderici=self.kullanıcı,
                icerik=icerik
            )
        finally:
            close_old_connections()