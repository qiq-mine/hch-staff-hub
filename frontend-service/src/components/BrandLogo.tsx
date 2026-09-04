import { cn } from '@/lib/utils';
import logoMark from '../assets/LOGO.svg';

export type BrandLogoProps = {
  /** Hide the "OpenBMB / StaffDeck" wordmark and only render the logo mark. */
  markOnly?: boolean;
  /** Size of the square logo mark in pixels. */
  markSize?: number;
  className?: string;
  /** Extra classes applied to the wordmark wrapper (e.g. to hide it responsively). */
  wordmarkClassName?: string;
};

/** Brand logo lockup (logo mark + "TeamerHub" wordmark). */
export default function BrandLogo({
  markOnly = false,
  markSize = 28,
  className,
  wordmarkClassName,
}: BrandLogoProps) {
  return (
    <span className={cn('flex items-center gap-[8px] overflow-hidden p-[4px]', className)}>
      <img
        src={logoMark}
        alt="TeamerHub"
        className="shrink-0"
        style={{ width: markSize, height: markSize }}
      />
      {!markOnly && (
        <span className={cn('flex flex-col items-center gap-[2px] leading-none', wordmarkClassName)}>
          <strong className="text-[17px] font-semibold leading-none text-[#18181a]">
            TeamerHub
          </strong>
        </span>
      )}
    </span>
  );
}
