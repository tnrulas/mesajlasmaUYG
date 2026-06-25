from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path("ws/chat/<int:mesajlasma_alani_id>/", consumers.ChatConsumer.as_asgi()),
]