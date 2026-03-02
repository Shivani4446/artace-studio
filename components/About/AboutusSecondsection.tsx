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
    <section className="w-full bg-[#FAF9F6] py-20 px-6 md:px-12 lg:px-24"> 
      {/* Container - bg-[#FAF9F6] is a cream/off-white color */}
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        
        {/* Left Column: Vertical Image */}
        {/* We add 'md:pt-32' to push this image down, creating the staggered layout */}
        <div className="flex flex-col justify-end md:pt-32 order-2 md:order-1">
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
        <div className="flex flex-col justify-between order-1 md:order-2">
          
          {/* Text Block */}
          <div className="mb-12 md:mb-20">
            <p className={`${lora.className} text-[#2D2D2D] text-lg md:text-xl leading-relaxed max-w-md`}>
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