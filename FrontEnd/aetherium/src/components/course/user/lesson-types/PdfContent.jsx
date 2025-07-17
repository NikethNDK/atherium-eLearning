
const PdfContent = ({ content }) => {
  return (
    <div className="h-[70vh]">
      {content?.file_url ? (
        <iframe
          src={content.file_url}
          className="w-full h-full border rounded-lg"
          title="PDF Content"
        />
      ) : (
        <p>PDF content not available</p>
      )}
    </div>
  );
};

export default PdfContent;