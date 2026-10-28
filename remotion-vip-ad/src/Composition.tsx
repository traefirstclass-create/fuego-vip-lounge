import {Composition} from 'remotion';
import {FuegoVipAd} from './FuegoVipAd';

export const MyComposition = () => {
  return (
    <Composition
      id="FuegoVipMobileAd"
      component={FuegoVipAd}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
