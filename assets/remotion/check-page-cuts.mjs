import {readFileSync} from 'node:fs';

const [timelineFile='src/cut.json',cuesFile='src/page-cuts.json',rate='30']=process.argv.slice(2);
const shots=JSON.parse(readFileSync(timelineFile,'utf8'));
const cues=JSON.parse(readFileSync(cuesFile,'utf8'));
const fps=Number(rate);
if (!Number.isFinite(fps)||fps<=0) throw new Error('A positive frame rate is required.');
const shotById=new Map(shots.map(shot=>[shot.id,shot]));
const validEffects=new Set(['match-iris','map-pullback','sheet-lift']);
const spans=new Map();
function assert(ok,reason){if (!ok) throw new Error(reason);}
for(const cue of cues){
  const shot=shotById.get(cue.shot);
  assert(shot,'Unknown shot '+cue.shot);
  assert(Number.isInteger(shot.start)&&Number.isInteger(shot.frames)&&shot.frames>0,'Invalid timeline for '+shot.id);
  assert(Number.isInteger(cue.at)&&cue.at>=0&&Number.isInteger(cue.frames)&&cue.frames>=2&&cue.at+cue.frames<=shot.frames,'Cut outside shot '+shot.id);
  assert(shot.start+cue.at>0,'Opening frame has no outgoing shot');
  assert(validEffects.has(cue.effect),'Unknown effect '+cue.effect);
  for(const point of [cue.source,cue.target]){
    if (point!==undefined) assert(Array.isArray(point)&&point.length===2&&point.every(n=>typeof n==='number'&&n>=0&&n<=1),'Invalid anchor for '+shot.id);
  }
  if(cue.axis!==undefined) assert(['x','y'].includes(cue.axis),'Invalid travel axis for '+shot.id);
  const end=cue.at+cue.frames;
  const prior=spans.get(shot.id)||[];
  assert(prior.every(([a,b])=>end<=a||cue.at>=b),'Overlapping cuts for '+shot.id);
  prior.push([cue.at,end]);
  spans.set(shot.id,prior);
  const seconds=(shot.start+cue.at)/fps;
  console.log(Math.floor(seconds/60)+':'+(seconds%60).toFixed(2).padStart(5,'0'),cue.frames+'f',cue.effect,cue.name||shot.id);
}
