const CircleAvatar: React.FC<{
  size: number;
  imageUrl: string;
  alt: string | null;
}> = ({ size, imageUrl, alt }) => {
  return (
    <div className="flex-1">
      <img
        height={size}
        width={size}
        alt={alt ?? "Circle Avatar"}
        src={imageUrl}
        className="rounded-full border-[2px] border-white object-contain"
      />
    </div>
  );
};

export default CircleAvatar;
