import Reveal from "./Reveal";
import Pumpkin from "./Pumpkin";
import { BatShape } from "./art";

function Graveyard() {
  return (
    <svg className="graveyard" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d="M0 230 Q 240 200 480 214 T 960 206 T 1440 214 L1440 300 L0 300 Z" fill="#0d070b" />
      <g fill="#0a0508">
        <path d="M150 240 v-60 a34 34 0 0 1 68 0 v60 Z" />
        <path d="M300 250 v-40 a24 24 0 0 1 48 0 v40 Z" />
        <path d="M1090 246 v-56 a30 30 0 0 1 60 0 v56 Z" />
        <path d="M1240 252 v-36 h-14 v-12 h14 v-14 h12 v14 h14 v12 h-14 v36 Z" />
        <path d="M420 246 v-28 h-12 v-10 h12 v-12 h10 v12 h12 v10 h-12 v28 Z" />
        <path d="M940 250 v-46 l24 -14 l24 14 v46 Z" />
      </g>
      <g stroke="#0a0508" strokeLinecap="round" fill="none">
        <path d="M600 240 C604 200 596 170 610 130 M606 180 C580 164 566 150 548 128 M610 150 C636 134 650 112 672 104" strokeWidth="7" />
        <path d="M548 128 C540 116 530 112 520 112 M672 104 C684 96 690 86 702 82" strokeWidth="3" />
      </g>
      <path d="M0 262 Q 360 244 720 254 T 1440 256 L1440 300 L0 300 Z" fill="#080609" />
    </svg>
  );
}

export default function Closing() {
  return (
    <section className="closing" aria-labelledby="closing-title">
      <div className="closing__moon" aria-hidden="true" />
      <div className="closing__bats" aria-hidden="true">
        <BatShape className="closing__bat closing__bat--1" />
        <BatShape className="closing__bat closing__bat--2" />
        <BatShape className="closing__bat closing__bat--3" />
      </div>
      <Reveal className="closing__content">
        <p className="eyebrow">The Dress Code</p>
        <h2 id="closing-title" className="closing__title">
          <span>Dress to impress.</span>
          <span className="closing__title-accent">Come to haunt.</span>
        </h2>
        <p className="closing__after">See you after dark.</p>
      </Reveal>
      <div className="closing__ground">
        <Graveyard />
        <div className="closing__pumpkins">
          <Pumpkin size={92} />
          <Pumpkin size={64} className="pumpkin--small" />
          <Pumpkin size={76} />
        </div>
        <div className="closing__fog" aria-hidden="true" />
      </div>
      <footer className="footer">
        <p>Hosted by Marta · Halloween 2026</p>
      </footer>
    </section>
  );
}
