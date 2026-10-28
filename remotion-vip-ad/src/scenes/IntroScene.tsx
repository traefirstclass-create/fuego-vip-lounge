import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Eyebrow, Grain, LogoMark} from '../components/Brand';

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logoIn = spring({frame, fps, config: {damping: 16, stiffness: 120}});
  const titleIn = spring({frame: frame - 16, fps, config: {damping: 18}});
  const imageScale = interpolate(frame, [0, 105], [1.13, 1.02], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: '#050505', color: 'white', overflow: 'hidden'}}>
      <Img src={staticFile('assets/crowd-portrait.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${imageScale})`, filter: 'saturate(.9) contrast(1.08)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.38) 0%, rgba(0,0,0,.58) 44%, rgba(0,0,0,.96) 100%)'}} />
      <div style={{position: 'absolute', top: 102, left: 88, transform: `scale(${interpolate(logoIn, [0, 1], [0.75, 1])})`, transformOrigin: 'top left', opacity: logoIn}}>
        <LogoMark width={190} />
      </div>
      <div style={{position: 'absolute', left: 88, right: 88, bottom: 180}}>
        <Eyebrow delay={7}>Fuego VIP Lounge</Eyebrow>
        <div className="display" style={{marginTop: 24, fontSize: 114, lineHeight: 0.94, opacity: titleIn, transform: `translateY(${interpolate(titleIn, [0, 1], [70, 0])}px)`, textShadow: '0 10px 42px rgba(0,0,0,.55)'}}>
          VIP<br />Reservations
        </div>
        <div style={{marginTop: 36, width: 'fit-content', padding: '18px 26px', background: '#e31924', color: '#fff', fontSize: 37, fontWeight: 800, letterSpacing: 1, opacity: titleIn}}>
          NOW AVAILABLE ONLINE
        </div>
      </div>
      <Grain />
    </AbsoluteFill>
  );
};
