import Link from "next/link";
import { Palette, MessageCircleQuestion } from "lucide-react";

const CHIP_CLASSES =
  "inline-flex items-center gap-1.5 rounded-full border border-[#1f1f1f]/15 bg-white px-3 py-1.5 text-[12px] font-medium text-[#1f1f1f] transition-colors hover:border-[#1f1f1f]/35 hover:bg-[#ece8df]";

export default function CheckoutNeedMoreHelp() {
  return (
    <div className="mt-6">
      <p className="text-sm font-semibold text-[#1f1f1f]">Need More Help?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href="https://cal.com/artace-studio"
          target="_blank"
          rel="noopener noreferrer"
          className={CHIP_CLASSES}
        >
          <Palette className="h-3.5 w-3.5" />
          Contact Art Advisory
        </a>
        <Link href="/contact-us" className={CHIP_CLASSES}>
          <MessageCircleQuestion className="h-3.5 w-3.5" />
          Contact Customer Support
        </Link>
      </div>
    </div>
  );
}
