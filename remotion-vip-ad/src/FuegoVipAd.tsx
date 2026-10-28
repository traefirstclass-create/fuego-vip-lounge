import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {IntroScene} from './scenes/IntroScene';
import {FloorplanScene} from './scenes/FloorplanScene';
import {BookingScene} from './scenes/BookingScene';
import {CtaScene} from './scenes/CtaScene';

export const FuegoVipAd: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={105}><IntroScene /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 12})} />
    <TransitionSeries.Sequence durationInFrames={150}><FloorplanScene /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 12})} />
    <TransitionSeries.Sequence durationInFrames={120}><BookingScene /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 12})} />
    <TransitionSeries.Sequence durationInFrames={123}><CtaScene /></TransitionSeries.Sequence>
  </TransitionSeries>
);
