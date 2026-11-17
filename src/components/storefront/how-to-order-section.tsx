import { Compass, ShoppingBag, ClipboardList, CreditCard, MessageCircle } from "lucide-react";

export function HowToOrderSection() {
  const steps = [
    {
      num: "01",
      title: "BROWSE PRODUCTS",
      desc: "Explore our website and choose your items.",
      icon: Compass,
    },
    {
      num: "02",
      title: "ADD TO CART",
      desc: "Select your preferred options and add items to your cart.",
      icon: ShoppingBag,
    },
    {
      num: "03",
      title: "CHECKOUT",
      desc: "Enter your shipping details and review your order.",
      icon: ClipboardList,
    },
    {
      num: "04",
      title: "COMPLETE PAYMENT",
      desc: "Follow the payment instructions to place your order.",
      icon: CreditCard,
    },
    {
      num: "05",
      title: "ORDER CONFIRMATION",
      desc: "Receive your order confirmation via WhatsApp.",
      icon: MessageCircle,
    },
  ];

  return (
    <section id="how-to-order" className="py-16 md:py-20 bg-ivory/60 border-y border-border/80">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold tracking-widest text-plum-muted uppercase">
            Simple &amp; Transparent
          </span>
          <h2 className="mv-heading-italic text-3xl sm:text-4xl text-plum">
            HOW TO ORDER
          </h2>
          <p className="text-sm text-plum-muted leading-relaxed">
            Order online through our website and confirm payment directly with our team via WhatsApp.
          </p>
        </div>

        {/* 5-Step Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-white p-5 rounded-2xl border border-border/80 shadow-xs flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="mv-heading-italic text-3xl text-pink leading-none">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blush/60 text-plum flex items-center justify-center">
                      <Icon className="w-5 h-5 text-plum" />
                    </div>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-plum uppercase tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-plum-muted mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 text-[10px] text-plum-muted/80 uppercase font-semibold">
                  Step {step.num} of 05
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
