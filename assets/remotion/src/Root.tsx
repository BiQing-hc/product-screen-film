import React from 'react';
import {Composition} from 'remotion';
import {Demo, demoFrames} from '../Demo';
import {ProductFilm, filmSchema, getFilmFrames} from '../ProductFilm';

// Studio saves the editable composition properties to this file.
export const Root = () => <>
  <Composition id="ProductFilm" component={ProductFilm} width={1920} height={1080} fps={30}
    schema={filmSchema} calculateMetadata={({props}) => ({durationInFrames:getFilmFrames(props)})}
    defaultProps={{
      "captions": true,
      "narration": true,
      "music": true,
      "sfx": true,
      "shots": [
        {
          "id": "open",
          "name": "打开待派工单",
          "file": "practice-order.mp4",
          "trimBefore": 0,
          "frames": 78,
          "captions": [
            {
              "from": 4,
              "frames": 66,
              "text": "打开冷却泵的工单"
            }
          ]
        },
        {
          "id": "dispatch",
          "name": "派给班组并核对结果",
          "file": "practice-order.mp4",
          "trimBefore": 78,
          "frames": 84,
          "captions": [
            {
              "from": 25,
              "frames": 58,
              "text": "工单已派给机修一组"
            }
          ]
        }
      ],
      "audio": [
        {
          "name": "团队女声",
          "kind": "narration",
          "file": "audio/旁白.wav",
          "from": 0,
          "volume": 1
        },
        {
          "name": "操作音 · 打开",
          "kind": "sfx",
          "file": "click.wav",
          "from": 43,
          "frames": 3,
          "volume": 0.6
        },
        {
          "name": "操作音 · 派单",
          "kind": "sfx",
          "file": "click.wav",
          "from": 97,
          "frames": 3,
          "volume": 0.6
        }
      ]
    }} />
  <Composition id="PageTransitionDemo" component={Demo} width={1920} height={1080} fps={30}
    durationInFrames={demoFrames} />
</>;
