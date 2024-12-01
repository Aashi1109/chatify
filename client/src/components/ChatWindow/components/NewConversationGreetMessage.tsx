const NewConversationGreetMessage = ({ name }: { name: string }) => {
  return (
    <div className="text-wrap">
      This is the start of conversation between you and{" "}
      <span className="dark:text-blue-300 font-semibold">{name}</span>. Say
      hello 👋 to get started.
    </div>
  );
};

export default NewConversationGreetMessage;
