import os
import yt_dlp
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class TranscriptionFromUrl():
    def __init__(self, path="../data/audio.mp3"):
        self.file_name = path
        
    def extracting_audio_from_url(self, video_url):
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": self.file_name,
            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }
            ],
        }
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([video_url])
            return {
                "status": "success",
                "audio_file": self.file_name,
                "download_path": os.path.abspath(self.file_name)
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def extracting_text_from_audio(self):
        client = OpenAI(api_key=OPENAI_API_KEY)
        try:
            with open(self.file_name, "rb") as audio:
                transcription = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio
                )
            self.transcription = transcription.text
            os.remove(self.file_name)
            return transcription.text
        except:
            return "error"
    
transcription_from_url = TranscriptionFromUrl()