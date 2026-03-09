import Image from "next/image";
import { Lora } from "next/font/google";

// Using Lora for the body text to match the elegant serif look
const lora = Lora({ 
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"]
});

export default function GallerySection() {
  return (
    <section className="w-full bg-[#FAF9F6] px-4 py-12 sm:px-6 sm:py-16 md:px-12 md:py-20 lg:px-24"> 
      {/* Container - bg-[#FAF9F6] is a cream/off-white color */}
      
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:gap-24">
        
        {/* Left Column: Vertical Image */}
        {/* We add 'md:pt-32' to push this image down, creating the staggered layout */}
        <div className="order-2 flex flex-col justify-end md:order-1 md:pt-32">
          <div className="relative w-full aspect-[3/4] shadow-sm">
            <Image
              src="/about-us-img-1.webp"
              alt="Pastoral painting with sheep and trees"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Right Column: Text + Horizontal Image */}
        <div className="order-1 flex flex-col justify-between md:order-2">
          
          {/* Text Block */}
          <div className="mb-8 md:mb-20">
            <p
              className={`${lora.className} max-w-md text-[16px] leading-7 text-[#2D2D2D] md:text-xl md:leading-relaxed`}
            >
              Artace Studio has stood as a beacon of artistic excellence, specializing in
              premium canvas paintings that transform spaces into galleries of distinction and
              aim for all thing everything about paintings.
            </p>
          </div>

          {/* Horizontal Image */}
          <div className="relative w-full aspect-[16/10] shadow-sm">
            <Image
              src="/about-us-img-2.webp"
              alt="Autumn forest landscape painting"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          
        </div>

      </div>
    </section>
  );
}
