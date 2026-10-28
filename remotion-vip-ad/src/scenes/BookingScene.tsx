import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Eyebrow, Grain} from '../components/Brand';

const Step: React.FC<{number: string; title: string; delay: number}> = ({number, title, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entry = spring({frame: frame - delay, fps, config: {damping: 17}});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 20, opacity: entry, transform: `translateX(${interpolate(entry, [0, 1], [45, 0])}px)`}}>
      <div style={{width: 58, height: 58, display: 'grid', placeItems: 'center', background: '#e31924', color: 'white', fontSize: 25, fontWeight: 800, flex: '0 0 auto'}}>{number}</div>
      <div style={{fontSize: 32, fontWeight: 650}}>{title}</div>
    </div>
  );
};

export const BookingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const phoneIn = spring({frame, fps, config: {damping: 15, stiffness: 105}});
  const tap = 1 + Math.max(0, Math.sin((frame - 45) * 0.22)) * 0.12;
  return (
    <AbsoluteFill style={{background: '#080808', color: 'white', overflow: 'hidden'}}>
      <Img src={staticFile('assets/lounge-night.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: 'rgba(0,0,0,.78)'}} />
      <div style={{position: 'absolute', top: 110, left: 88, right: 88}}>
        <Eyebrow>Fast. Simple. Online.</Eyebrow>
        <div className="display" style={{fontSize: 78, lineHeight: 1, marginTop: 18}}>Reserve in<br />just a few taps</div>
      </div>
      <div style={{position: 'absolute', left: 95, top: 520, width: 600, height: 940, padding: 20, border: '3px solid rgba(255,255,255,.22)', borderRadius: 52, background: '#0b0b0b', boxShadow: '0 35px 90px rgba(0,0,0,.7), 0 0 50px rgba(227,25,36,.2)', transform: `perspective(1300px) rotateY(-9deg) rotateX(4deg) translateY(${interpolate(phoneIn, [0, 1], [180, 0])}px) scale(${interpolate(phoneIn, [0, 1], [.82, 1])})`, opacity: phoneIn}}>
        <div style={{height: 31, width: 150, borderRadius: 18, background: '#222', margin: '0 auto 16px'}} />
        <div style={{position: 'relative', height: 872, overflow: 'hidden', borderRadius: 34, background: '#070707'}}>
          <div style={{padding: '28px 26px 20px', fontWeight: 800, fontSize: 28}}>SELECT YOUR SECTION</div>
          <Img src={staticFile('assets/fuego-floorplan.png')} style={{width: '100%', height: 350, objectFit: 'cover', objectPosition: 'center'}} />
          <div style={{padding: '24px 26px'}}>
            <div style={{fontSize: 23, color: '#aaa'}}>Selected section</div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10}}>
              <div style={{fontSize: 36, fontWeight: 800}}>VIP 5</div><div style={{fontSize: 27, color: '#ffcc72'}}>$350</div>
            </div>
            <div style={{height: 1, background: '#292929', margin: '24px 0'}} />
            <div style={{fontSize: 23, color: '#aaa', marginBottom: 13}}>Preferred server</div>
            <div style={{display: 'flex', gap: 12}}>
              <div style={{padding: '13px 18px', background: '#e31924', fontSize: 22, fontWeight: 700}}>Daniela</div>
              <div style={{padding: '13px 18px', border: '1px solid #555', fontSize: 22}}>Pamela</div>
            </div>
            <div style={{marginTop: 30, padding: '19px 22px', textAlign: 'center', background: '#d69a27', color: '#090909', fontSize: 25, fontWeight: 800}}>CONTINUE TO CHECKOUT</div>
          </div>
          <div style={{position: 'absolute', left: 265, top: 282, width: 82, height: 82, borderRadius: '50%', border: '6px solid #fff', boxShadow: '0 0 0 8px rgba(227,25,36,.75)', transform: `scale(${tap})`}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 705, right: 70, top: 675, display: 'grid', gap: 42}}>
        <Step number="01" title="Choose a section" delay={18} />
        <Step number="02" title="Add your details" delay={31} />
        <Step number="03" title="Secure checkout" delay={44} />
      </div>
      <Grain />
    </AbsoluteFill>
  );
};
