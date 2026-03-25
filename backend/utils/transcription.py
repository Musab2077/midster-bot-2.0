import re
from fastapi import HTTPException
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound, TranscriptsDisabled


def extract_video_id(url: str) -> str:
    patterns = [
        r"(?:v=|\/)([0-9A-Za-z_-]{11})",
        r"(?:youtu\.be\/)([0-9A-Za-z_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise HTTPException(400, "Invalid YouTube URL")


class TranscriptionFromUrl:

    def transcribe_from_url(self, video_url: str) -> str:
        try:
            video_id = extract_video_id(video_url)
            ytt_api  = YouTubeTranscriptApi()
            fetched  = ytt_api.fetch(video_id)
            return " ".join(snippet.text for snippet in fetched)

        except NoTranscriptFound:
            raise HTTPException(400, "No transcript available for this video")
        except TranscriptsDisabled:
            raise HTTPException(400, "Transcripts are disabled for this video")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(500, f"Transcription failed: {str(e)}")