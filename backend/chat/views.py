from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from advisory.ai_services import ChatService
from .models import ChatSession, ChatMessage

class ChatMessageAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        session_id = request.data.get('session_id')
        message = request.data.get('message')
        context = request.data.get('context', {}) 

        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user if request.user and request.user.is_authenticated else None
        session = None
        history = []

        if user:
            # Retrieve or create session for authenticated user
            if session_id:
                try:
                    session = ChatSession.objects.get(id=session_id, user=user)
                except ChatSession.DoesNotExist:
                    session = ChatSession.objects.create(user=user, title=message[:50])
            else:
                session = ChatSession.objects.create(user=user, title=message[:50])

            # Save User Message
            ChatMessage.objects.create(session=session, role='USER', content=message)

            # Build chat history for LLM
            history = [
                {"role": "user" if msg.role == "USER" else "assistant", "content": msg.content}
                for msg in session.messages.order_by('created_at')
            ]

        # Call AI Service
        ai_provider = request.data.get('ai_provider') or request.headers.get('X-AI-Provider')
        ai_model = request.data.get('ai_model') or request.headers.get('X-AI-Model')
        api_key = request.data.get('api_key') or request.headers.get('X-AI-Key')

        service = ChatService(provider_name=ai_provider, model_name=ai_model, api_key=api_key)
        ai_response_text = service.converse(context, history, message)

        if session:
            ai_msg = ChatMessage.objects.create(session=session, role='ASSISTANT', content=ai_response_text)
            msg_id = ai_msg.id
            resp_session_id = session.id
        else:
            msg_id = "guest_msg_" + str(session_id or 1)
            resp_session_id = session_id or 1001

        return Response({
            "session_id": resp_session_id,
            "message": {
                "id": msg_id,
                "role": "ASSISTANT",
                "content": ai_response_text
            }
        })

