from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from advisory.ai_services import ChatService
from .models import ChatSession, ChatMessage

class ChatMessageAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session_id = request.data.get('session_id')
        message = request.data.get('message')
        # In a real flow, the context would be fetched via the session linked to the FeasibilityReport
        context = request.data.get('context', {}) 

        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve or create session
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=request.user)
            except ChatSession.DoesNotExist:
                return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            session = ChatSession.objects.create(user=request.user, title=message[:50])

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

        # Save AI Message
        ai_msg = ChatMessage.objects.create(session=session, role='ASSISTANT', content=ai_response_text)

        return Response({
            "session_id": session.id,
            "message": {
                "id": ai_msg.id,
                "role": "ASSISTANT",
                "content": ai_response_text
            }
        })
