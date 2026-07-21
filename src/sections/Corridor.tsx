import { Index, Reveal } from '../components/ui'

/** §1.1 Brand foundation — core values, stated as the deck states them. */
const VALUES = [
  ['Integrity', 'We write down why we passed, and we send it.'],
  ['Innovation', 'The pipeline is Valley-grade or it does not go out.'],
  ['Empowerment', 'Nobody writes a first cheque here without knowing why.'],
  ['Community', 'A network that takes each other’s calls.'],
  ['Global mindset', 'Two markets, one set of standards.'],
]

export function Corridor() {
  return (
    <section id="corridor" className="scroll-mt-20 border-b border-rule py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <Index n="1.1" label="The mission" />
        </Reveal>

        <div className="mt-10 grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <Reveal>
            <h2 className="font-display text-[2.5rem] leading-[1.08] font-semibold tracking-[-0.025em] text-balance sm:text-h2">
              The capital and the companies were never the problem.
              <span className="text-ink-45"> The distance was.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.08} className="lg:pt-3">
            <div className="measure space-y-5 text-[16.5px] leading-relaxed text-ink-70">
              <p>
                There is serious money in Central Eurasia and there are serious
                companies in Silicon Valley. What has been missing is a route
                between them that a first-time angel in Almaty can actually walk
                — with the diligence already done, the structure already legal,
                and someone on the other end who picks up.
              </p>
              <p>
                The Silkroad Innovation Hub is that route. We curate the deals, we run the
                education, and we stay with our members through the whole
                investment — not just the wire.
              </p>
              <p className="font-display text-[17px] font-medium text-ink">
                And it runs both ways. The founders building in this region
                deserve the same access our investors are buying.
              </p>
            </div>
          </Reveal>
        </div>

        {/* core values, §1.1 */}
        <div className="mt-20 grid gap-px overflow-hidden rounded-2xl bg-rule sm:grid-cols-2 lg:grid-cols-5">
          {VALUES.map(([title, body], i) => (
            <Reveal key={title} delay={i * 0.05} className="h-full">
              <div className="group h-full bg-snow p-6 transition-colors duration-300 hover:bg-white">
                <div className="mb-5 h-px w-8 bg-turquoise transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-16" />
                <h3 className="font-display text-[17px] font-semibold">{title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-70">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
