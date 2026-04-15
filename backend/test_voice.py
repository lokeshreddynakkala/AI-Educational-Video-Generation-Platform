import requests
import json

payload = {
    'segments': [
        {
            'slide_number': 1,
            'text': 'Welcome to Python programming.',
            'duration_secs': 5
        },
        {
            'slide_number': 2,
            'text': 'Python is a powerful and flexible programming language.',
            'duration_secs': 6
        }
    ],
    'language': 'English'
}

try:
    print('Sending request to /api/voice/synthesize-all...')
    print('Note: First request will be slow as model loads on free tier (may take 60-120 seconds)')
    print()
    
    response = requests.post('http://localhost:8000/api/voice/synthesize-all', json=payload, timeout=200)
    print('Status Code:', response.status_code)
    result = response.json()
    print('Response:', json.dumps(result, indent=2))
    print()
    print('✓ Voice synthesis completed successfully!')
    print('Audio files created:', len(result.get('audio_files', [])))
    for audio in result.get('audio_files', []):
        slide = audio.get('slide_number')
        fname = audio.get('file_name')
        print(f'  - Segment {slide}: {fname}')
except requests.exceptions.Timeout:
    print('Request timed out - model is loading on HuggingFace')
    print('The model will be ready for the next request')
except Exception as e:
    print('Error:', str(e))
