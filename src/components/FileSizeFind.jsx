import React, { useState, useRef, useEffect } from "react";

function FileSizeDisplay({ onFileChange }) {
  const [fileSize, setFileSize] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setFileSize(selectedFile.size);
      onFileChange(selectedFile); // Pass the File object
    } else {
      setFile(null);
      setFileSize(null);
      setPreviewUrl(null);
      onFileChange(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileSize(null);
    setPreviewUrl(null);
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the file input
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        ref={fileInputRef}
        accept="image/*" // Only allow image files
      />

      {previewUrl && (
        <div>
          <img
            src={previewUrl}
            alt="Preview"
            style={{ maxWidth: "100px", maxHeight: "100px" }}
          />
          <button type="button" onClick={handleRemoveFile}>
            Remove
          </button>
        </div>
      )}

      {fileSize !== null ? (
        <p>File size: {fileSize} bytes</p>
      ) : (
        <p>No file selected</p>
      )}
    </div>
  );
}

export default FileSizeDisplay;
