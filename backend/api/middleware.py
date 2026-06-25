from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser, User
from rest_framework_simplejwt.tokens import AccessToken

class JwtAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode()
        params = dict(p.split('=') for p in query_string.split('&') if '=' in p)
        token = params.get('token')

        try:
            validated = AccessToken(token)
            scope['user'] = await database_sync_to_async(User.objects.get)(id=validated['user_id'])
        except Exception:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)