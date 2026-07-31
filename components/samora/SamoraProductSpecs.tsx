export type SamoraSpec = { label: string; value: string };

const SamoraProductSpecs = ({ specs }: { specs: SamoraSpec[] }) => {
  if (specs.length === 0) return null;

  return (
    <div className="mt-14 border-t border-[#2b2420]/10 pt-10 md:mt-16 md:pt-12">
      <h2 className="font-samora-display text-[24px] text-[#2b2420] md:text-[28px]">
        Specifications
      </h2>
      <div className="mt-5 max-w-[640px] overflow-hidden rounded-[16px] border border-[#2b2420]/10">
        {specs.map((spec, index) => (
          <div
            key={spec.label}
            className={`grid grid-cols-[minmax(140px,0.4fr)_1fr] gap-4 px-5 py-3.5 ${
              index % 2 === 0 ? "bg-[#fbf6ef]" : "bg-[#f3ead9]"
            }`}
          >
            <span className="text-[13.5px] font-medium text-[#8a7c68]">{spec.label}</span>
            <span className="text-[14px] text-[#2b2420]">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SamoraProductSpecs;
