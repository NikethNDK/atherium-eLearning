const TextContent = ({ content }) => {
  return (
    <div className="prose max-w-none">
      {content?.text_content || "No text content available."}
    </div>
  );
};

export default TextContent;