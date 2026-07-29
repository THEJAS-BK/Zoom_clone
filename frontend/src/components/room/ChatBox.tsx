type ChatBoxProp={
    message:string,
    name:string,
    isOwn:boolean
}
export default function ChatBox({ message, name, isOwn }: ChatBoxProp) {
  return (
    <div className={`flex flex-col max-w-[75%] ${isOwn ? "self-end items-end" : "self-start items-start"}`}>
      {!isOwn && (
        <span className="text-xs text-gray-400 px-1 mb-1">{name}</span>
      )}
      <div
        className={`px-3.5 py-2 text-sm leading-snug break-words ${
          isOwn
            ? "bg-blue-500 text-white rounded-2xl rounded-br-md"
            : "bg-zinc-700 text-white rounded-2xl rounded-bl-md"
        }`}
      >

        {message}
      </div>
    </div>
  );
}