import { Composition } from 'remotion';
import { HestiaReel } from './HestiaReel';

export const RemotionRoot = () => (
  <Composition
    id="HestiaReel"
    component={HestiaReel}
    durationInFrames={1500}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{}}
  />
);
