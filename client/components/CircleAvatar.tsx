import Image from "next/image";

const CircleAvatar: React.FC<{
  size: number;
  imageUrl: string;
  alt: string | null;
}> = ({ size, imageUrl, alt }) => {
  return (
    <div>
      <Image
        height={size}
        width={size}
        alt={alt ?? "Circle Avatar"}
        src={imageUrl}
        objectFit="cover"
        className="rounded-full border-[2px] border-white object-contain"
      />
    </div>
  );
};

export default CircleAvatar;
