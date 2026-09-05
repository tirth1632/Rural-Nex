import os
from abc import ABC, abstractmethod

class BaseSpeechToTextProvider(ABC):
    @abstractmethod
    def transcribe(self, audio_file, language: str) -> str:
        """Transcribe an audio file to text."""
        pass

class BaseTextToSpeechProvider(ABC):
    @abstractmethod
    def synthesize(self, text: str, language: str) -> bytes:
        """Synthesize text to an audio byte stream."""
        pass

class MockSpeechToTextProvider(BaseSpeechToTextProvider):
    def transcribe(self, audio_file, language: str) -> str:
        return f"[MOCK STT]: Transcribed audio in {language}."

class MockTextToSpeechProvider(BaseTextToSpeechProvider):
    def synthesize(self, text: str, language: str) -> bytes:
        # Return a dummy byte stream representing an empty/silent mp3 or simply text bytes for testing
        return b"MOCK_AUDIO_DATA_FOR_" + text.encode('utf-8')

class OpenAISpeechToTextProvider(BaseSpeechToTextProvider):
    def __init__(self):
        import openai
        self.client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "dummy"))

    def transcribe(self, audio_file, language: str) -> str:
        # Mapping ISO codes used by OpenAI (e.g. 'en', 'hi', 'gu')
        # We can pass the language directly to whisper to improve accuracy
        iso_lang = language if language in ['en', 'hi', 'gu'] else 'en'
        
        transcript = self.client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language=iso_lang
        )
        return transcript.text

class OpenAITextToSpeechProvider(BaseTextToSpeechProvider):
    def __init__(self):
        import openai
        self.client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "dummy"))

    def synthesize(self, text: str, language: str) -> bytes:
        response = self.client.audio.speech.create(
            model="tts-1",
            voice="alloy", # default voice
            input=text
        )
        return response.content

def get_stt_provider() -> BaseSpeechToTextProvider:
    provider = os.environ.get("VOICE_PROVIDER", "mock").lower()
    if provider == "openai":
        return OpenAISpeechToTextProvider()
    return MockSpeechToTextProvider()

def get_tts_provider() -> BaseTextToSpeechProvider:
    provider = os.environ.get("VOICE_PROVIDER", "mock").lower()
    if provider == "openai":
        return OpenAITextToSpeechProvider()
    return MockTextToSpeechProvider()
