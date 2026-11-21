"""Render the complete narration as a single take with one reference and no chapter resets."""
from pathlib import Path
import hashlib,json,os
import mlx.core as mx
import numpy as np
import soundfile as sf
from mlx_audio.tts.utils import load_model

p=Path(__file__).resolve().parent
voice=p/'声音'; profile=json.loads((voice/'音色配置.json').read_text())
reference=voice/'统一女声明样.wav'
assert hashlib.sha256(reference.read_bytes()).hexdigest()==profile['reference_sha256']
model=load_model(os.environ.get('EVCS_REFERENCE_TTS',profile['model']))
lines=json.loads((p/'脚本.json').read_text())
mx.random.seed(profile['seed'])
text=''.join(''.join(s['voice']) for s in lines)
audio=[]
for part in model.generate(text=text,ref_audio=str(reference),ref_text=profile['reference_text'],
    lang_code='Chinese',temperature=profile['temperature'],top_p=profile['top_p'],max_tokens=1900,split_pattern=None,verbose=False):
    audio.append(np.asarray(part.audio).reshape(-1));rate=part.sample_rate
wave=np.concatenate(audio);sf.write(voice/'全片连续女声.wav',wave,rate,subtype='PCM_16')
print(round(len(wave)/rate,3),'seconds',flush=True)
