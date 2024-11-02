const SystemMessage = ({ message }: { message: string }) => {
  return (
    <div className="self-center">
      <p className="text-xs">{message}</p>
    </div>
  );
};

export default SystemMessage;
