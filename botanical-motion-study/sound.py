"""Original synthesized sound study. No supplied voice or reference audio is used."""
import json, math, random, struct, wave
from pathlib import Path
SR=48000; DURATION=20; N=SR*DURATION
random.seed(413)
left=[0.0]*N; right=[0.0]*N
for event in json.loads(Path('src/events.json').read_text()):
    kind=event['kind']; start=round(event['frame']/60*SR)
    dur={'air':1.15,'sweep':.85,'wood':.18,'leaf':.32,'grain':.2,'water':.26,'chime':.72,'soft':.13}[kind]
    pan=math.sin(event['frame']*.05)*.32; gain=event['gain']*.105
    lp=0.0
    for j in range(int(dur*SR)):
        n=start+j
        if n>=N: break
        t=j/SR; u=t/dur; noise=random.uniform(-1,1); lp=.94*lp+.06*noise
        if kind in ('air','sweep','leaf'):
            env=math.sin(math.pi*u)**2
            val=lp*3*env+math.sin(2*math.pi*(170*t+120*t*t))*env*.13
        elif kind=='wood':
            env=(1-math.exp(-t*700))*math.exp(-t*31)
            val=(math.sin(2*math.pi*420*t)+.4*math.sin(2*math.pi*720*t)+.22*noise)*env
        elif kind=='grain':
            env=math.sin(math.pi*u)**.6*math.exp(-t*14)
            val=lp*4*env+noise*.05*env
        elif kind=='water':
            env=(1-math.exp(-t*160))*math.exp(-t*17)
            val=math.sin(2*math.pi*(700*t+1650*t*t))*env*.58
        elif kind=='chime':
            env=(1-math.exp(-t*160))*math.exp(-t*7)
            val=(math.sin(2*math.pi*523.25*t)+.3*math.sin(2*math.pi*1046.5*t))*env*.38
        else:
            env=(1-math.exp(-t*800))*math.exp(-t*40)
            val=(math.sin(2*math.pi*260*t)+lp)*env*.65
        left[n]+=val*gain*(1-pan); right[n]+=val*gain*(1+pan)
peak=max(max(map(abs,left)),max(map(abs,right)),.001)
scale=min(1,.48/peak)
out=Path('public/audio');out.mkdir(parents=True,exist_ok=True)
with wave.open(str(out/'study-sound.wav'),'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR)
    for begin in range(0,N,48000):
        b=bytearray()
        for k in range(begin,min(begin+48000,N)):
            fade=min(1,k/2400,(N-1-k)/9600)
            b.extend(struct.pack('<hh',int(left[k]*scale*fade*32767),int(right[k]*scale*fade*32767)))
        w.writeframes(b)
Path('sound-report.json').write_text(json.dumps({'events':45,'sampleRate':SR,'channels':2,'samplePeakDbFS':20*math.log10(peak*scale),'voiceIncluded':False,'source':'Original synthesis; not reference audio','eventMap':'src/events.json'},indent=2))
print('Synthesized sound; sample peak',20*math.log10(peak*scale))
