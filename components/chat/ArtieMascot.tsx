"use client";

import React, { useId } from "react";

export type ArtieMascotVariant = "idle" | "greeting" | "thinking";

type Props = {
  variant?: ArtieMascotVariant;
  size?: number;
  className?: string;
};

/**
 * Artie — the Artace Studio chat mascot, inlined (not <img>-referenced) so
 * individual instances can be driven independently by React state:
 * a bigger animated grin when Artie's intro bubble is showing, and a
 * "thinking" look (flatter mouth, wandering eyes, gentle pulse) while a
 * reply is streaming in. Geometry matches public/chat-bot-artace.svg.
 */
const ArtieMascot = ({ variant = "idle", size = 40, className }: Props) => {
  const uid = useId().replace(/[:]/g, "");
  const clipId = `artie-clip-${uid}`;
  const filter0 = `artie-f0-${uid}`;
  const filter1 = `artie-f1-${uid}`;
  const filter2 = `artie-f2-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 91 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      data-variant={variant}
      aria-hidden="true"
    >
      <style>{`
        .chatbot-eye {
          transform-box: fill-box;
          transform-origin: center;
          animation: chatbot-blink 4.5s ease-in-out infinite;
        }
        @keyframes chatbot-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          93% { transform: scaleY(0.05); }
          96% { transform: scaleY(1); }
        }
        @keyframes chatbot-look {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-1.4px); }
          75% { transform: translateX(1.4px); }
        }
        svg[data-variant="thinking"] .chatbot-eye {
          animation: chatbot-look 1.8s ease-in-out infinite;
        }
        svg[data-variant="thinking"] {
          animation: chatbot-think-pulse 1.6s ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes chatbot-think-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.035); }
        }
        .chatbot-mouth {
          d: path("M21 75 Q32 82 43 75");
          transition: d 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        svg[data-variant="greeting"] .chatbot-mouth {
          d: path("M17 73 Q32 93 47 73");
          animation: chatbot-grin-bounce 1.6s ease-in-out infinite;
        }
        @keyframes chatbot-grin-bounce {
          0%, 100% { d: path("M17 73 Q32 93 47 73"); }
          50% { d: path("M19 74 Q32 88 45 74"); }
        }
        svg[data-variant="thinking"] .chatbot-mouth {
          d: path("M24 78 Q32 76 40 79");
          animation: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .chatbot-eye,
          svg[data-variant="thinking"] .chatbot-eye,
          svg[data-variant="thinking"],
          svg[data-variant="greeting"] .chatbot-mouth {
            animation: none;
          }
          .chatbot-mouth {
            transition: none;
          }
        }
      `}</style>
      <g clipPath={`url(#${clipId})`}>
        <circle cx="40.5" cy="50.6981" r="40.5" fill="#D9D9D9" />
        <g filter={`url(#${filter0})`}>
          <circle cx="59.5" cy="80.6981" r="33.5" fill="#F8FF77" fillOpacity="0.5" />
        </g>
        <g filter={`url(#${filter1})`}>
          <ellipse cx="14" cy="48.1981" rx="42" ry="43" fill="#FF7777" fillOpacity="0.5" />
        </g>
        <g filter={`url(#${filter2})`}>
          <ellipse cx="72" cy="34.1981" rx="42" ry="43" fill="#FF77F1" fillOpacity="0.5" />
        </g>
        <g className="chatbot-eye">
          <path d="M27.9533 50.3232C28.0057 57.4578 23.7208 63.299 18.3819 63.369C13.043 63.4396 8.67246 57.7128 8.61962 50.5782C8.56726 43.4436 12.8522 37.6023 18.191 37.5324C23.5299 37.4618 27.901 43.1885 27.9533 50.3232Z" fill="white" />
          <path d="M18.2858 64.1981C12.6597 64.1981 8.0558 58.1202 8.00051 50.586C7.9736 46.9144 9.01828 43.4481 10.9418 40.8267C12.8652 38.2046 15.4385 36.7405 18.186 36.7039C18.2203 36.7032 18.255 36.7032 18.2888 36.7032C23.9144 36.7032 28.5183 42.7812 28.5741 50.3153C28.6015 53.9869 27.5564 57.4526 25.6329 60.0753C23.7094 62.6974 21.1361 64.1608 18.3886 64.1968C18.3539 64.1981 18.3196 64.1981 18.2858 64.1981ZM18.2898 38.3602C18.2589 38.3602 18.2286 38.3602 18.1978 38.3609C15.7816 38.3922 13.519 39.6804 11.8264 41.9867C10.1349 44.2923 9.21645 47.3401 9.23994 50.5697C9.26342 53.7986 10.2274 56.8222 11.9527 59.084C13.6785 61.3452 15.9827 62.6013 18.3759 62.5405C20.7921 62.5091 23.0547 61.2222 24.7472 58.916C26.4388 56.6103 27.3572 53.5619 27.3337 50.3323C27.3102 47.1034 26.3463 44.0798 24.6205 41.818C22.9172 39.5856 20.6722 38.3602 18.2898 38.3602Z" fill="#CDCFD0" />
          <path d="M25.5068 50.3559C25.5465 55.6838 22.3459 60.0459 18.3585 60.0989C14.3711 60.1512 11.1069 55.8747 11.0677 50.5461C11.0286 45.2176 14.2287 40.8561 18.2161 40.8031C22.203 40.7508 25.4672 45.0273 25.5068 50.3559Z" fill="#62493E" />
          <path d="M24.2706 50.3519C24.3034 54.7683 21.6504 58.3844 18.3451 58.4282C15.0403 58.4713 12.3344 54.9266 12.3021 50.5095C12.2693 46.0931 14.9223 42.4771 18.2271 42.434C21.5324 42.3901 24.2378 45.9356 24.2706 50.3519Z" fill="#312017" />
          <path d="M17.1273 46.5443C17.1331 47.3578 16.6448 48.0228 16.0366 48.0313C15.4279 48.0391 14.9298 47.3865 14.9239 46.5738C14.918 45.761 15.4063 45.0953 16.0146 45.0868C16.6233 45.079 17.1214 45.7315 17.1273 46.5443Z" fill="white" />
          <path d="M14.7403 50.1571C14.7442 50.6691 14.4369 51.0876 14.0538 51.0928C13.6706 51.098 13.3575 50.6874 13.3536 50.176C13.3496 49.664 13.6569 49.2455 14.0401 49.2403C14.4232 49.2351 14.7363 49.6457 14.7403 50.1571Z" fill="white" />
        </g>
        <g className="chatbot-eye">
          <path d="M55.3781 49.819C55.431 56.9537 51.1451 62.7942 45.8067 62.8648C40.4678 62.9348 36.0973 57.208 36.0444 50.0734C35.9916 42.9388 40.277 37.0982 45.6159 37.0276C50.9547 36.9576 55.3258 42.6844 55.3781 49.819Z" fill="white" />
          <path d="M45.7107 63.694C40.085 63.694 35.4811 57.616 35.4253 50.0819C35.3984 46.4103 36.4431 42.944 38.3666 40.3219C40.291 37.6998 42.8638 36.2357 45.6113 36.1997C51.2673 36.0834 55.9436 42.2313 55.9994 49.8112C56.0552 57.3911 51.4855 63.6188 45.8134 63.6933C45.7801 63.694 45.7449 63.694 45.7107 63.694ZM45.7146 37.8554C45.6842 37.8554 45.6539 37.8554 45.6235 37.8561C43.2068 37.8874 40.9443 39.1756 39.2517 41.4812C37.5602 43.7869 36.6417 46.836 36.6652 50.0649C36.6887 53.2938 37.6527 56.3174 39.3785 58.5792C41.1033 60.8397 43.358 62.0638 45.8017 62.0357C50.7892 61.9703 54.8079 56.4926 54.76 49.8269C54.7106 43.2016 50.661 37.8554 45.7146 37.8554Z" fill="#CDCFD0" />
          <path d="M52.9317 49.8511C52.9708 55.179 49.7707 59.5418 45.7833 59.5941C41.7959 59.6464 38.5322 55.3699 38.4926 50.0413C38.4529 44.7128 41.6535 40.3513 45.6404 40.2983C49.6283 40.246 52.8925 44.5231 52.9317 49.8511Z" fill="#62493E" />
          <path d="M51.6984 49.8478C51.7311 54.2642 49.0781 57.8802 45.7733 57.9234C42.4685 57.9672 39.7626 54.4218 39.7298 50.0054C39.6975 45.589 42.35 41.973 45.6554 41.9298C48.9597 41.886 51.6656 45.4307 51.6984 49.8478Z" fill="#312017" />
          <path d="M44.554 46.0402C44.5599 46.853 44.0715 47.5186 43.4633 47.5265C42.8546 47.535 42.3565 46.8824 42.3506 46.0689C42.3448 45.2555 42.8331 44.5905 43.4413 44.582C44.0495 44.5741 44.5481 45.2274 44.554 46.0402Z" fill="white" />
          <path d="M42.167 49.6529C42.1709 50.1649 41.8636 50.5834 41.4805 50.5886C41.0974 50.5939 40.7842 50.1826 40.7803 49.6712C40.7764 49.1592 41.0837 48.7407 41.4668 48.7355C41.8499 48.7303 42.1631 49.1416 42.167 49.6529Z" fill="white" />
        </g>
        <path className="chatbot-mouth" d="M21 75 Q32 82 43 75" stroke="#312017" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
      <path d="M23.4918 13.9059C23.4918 13.9059 17.927 16.3585 17.2132 17.3C17.3985 18.8007 46.967 53.2366 80.0615 56.6893C80.0615 56.6893 85.3553 56.7235 81.7581 47.8996C78.159 39.0783 23.4918 13.9059 23.4918 13.9059Z" fill="#881115" />
      <path d="M25.5447 18.1372C25.5447 18.1372 18.5317 8.73517 23.0706 3.5373C27.6077 -1.66117 52.5239 -0.455026 73.3531 14.3586C94.1817 29.1729 92.6143 55.5284 86.8376 58.7169C81.0616 61.9072 69.9818 53.8608 69.9818 53.8608C69.9818 53.8608 42.364 38.3971 25.5447 18.1372Z" fill="#EE2D35" />
      <path d="M23.0714 3.53721C26.1925 -0.0392715 38.9596 -0.584173 53.4055 4.24768C52.905 4.16139 52.4033 4.08014 51.9005 4.00768C50.1501 3.75522 48.3782 3.58271 46.6077 3.61719C45.1345 3.6459 43.6122 3.80636 42.2337 4.35702C41.0842 4.81622 40.0565 5.57746 39.4828 6.69659C38.7775 8.07214 38.8465 9.65209 39.1018 11.1324C39.5736 13.8663 40.6796 16.4596 42.084 18.8395C43.5917 21.3936 45.4503 23.7318 47.4562 25.9106C49.4939 28.1247 51.6977 30.181 53.9798 32.1397C56.0437 33.9119 58.1707 35.616 60.3364 37.262C62.0054 38.5299 63.688 39.7801 65.4216 40.9587C67.5174 42.3835 69.6834 43.7177 71.9572 44.8409C74.1197 45.9085 76.4171 46.825 78.812 47.1945C80.8644 47.5108 83.0283 47.3902 84.8813 46.3754C86.5879 45.4403 87.8172 43.8885 88.392 42.036C89.006 40.0582 88.9272 37.92 88.6159 35.896C88.5075 35.1904 88.3641 34.4909 88.1988 33.7961C92.4424 45.5116 90.4763 56.7088 86.8384 58.7168C81.0624 61.9071 69.9826 53.8607 69.9826 53.8607C69.9826 53.8607 42.3647 38.3976 25.5455 18.1371C25.5455 18.1371 18.5324 8.73508 23.0714 3.53721Z" fill="#EE2D35" />
      <path d="M76.2977 19.3355C76.2977 19.3355 81.2884 15.5275 86.2814 19.2254C86.2814 19.2254 86.5632 20.2876 87.827 20.0326C89.0915 19.7777 89.5432 16.9545 86.2213 13.872C82.8988 10.7921 74.7652 18.4272 74.7652 18.4272C74.7652 18.4272 73.9711 19.8723 76.2977 19.3355Z" fill="#B92027" />
      <defs>
        <filter id={filter0} x="-4.6" y="16.5981" width="128.2" height="128.2" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="15.3" result="effect1_foregroundBlur_3405_1441" />
        </filter>
        <filter id={filter1} x="-58.6" y="-25.4019" width="145.2" height="147.2" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="15.3" result="effect1_foregroundBlur_3405_1441" />
        </filter>
        <filter id={filter2} x="-0.6" y="-39.4019" width="145.2" height="147.2" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="15.3" result="effect1_foregroundBlur_3405_1441" />
        </filter>
        <clipPath id={clipId}>
          <rect y="10.1981" width="81" height="81" rx="40.5" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ArtieMascot;
