import React from 'react';
import { 
  Lightbulb, 
  MapPin, 
  BarChart3, 
  Landmark, 
  Globe2 
} from 'lucide-react';

export const AuthBrandingPanel: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] flex-col justify-between relative overflow-hidden bg-slate-900 select-none h-screen">
      {/* High Quality Background Image with Subtle Scale */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ backgroundImage: 'url("/bg-farm.jpg")' }}
      />
      
      {/* Multi-stage Smooth Overlays for Perfect Contrast & Image Visibility */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white/95 via-white/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-3/5 z-[1] bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent" />

      {/* Main Content Box */}
      <div className="relative z-10 p-6 xl:p-8 flex flex-col justify-between h-full overflow-hidden">
        
        {/* Top Header & Tagline */}
        <div className="space-y-4 xl:space-y-5">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="RuralNex Logo" className="h-10 xl:h-12 w-auto object-contain filter drop-shadow-md" />
            <div>
              <h1 className="text-xl xl:text-2xl font-black text-gray-900 tracking-tight leading-none">RuralNex</h1>
              <p className="text-[10px] font-extrabold text-emerald-800 tracking-widest mt-0.5 uppercase">Empowering Rural Dreams</p>
            </div>
          </div>

          {/* Main Headline */}
          <div>
            <h2 className="text-xl xl:text-2xl font-black text-gray-900 leading-snug">
              Smarter Ideas. Stronger Villages.<br />
              <span className="text-primary">Brighter Tomorrow.</span>
            </h2>
            <p className="mt-1 text-xs xl:text-sm text-gray-700 font-semibold leading-relaxed max-w-md">
              AI-powered business advisory, geospatial intelligence, and financing assistance built for rural entrepreneurs.
            </p>
          </div>

          {/* Clean Glassmorphism Card for Available Website Features */}
          <div className="bg-white/80 backdrop-blur-md border border-white/70 shadow-xl rounded-2xl p-4 xl:p-5 space-y-2.5 xl:space-y-3">
            <h3 className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest border-b border-gray-200/80 pb-1.5">
              Platform Features Available
            </h3>

            {/* Feature 1 */}
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary p-1.5 rounded-lg shrink-0 shadow-2xs mt-0.5 border border-primary/20">
                <Lightbulb size={16} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-xs xl:text-sm">AI Business Advisory</h4>
                <p className="text-gray-600 text-[11px] xl:text-xs font-medium leading-tight mt-0.5">
                  Location-based business recommendations & what-if simulator
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary p-1.5 rounded-lg shrink-0 shadow-2xs mt-0.5 border border-primary/20">
                <MapPin size={16} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-xs xl:text-sm">Geospatial Intelligence</h4>
                <p className="text-gray-600 text-[11px] xl:text-xs font-medium leading-tight mt-0.5">
                  Market reach radius scoring, candidate nodes & spatial heatmaps
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary p-1.5 rounded-lg shrink-0 shadow-2xs mt-0.5 border border-primary/20">
                <BarChart3 size={16} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-xs xl:text-sm">Market & Demand Analysis</h4>
                <p className="text-gray-600 text-[11px] xl:text-xs font-medium leading-tight mt-0.5">
                  Demand forecasting, local price observations & competitor mapping
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary p-1.5 rounded-lg shrink-0 shadow-2xs mt-0.5 border border-primary/20">
                <Landmark size={16} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-xs xl:text-sm">Schemes & Micro-Finance</h4>
                <p className="text-gray-600 text-[11px] xl:text-xs font-medium leading-tight mt-0.5">
                  Government scheme matching, subsidy finder & loan assistance
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary p-1.5 rounded-lg shrink-0 shadow-2xs mt-0.5 border border-primary/20">
                <Globe2 size={16} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-xs xl:text-sm">Multilingual Support</h4>
                <p className="text-gray-600 text-[11px] xl:text-xs font-medium leading-tight mt-0.5">
                  Built for every Indian entrepreneur with 8+ regional languages
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Quote & Stats */}
        <div className="pt-4 xl:pt-6 space-y-3">
          <div className="border-l-3 border-emerald-400 pl-3">
            <p className="italic font-serif text-sm xl:text-base text-white drop-shadow-md font-medium leading-snug">
              "Viksit Bharat begins with Viksit Gaon."
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between text-white drop-shadow-md border-t border-white/20 pt-3">
            <div>
              <p className="text-lg xl:text-xl font-black text-white">10K+</p>
              <p className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest mt-0.5">Entrepreneurs</p>
            </div>
            <div className="w-px h-7 bg-white/25" />
            <div>
              <p className="text-lg xl:text-xl font-black text-white">500+</p>
              <p className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest mt-0.5">Villages</p>
            </div>
            <div className="w-px h-7 bg-white/25" />
            <div>
              <p className="text-lg xl:text-xl font-black text-white">95%</p>
              <p className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest mt-0.5">Satisfaction</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
