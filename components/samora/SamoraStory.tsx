const SamoraStory = () => {
  return (
    <section id="story" className="bg-[#2b2420] py-16 text-[#f3ead9] md:py-24">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-10">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#c1683d]">
            Our Story
          </p>
          <h2 className="font-samora-display mt-4 text-[32px] leading-[1.12] sm:text-[38px] md:text-[46px]">
            From canvas to craft
          </h2>
        </div>

        <div className="space-y-5 text-[16px] leading-[1.75] text-[#e4d4b8] md:text-[17px]">
          <p>
            Artace Studio has spent years working with artists across India to bring handcrafted
            canvas paintings into homes and offices. Samora grew out of the same studio floor
            &mdash; a natural extension for the artisans, weavers, and makers whose skills go far
            beyond the canvas.
          </p>
          <p>
            Where Artace Studio is about what goes on your walls, Samora is about what you hold,
            use, and live with every day: a tote you carry to work, a coaster under your morning
            tea, a tray on the console table, a name plate at your front door.
          </p>
          <p>
            Each Samora piece is made by hand, in small batches, using natural materials sourced
            with the same care Artace Studio applies to choosing its artists &mdash; because
            handmade, done properly, takes time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SamoraStory;
