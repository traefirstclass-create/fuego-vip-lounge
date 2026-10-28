import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const LogoMark: React.FC<{width?: number}> = ({width = 260}) => (
  <Img src={staticFile('assets/logo-watermark.png')} style={{width, height: 'auto', objectFit: 'contain'}} />
);

export const Eyebrow: React.FC<{children: React.ReactNode; delay?: number}> = ({children, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entry = spring({frame: frame - delay, fps, config: {damping: 18}});
  return (
    <div style={{color: '#ffcb66', fontSize: 30, fontWeight: 800, letterSpacing: 4, opacity: entry, transform: `translateY(${interpolate(entry, [0, 1], [24, 0])}px)`, textTransform: 'uppercase'}}>
      {children}
    </div>
  );
};

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', inset: -80, opacity: 0.075, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.7) 0 1px, transparent 1.5px)', backgroundSize: '18px 18px', transform: `translate(${(frame * 17) % 80}px, ${(frame * 11) % 80}px)`, pointerEvents: 'none'}} />
  );
};
