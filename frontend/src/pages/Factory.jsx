import { motion } from "motion/react";
import { Globe, Maximize, Package, Play, Sparkles, Users } from "lucide-react";

export function Factory() {
  return (
    <div className="pb-24 pt-8">
      <section className="section-shell">
        <div className="relative overflow-hidden rounded-[34px] border border-hofo-walnut/10 shadow-[0_30px_60px_rgba(20,10,6,0.22)]">
          <img
            src="https://images.unsplash.com/photo-1542621334-a254cf47733d?q=80&w=2070&auto=format&fit=crop"
            alt="Factory Aerial View"
            className="h-[72vh] w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/45 to-black/30" />
          <div className="absolute inset-0 bg-vignette" />

          <div className="absolute inset-0 z-10 grid place-items-center px-4 text-center">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-hofo-accent backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Behind The Craft
              </p>

              <h1 className="font-serif text-5xl leading-[0.9] text-white md:text-7xl lg:text-8xl">Inside HOFO</h1>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/82 md:text-lg">
                Where traditional hand-finishing meets process discipline and modern machinery for globally consistent quality.
              </p>

              <button className="mt-8 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/35 bg-white/15 text-white backdrop-blur-sm hover:scale-105 hover:bg-white/25 md:h-16 md:w-16">
                <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell relative -mt-10 md:-mt-12">
        <div className="grain-card rounded-[28px] p-6 md:p-8">
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {[
              { icon: Package, value: "50,000+", label: "Units / Month" },
              { icon: Globe, value: "25+", label: "Export Containers" },
              { icon: Users, value: "120+", label: "Master Artisans" },
              { icon: Maximize, value: "45,000", label: "Sq Ft Facility" },
            ].map((stat, i) => (
              <motion.article
                key={stat.label}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="rounded-2xl border border-hofo-walnut/10 bg-white/70 p-4 text-center"
              >
                <stat.icon className="mx-auto h-7 w-7 text-hofo-teak" strokeWidth={1.5} />
                <h3 className="mt-3 font-serif text-3xl leading-none text-hofo-walnut-dark md:text-4xl">{stat.value}</h3>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-hofo-walnut/58">{stat.label}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-20 md:py-24">
        <div className="mb-10 text-center md:mb-12">
          <p className="hofo-eyebrow">Production Flow</p>
          <h2 className="mt-2 font-serif text-4xl leading-none text-hofo-walnut-dark md:text-6xl">How We Build</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              step: "01",
              title: "Select Timber",
              desc: "Each log is checked for grain stability and moisture before cutting.",
            },
            {
              step: "02",
              title: "Precision Milling",
              desc: "Material is cut with CNC-guided tolerance before manual finishing.",
            },
            {
              step: "03",
              title: "Hand Finishing",
              desc: "Artisans smooth every edge and contour for comfort and durability.",
            },
            {
              step: "04",
              title: "Quality & Dispatch",
              desc: "Final inspection, oil treatment, and export-safe protective packing.",
            },
          ].map((item, i) => (
            <motion.article
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.45 }}
              className="grain-card rounded-3xl p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hofo-teak">Step {item.step}</p>
              <h3 className="mt-3 font-serif text-3xl leading-none text-hofo-walnut-dark">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-hofo-walnut/72">{item.desc}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="mb-10 text-center md:mb-12">
          <p className="hofo-eyebrow">Workshop Gallery</p>
          <h2 className="mt-2 font-serif text-4xl leading-none text-hofo-walnut-dark md:text-6xl">The Floor</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-hofo-walnut/72">
            A glimpse of our machines, benches, and finishing spaces where every product moves from raw timber to refined utility.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-[28px] md:col-span-2">
            <img src="https://images.unsplash.com/photo-1505069190533-da1c9af13346?q=80&w=2070&auto=format&fit=crop" alt="Woodworking" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/62 via-black/10 to-transparent p-7">
              <p className="absolute bottom-7 left-7 font-serif text-3xl text-white">Precision Machinery</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[28px]">
            <img src="https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=1976&auto=format&fit=crop" alt="Tools" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/62 via-black/10 to-transparent p-7">
              <p className="absolute bottom-7 left-7 font-serif text-3xl text-white">Traditional Tools</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[28px]">
            <img src="https://images.unsplash.com/photo-1611486212557-88be5ff6f941?q=80&w=2070&auto=format&fit=crop" alt="Raw Wood" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/62 via-black/10 to-transparent p-7">
              <p className="absolute bottom-7 left-7 font-serif text-3xl text-white">Raw Material Bay</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[28px] md:col-span-2">
            <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop" alt="Artisan at work" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/62 via-black/10 to-transparent p-7">
              <p className="absolute bottom-7 left-7 font-serif text-3xl text-white">Master Artisans</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}