import Reveal from "./Reveal";
import { WaxSeal } from "./art";

export default function Summons() {
  return (
    <section className="section summons" id="summons" aria-labelledby="summons-title">
      <Reveal className="summons__card">
        <span className="frame-corner frame-corner--tl" aria-hidden="true" />
        <span className="frame-corner frame-corner--tr" aria-hidden="true" />
        <span className="frame-corner frame-corner--bl" aria-hidden="true" />
        <span className="frame-corner frame-corner--br" aria-hidden="true" />
        <p className="eyebrow">The Summons</p>
        <h2 id="summons-title" className="sr-only">
          The invitation
        </h2>
        <p className="summons__text">
          <span className="dropcap" aria-hidden="true">T</span>
          <span className="sr-only">T</span>he night is young, the spirits are restless, and you&rsquo;re officially invited. Get your
          drinks ready, bring your best Halloween energy, and join me for a night worth remembering.
        </p>
        <div className="summons__sign">
          <span className="summons__signature">Marta</span>
          <WaxSeal id="summons-seal" className="summons__seal" />
        </div>
      </Reveal>
    </section>
  );
}
