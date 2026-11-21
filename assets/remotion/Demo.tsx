import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {PageTransition, type PageEffectSpec} from './PageTransition';
import setup from './demo.json';

const width = 1920;
const pictureHeight = 972;
const lead = 42;
const hold = 65;
export const demoFrames = setup.reduce((total, item) => total + lead + item.frames + hold, 0);

function Picture({file}: {file: string}) {
  return <Img src={staticFile(file)} style={{display: 'block', width, height: pictureHeight, objectFit: 'contain'}} />;
}

function Example({item}: {item: typeof setup[number]}) {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: '#10282b'}}>
    <div style={{position: 'relative', width, height: pictureHeight, overflow: 'hidden'}}>
      <PageTransition frame={frame - lead} width={width} height={pictureHeight}
        spec={item as PageEffectSpec}
        before={<Picture file={item.before}/>} after={<Picture file={item.after}/>} />
    </div>
    <div style={{height: 108, padding: '0 54px', display: 'flex', alignItems: 'center', color: '#fafcfb', borderTop: '2px solid #8ce1c3', fontFamily: '"PingFang SC","Microsoft YaHei",sans-serif', fontSize: 37}}>
      {item.name}
    </div>
  </AbsoluteFill>;
}

export function Demo() {
  let start = 0;
  return <AbsoluteFill>{setup.map(item => {
    const from = start;
    const length = lead + item.frames + hold;
    start += length;
    return <Sequence key={item.id} name={item.name} from={from} durationInFrames={length}>
      <Example item={item}/>
    </Sequence>;
  })}</AbsoluteFill>;
}
