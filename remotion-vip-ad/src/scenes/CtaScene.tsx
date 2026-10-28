import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Grain, LogoMark} from '../components/Brand';

export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logoIn = spring({frame, fps, config: {damping: 15, stiffness: 110}});
  const ctaIn = spring({frame: frame - 18, fps, config: {damping: 16}});
  const glow = 0.48 + Math.sin(frame * 0.12) * 0.12;
  return (
    <AbsoluteFill style={{background: '#050505', color: 'white', overflow: 'hidden', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', width: 920, height: 920, borderRadius: '50%', background: `radial-gradient(circle, rgba(205,20,28,${glow}) 0%, rgba(134,11,18,.16) 42%, transparent 70%)`}} />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${interpolate(logoIn, [0, 1], [.68, 1])})`, opacity: logoIn}}>
        <LogoMark width={360} />
        <div style={{fontSize: 28, color: '#ffcf78', fontWeight: 700, letterSpacing: 5, marginTop: 24}}>VIP RESERVATIONS AVAILABLE NOW</div>
        <div className="display" style={{marginTop: 34, width: 900, textAlign: 'center', fontSize: 112, lineHeight: 0.96, opacity: ctaIn, transform: `translateY(${interpolate(ctaIn, [0, 1], [55, 0])}px)`}}>
          Book Your<br />Section
        </div>
        <div style={{marginTop: 52, padding: '26px 56px', background: '#e31924', fontSize: 38, fontWeight: 800, boxShadow: '0 16px 55px rgba(227,25,36,.42)', opacity: ctaIn}}>RESERVE ONLINE NOW</div>
        <div style={{marginTop: 38, fontSize: 31, fontWeight: 650}}>@FUEGOVIPLOUNGE</div>
      </div>
      <Grain />
    </AbsoluteFill>
  );
};
