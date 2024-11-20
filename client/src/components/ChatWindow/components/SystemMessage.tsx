const SystemMessage = ({ message }: { message: string }) => {
  return (
    <div className="self-center sticky top-0">
      <p className="text-xs">{message}</p>
    </div>
  );
};

export default SystemMessage;
