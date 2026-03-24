import Image from "next/image";

interface ImageWithGrainProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export default function ImageWithGrain({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  priority = false,
  sizes,
}: ImageWithGrainProps) {
  return (
    <div className="relative overflow-hidden grain-overlay">
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-cover ${className}`}
          priority={priority}
          sizes={sizes || "100vw"}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`object-cover ${className}`}
          priority={priority}
          sizes={sizes}
        />
      )}
    </div>
  );
}
