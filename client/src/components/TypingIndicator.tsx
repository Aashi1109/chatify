const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-gray-200 dark:bg-gray-700 w-fit">
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-400 animate-[bounce_1s_infinite_100ms]"></span>
        <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-400 animate-[bounce_1s_infinite_200ms]"></span>
        <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-400 animate-[bounce_1s_infinite_300ms]"></span>
      </div>
    </div>
  );
};

export default TypingIndicator;
