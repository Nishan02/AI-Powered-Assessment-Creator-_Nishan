type BrandLogoProps = {
  size?: number;
  className?: string;
};

const LOGO_URL =
  'https://pub-1407f82391df4ab1951418d04be76914.r2.dev/uploads/f90c4483-99d9-4993-8375-61a275974707.png';

export default function BrandLogo({ size = 28, className = '' }: BrandLogoProps) {
  return (
    <img
      src={LOGO_URL}
      width={size}
      height={size}
      alt="VedaAI logo"
      className={`rounded-[10px] object-cover ${className}`}
      loading="eager"
    />
  );
}
