import React, { useRef, useState } from "react";
import { FiUpload, FiFile, FiX } from "react-icons/fi";
import { formatFileSize } from "../../utils/helpers";

const FileUpload = ({
  label,
  accept,
  maxSize,
  multiple = false,
  onChange,
  error,
}) => {
  const [files, setFiles] = useState([]);
  const inputRef = useRef();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    onChange && onChange(selectedFiles);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange && onChange(newFiles);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all duration-200"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-sm text-gray-600 flex items-center justify-start ">
          Click to upload Image.{maxSize && `(Max ${formatFileSize(maxSize)})`}
          <FiUpload className="w-4 h-4 mx-auto text-gray-400 mb-1" />
        </p>

        {/* <p className="text-xs text-gray-500 mt-1">
          {accept || "Any file type"}{" "}
          {maxSize && `(Max ${formatFileSize(maxSize)})`}
        </p> */}
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FiFile className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="text-danger-600 hover:text-danger-700 p-1"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
    </div>
  );
};

export default FileUpload;
