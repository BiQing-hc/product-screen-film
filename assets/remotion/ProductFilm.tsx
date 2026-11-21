import React from 'react';
import {AbsoluteFill, Audio, Freeze, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {PageTransition} from './PageTransition';

const wholeFrame = z.number().int().nonnegative();
const length = z.number().int().positive();
const fraction = z.number().min(0).max(1);
const point = z.tuple([fraction, fraction]);
const shotSchema = z.object({
  id: z.string(), name: z.string(), file: z.string(), trimBefore: wholeFrame, frames: length,
  captions: z.array(z.object({from: wholeFrame, frames: length, text: z.string()})),
  transition: z.object({
    effect: z.enum(['match-iris','map-pullback','sheet-lift']), frames: z.number().int().min(2),
    source: point.optional(), target: point.optional(), axis: z.enum(['x','y']).optional(),
  }).optional(),
});
const trackSchema = z.object({
  name: z.string(), kind: z.enum(['narration','music','sfx']), file: z.string(),
  from: wholeFrame, frames: length, volume: fraction,
});
export const filmSchema = z.object({
  captions: z.boolean(), narration: z.boolean(), music: z.boolean(), sfx: z.boolean(),
  shots: z.array(shotSchema).min(1), audio: z.array(trackSchema),
});
type Shot = z.infer<typeof shotSchema>;
type FilmOptions = z.infer<typeof filmSchema>;
export const getFilmFrames = ({shots}: FilmOptions) => shots.reduce((total, shot) => total + shot.frames, 0);

function Screen({shot, offset = 0}: {shot: Shot; offset?: number}) {
  return <OffthreadVideo muted src={staticFile(shot.file)} trimBefore={shot.trimBefore + offset}
    style={{width:'100%', height:'100%', objectFit:'contain', display:'block'}} />;
}

function RecordedShot({shot, previous}: {shot: Shot; previous?: Shot}) {
  const frame = useCurrentFrame();
  const current = <Screen shot={shot}/>;
  if (!previous || !shot.transition || frame >= shot.transition.frames) return current;
  const outgoing = <Freeze frame={0}><Screen shot={previous} offset={previous.frames - 1}/></Freeze>;
  return <PageTransition width={1920} height={1080} frame={frame} spec={shot.transition}
    before={outgoing} after={current}/>;
}

export function ProductFilm(options: FilmOptions) {
  const {shots, audio} = options;
  let next = 0;
  return <AbsoluteFill style={{backgroundColor:'#132525'}}>
    {shots.map((shot, i) => {
      const from = next;
      next += shot.frames;
      return <Sequence key={shot.id} name={shot.name} from={from} durationInFrames={shot.frames}>
        <RecordedShot shot={shot} previous={shots[i - 1]}/>
        {options.captions && shot.captions.map(cue =>
          <Sequence key={cue.from} name={cue.text} from={cue.from} durationInFrames={cue.frames}>
            <div style={{position:'absolute', bottom:48, width:'100%', textAlign:'center', font:'36px/1.45 system-ui, sans-serif', color:'white'}}>
              <span style={{background:'#152322eb', borderRadius:6, padding:'5px 18px'}}>{cue.text}</span>
            </div>
          </Sequence>)}
      </Sequence>;
    })}
    {audio.filter(track => options[track.kind]).map(track =>
      <Sequence key={track.name + track.from} name={track.name} from={track.from} durationInFrames={track.frames}>
        <Audio src={staticFile(track.file)} volume={track.volume}/>
      </Sequence>)}
  </AbsoluteFill>;
}
