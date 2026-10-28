import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Eyebrow, Grain} from '../components/Brand';

const sections = [
  {name: 'VIP 4', x: 33, y: 14, color: '#e31924'},
  {name: 'VIP 5', x: 50, y: 12, color: '#e31924'},
  {name: 'VIP 6', x: 66, y: 14, color: '#e31924'},
  {name: 'M4', x: 33, y: 36, color: '#d69a27'},
  {name: 'M5', x: 50, y: 36, color: '#d69a27'},
  {name: 'M6', x: 66, y: 36, color: '#d69a27'},
  {name: 'M1', x: 42, y: 63, color: '#d69a27'},
  {name: 'M2', x: 57, y: 63, color: '#d69a27'},
  {name: 'VIP 7', x: 86, y: 54, color: '#e31924'},
];

const SectionPulse: React.FC<{
  active: boolean;
  color: string;
  name: string;
  x: number;
  y: number;
}> = ({active, color, name, x, y}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const appear = spring({frame: frame - 18, fps, config: {damping: 16}});
  const pulse = active ? 1 + Math.sin(frame * 0.35) * 0.12 : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: active ? 112 : 70,
        height: active ? 112 : 70,
        border: `${active ? 8 : 3}px solid ${color}`,
        borderRadius: '50%',
        background: active ? `${color}33` : 'rgba(0,0,0,.24)',
        boxShadow: active ? `0 0 0 12px ${color}25, 0 0 42px ${color}` : `0 0 18px ${color}70`,
        display: 'grid',
        placeItems: 'center',
        transform: `translate(-50%, -50%) scale(${appear * pulse})`,
        color: 'white',
        fontSize: active ? 25 : 17,
        fontWeight: 900,
        textShadow: '0 2px 8px #000',
      }}
    >
      {name}
    </div>
  );
};

export const FloorplanScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const textIn = spring({frame: frame - 10, fps, config: {damping: 18}});
  const mapIn = spring({frame: frame - 4, fps, config: {damping: 18, stiffness: 90}});
  const activeIndex = Math.min(sections.length - 1, Math.floor(frame / 15));
  const panX = interpolate(frame, [0, 150], [-88, -150]);
  const panY = interpolate(frame, [0, 150], [0, -38]);
  const mapScale = interpolate(frame, [0, 150], [1.04, 1.11]);

  return (
    <AbsoluteFill style={{background: '#060606', color: 'white', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 44%, rgba(155,20,24,.24), transparent 58%)'}} />
      <div style={{position: 'absolute', top: 112, left: 88, right: 88, zIndex: 4}}>
        <Eyebrow>Pick your perfect spot</Eyebrow>
        <div
          className="display"
          style={{
            marginTop: 20,
            fontSize: 92,
            lineHeight: 0.96,
            opacity: textIn,
            transform: `translateY(${interpolate(textIn, [0, 1], [42, 0])}px)`,
          }}
        >
          Choose<br />Your Section
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: panX,
          top: 500 + panY,
          width: 1320,
          height: 880,
          overflow: 'hidden',
          borderTop: '3px solid rgba(214,154,39,.85)',
          borderBottom: '3px solid rgba(214,154,39,.85)',
          boxShadow: '0 30px 80px rgba(0,0,0,.72), 0 0 70px rgba(227,25,36,.18)',
          opacity: mapIn,
          transform: `scale(${interpolate(mapIn, [0, 1], [.9, 1])})`,
        }}
      >
        <Img
          src={staticFile('assets/fuego-floorplan.png')}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${mapScale})`,
            filter: 'brightness(.82) contrast(1.08) saturate(1.06)',
          }}
        />
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.18))'}} />
        {sections.map((section, index) => (
          <SectionPulse key={section.name} {...section} active={index === activeIndex} />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 88,
          right: 88,
          bottom: 126,
          zIndex: 4,
          padding: '26px 28px',
          borderLeft: '6px solid #e31924',
          background: 'rgba(10,10,10,.92)',
          fontSize: 34,
          lineHeight: 1.35,
          opacity: interpolate(frame, [62, 82], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Tap a VIP or main floor section to see pricing and reserve.
      </div>
      <Grain />
    </AbsoluteFill>
  );
};
