import { Eye, ShoppingCart, Sparkles } from "lucide-react";

// Using the provided ImageKit URL
const logo =
  "https://ik.imagekit.io/eczrgfwzq/forkedUp_logo2.png?updatedAt=1761337612355";

// Reusable Feature Card Component
function FeatureCard({ icon, title, text, color }) {
  return (
    // Added subtle hover transition
    <div className="bg-white rounded-xl p-5 shadow-md border border-brand-gray-light text-left flex items-start space-x-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      <div className={`flex-shrink-0 ${color} mt-1`}>{icon}</div>
      <div>
        <h2 className="font-heading font-semibold text-lg text-brand-gray mb-1">
          {title}
        </h2>
        <p className="text-brand-gray text-sm leading-snug">{text}</p>
      </div>
    </div>
  );
}

// Main Landing Page Component
export default function LandingPage() {
  return (
    // Main container simulating mobile screen
    <div className="flex flex-col h-full bg-brand-offwhite font-body overflow-hidden text-brand-gray">

      {/* Header: Sticky, fixed height, centered logo */}
      <header className="px-4 sticky top-0 bg-white/80 backdrop-blur-md z-10 shadow-sm h-20 flex items-center justify-center">
        {/* Logo constrained within header height */}
        <img src={logo} alt="ForkedUp Logo" className="max-h-20 object-contain w-auto" />
      </header>

      {/* Scrollable Content Area: Takes remaining space and scrolls vertically */}
      <main className="flex-grow overflow-y-auto scrollbar-hide">

        {/* Hero Section: Visually distinct */}
        <section className="relative flex flex-col items-center text-center py-16 px-6 bg-gradient-to-b from-brand-peach/20 via-brand-offwhite/50 to-brand-offwhite overflow-hidden">

          {/* Hero Content */}
          <div className="relative z-10 max-w-xl space-y-5 animate-fade-in">
            <h1 className="text-5xl font-accent text-brand-orange leading-tight">
              Scroll. Crave. Order.
            </h1>
            <p className="text-brand-gray text-lg leading-relaxed px-4">
              Fork it up — your next meal is just a reel away. Discover and order delicious food visually.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a
                href="/user/login"
                className="group flex items-center justify-center gap-2 bg-brand-orange text-white font-heading py-3 px-8 rounded-full shadow-lg hover:bg-brand-peach hover:text-brand-gray hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <span>Explore Food</span>
              </a>

              <a
                href="/food-partner/login"
                className="flex items-center justify-center gap-2 bg-white border border-brand-gray text-brand-gray font-heading py-3 px-8 rounded-full shadow hover:bg-brand-gray-light hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <span>I'm a Food Partner</span>
              </a>
            </div>
          </div>
        </section>

        {/* Features Section - Contained within the scrollable main area */}
        <section className="pt-10 pb-20 px-6">
          <div className="max-w-md mx-auto space-y-6">
            <FeatureCard
              icon={<Eye size={24} />}
              title="Discover Visually"
              color="text-brand-orange"
              text="Scroll through food reels showcasing authentic dishes from nearby eateries. Taste with your eyes first!"
            />
            <FeatureCard
              icon={<ShoppingCart size={24} />}
              title="Order Seamlessly"
              color="text-brand-green"
              text="See something delicious? Add items directly from the video reel to your cart and check out in moments."
            />
            <FeatureCard
              icon={<Sparkles size={24} />}
              title="Support Local Gems"
              color="text-brand-pink"
              text="We connect you with unique local restaurants, helping you find hidden treasures and support your community."
            />
          </div>
        </section>

      </main>

      {/* Footer: Simple, stays at the bottom */}
      <footer className="text-center py-4 text-brand-gray text-xs px-4 border-t border-brand-gray-light bg-white/50">
        © {new Date().getFullYear()} ForkedUp. All rights reserved.
      </footer>
    </div>
  );
}