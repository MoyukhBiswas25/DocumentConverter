import React, { useState } from 'react';
import axios from 'axios';

interface FileMetadata {
  fileName: string;
  fileSize: number;
  uploadDate: string;
}

const DocumentConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [password, setPassword] = useState<string>('');
  const [convertedPdfUrl, setConvertedPdfUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('password', password);

    try {
      const response = await axios.post('http://localhost:8080/api/convert', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      });

      const metadata = response.headers['x-file-metadata'];
      if (metadata) {
        setFileMetadata(JSON.parse(metadata));
      }

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setConvertedPdfUrl(pdfUrl);
    } catch (error) {
      console.error('Conversion failed', error);
      alert('Document conversion failed');
    }
  };

  const handleDownload = () => {
    if (convertedPdfUrl) {
      const link = document.createElement('a');
      link.href = convertedPdfUrl;
      link.download = `${selectedFile?.name.replace('.docx', '')}.pdf`;
      link.click();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Document Converter</h1>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Upload a File</label>
        <input
          type="file"
          accept=".docx"
          onChange={handleFileChange}
          className="file-input file-input-bordered w-full max-w-full px-4 py-2 text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Optional PDF Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input input-bordered w-full px-4 py-2 text-sm"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={!selectedFile}
        className="btn btn-primary w-full py-2 text-lg mt-2"
      >
        Convert Document
      </button>

      {fileMetadata && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-bold text-blue-600 mb-2">File Metadata</h2>
          <p className="text-sm text-gray-700"><strong>File Name:</strong> {fileMetadata.fileName}</p>
          <p className="text-sm text-gray-700"><strong>File Size:</strong> {(fileMetadata.fileSize / 1024).toFixed(2)} KB</p>
          <p className="text-sm text-gray-700"><strong>Upload Date:</strong> {new Date(fileMetadata.uploadDate).toLocaleString()}</p>
        </div>
      )}

      {convertedPdfUrl && (
        <div className="mt-6">
          <button onClick={handleDownload} className="btn btn-secondary w-full py-2 mb-4 text-lg">
            Download PDF
          </button>
          <iframe src={convertedPdfUrl} className="w-full h-80 border rounded-md" />
        </div>
      )}
    </div>
  );
};

export default DocumentConverter;
