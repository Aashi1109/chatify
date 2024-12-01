const SystemMessage = ({ message }: { message: string }) => {
  return (
    <div className="self-center sticky top-0 bg-gray-100 dark:bg-gray-700  rounded-md px-2 py-1">
      <p className="text-xs text-center">{message}</p>
    </div>
  );
};

export default SystemMessage;
