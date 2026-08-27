import { Star, Quote, Sparkles, MapPin, Building } from 'lucide-react';
import { TESTIMONIALS_LIST } from '../data/content';

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-violet-400">
            Customer Stories
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Trusted by teams that care about every customer.
          </h2>
          <p className="text-base sm:text-lg text-gray-400">
            Hear how Sri Lankan hospitality brands, e-commerce stores, and education institutes scale
            their trilingual conversations with Ceyra.
          </p>
        </div>

        {/* 3 Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS_LIST.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md p-8 hover:border-white/20 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div>
                {/* Rating Stars & Quote Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-gray-600 group-hover:text-violet-400 transition-colors" />
                </div>

                {/* Quote Text */}
                <p className="text-sm text-gray-200 leading-relaxed italic mb-8">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Author & Business Details */}
              <div className="pt-6 border-t border-white/5 flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-full ${item.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0`}
                >
                  {item.author
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{item.author}</h4>
                  <p className="text-xs text-gray-400">{item.role}</p>
                  <div className="flex items-center gap-2 text-[11px] text-violet-400 font-medium mt-0.5">
                    <span>{item.company}</span>
                    <span>·</span>
                    <span className="text-gray-500 flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      {item.city}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Small disclosure notice */}
        <div className="mt-8 text-center text-[11px] text-gray-500">
          * Representative customer testimonials and operational feedback from Ceyra early adopter cohort.
        </div>
      </div>
    </section>
  );
}
