import Image from "next/image";
import Link from "next/link";

type TeamMember = {
  name: string;
  role: string;
  image: string;
  imageAlt: string;
  bio: string;
  linkedin: string;
};

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Sampadaa Mahalley",
    role: "Founder and CEO, Artace Studio",
    image: "/sampadaa-mahalley-profile.webp",
    imageAlt: "Sampadaa Mahalley",
    bio: "Sampadaa leads Artace Studio with a clear vision to make meaningful art accessible to modern homes. She shapes the brand's creative direction, builds artist partnerships, and ensures every customer experience feels personal, premium, and trustworthy.",
    linkedin: "https://www.linkedin.com/in/sampadaa-mahalley-6b6329244",
  },
  {
    name: "Sahil Mahalley",
    role: "Co-founder, Artace Studio",
    image: "/Sahil-mahalley.webp",
    imageAlt: "Sahil Mahalley",
    bio: "Sahil drives product, growth, and digital experience at Artace Studio. From curation systems to customer journeys, he focuses on combining technology and design so discovering and buying handmade art feels seamless, transparent, and inspiring.",
    linkedin: "https://www.linkedin.com/in/sahil-mahalley",
  },
  {
    name: "Shivani Sank",
    role: "Tech Head, Artace Studio",
    image: "/shivani-sank-profile.webp",
    imageAlt: "Shivani Sank",
    bio: "Shivani leads technology at Artace Studio, building reliable systems that power browsing, discovery, and checkout across the platform. She focuses on performance, product quality, and scalable engineering so every customer interaction stays smooth and dependable.",
    linkedin: "https://www.linkedin.com/in/shivani-sank-a6bb311a9/",
  },
];

const TeamPage = () => {
  return (
    <main className="bg-[#f4f2ee] px-4 py-8 sm:px-6 md:px-12 md:py-14 lg:px-24">
      <section className="mx-auto max-w-[1440px]">
        <div>
          <h1 className="font-display text-[34px] leading-[1.04] text-[#1f1f1f] md:text-[52px] md:leading-[0.98]">
            Meet the Team
          </h1>
          <p className="mt-4 max-w-[980px] font-inter text-[15px] leading-7 text-[#595959] md:mt-5 md:text-[18px] md:leading-8">
            Artace Studio is built by people who care deeply about art, artists, and
            experience. Our leadership blends creative vision with operational rigor
            so each piece you collect feels thoughtful and lasting.
          </p>
        </div>

        <div className="mt-8 space-y-12 md:mt-12 md:space-y-24">
          {TEAM_MEMBERS.map((member, index) => (
            <article
              key={member.name}
              className={`grid items-center gap-6 rounded-[12px] border border-[#ddd8cf] bg-white/60 p-4 md:gap-14 md:rounded-none md:border-0 md:bg-transparent md:p-0 ${
                index % 2 === 1
                  ? "md:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]"
                  : "md:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]"
              }`}
            >
              <div className={index % 2 === 1 ? "md:order-2" : ""}>
                <h2 className="font-display text-[30px] leading-[1.06] text-[#1f1f1f] md:text-[42px] md:leading-[1.02]">
                  {member.name}
                </h2>
                <p className="mt-2 font-inter text-[12px] font-medium uppercase tracking-[0.07em] text-[#6f685f] md:text-[15px]">
                  {member.role}
                </p>
                <p className="mt-4 font-inter text-[15px] leading-7 text-[#595959] md:mt-5 md:text-[18px] md:leading-8">
                  {member.bio}
                </p>
              </div>

              <div
                className={`flex flex-col items-center ${
                  index % 2 === 1 ? "md:order-1" : ""
                }`}
              >
                <div className="relative h-[180px] w-[180px] overflow-hidden rounded-full border border-[#ded8ce] bg-[#ece8df] md:h-[260px] md:w-[260px]">
                  <Image
                    src={member.image}
                    alt={member.imageAlt}
                    fill
                    sizes="(max-width: 768px) 180px, 260px"
                    className={
                      member.name === "Sampadaa Mahalley"
                        ? "object-cover scale-[1.25] object-[center_22%]"
                        : "object-cover"
                    }
                  />
                </div>
                <Link
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center font-inter text-[13px] font-medium text-[#313131] underline underline-offset-4 transition-colors hover:text-black md:text-[14px]"
                >
                  LinkedIn
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default TeamPage;
