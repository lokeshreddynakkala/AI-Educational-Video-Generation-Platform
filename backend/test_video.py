import requests
import json

payload = {
    "voice_id": "voice_1c10d0d4",
    "slides_id": "slides_a9d22c88",
    "add_subtitles": False,
    "project_title": "Python Introduction"
}

try:
    print('Sending request to /api/video/generate...')
    print('This will take some time as FFmpeg processes the video...')
    print()
    
    response = requests.post('http://localhost:8000/api/video/generate', json=payload, timeout=300)
    print('Status Code:', response.status_code)
    result = response.json()
    print('Response:', json.dumps(result, indent=2))
    print()
    print('✓ Video generation completed!')
    print('Video ID:', result.get('video_id'))
    print('File Path:', result.get('file_path'))
    print('Duration:', result.get('duration_secs'), 'seconds')
except requests.exceptions.Timeout:
    print('Request timed out - video generation is taking too long')
    print('This is normal for the first run as FFmpeg processes the video')
except Exception as e:
    print('Error:', str(e))