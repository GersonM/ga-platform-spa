import React, { useState, useEffect } from 'react';
import { Upload, DetailedError } from 'tus-js-client';
import CryptoJS from 'crypto-js';

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string>('');

  useEffect(() => {
    resumePreviousUpload();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result && typeof e.target.result === 'object') {
          const fileData = e.target.result as ArrayBuffer;
          const fileHash = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(fileData)).toString(CryptoJS.enc.Hex);
          setHash(fileHash);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const uploadFileChunks = (chunks: Blob[], endpoint: string, fileMetadata: any) => {
    const uploads = chunks.map((chunk, index) => {
      return new Upload(chunk, {
        endpoint,
        uploadSize: fileMetadata.uploadSize,
        headers: {
          'Upload-Offset': String(index * chunk.size),
          'Upload-Length': String(fileMetadata.uploadSize),
          'Upload-Metadata': `filename ${encodeURIComponent(fileMetadata.filename)}`,
        },
        onError: (error: Error | DetailedError) => {
          console.log(`Chunk ${index + 1} failed: ${error}`);
        },
        onProgress: (bytesUploaded: number, bytesTotal: number) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          console.log(`Chunk ${index + 1} uploaded: ${percentage}%`);
          saveUploadState(index, bytesUploaded);
        },
        onSuccess: () => {
          console.log(`Chunk ${index + 1} successfully uploaded.`);
          clearUploadState();
        },
      });
    });

    uploads.forEach((upload) => upload.start());
  };

  const handleUpload = () => {
    if (!file) return;

    const chunks = splitFileIntoChunks(file);
    const endpoint = 'http://127.0.0.1:8000/tus'; // Asegúrate de que este endpoint sea correcto

    uploadFileChunks(chunks, endpoint, {
      filename: file.name,
      uploadSize: file.size,
    });
  };

  const splitFileIntoChunks = (file: File): Blob[] => {
    const MAX_CHUNK_SIZE = 5 * 1024 * 1024; // Tamaño máximo por chunk (en este ejemplo, 5 MB)
    const chunks: Blob[] = [];
    let offset = 0;

    while (offset < file.size) {
      const chunkSize = Math.min(MAX_CHUNK_SIZE, file.size - offset);
      const chunk = file.slice(offset, offset + chunkSize);
      chunks.push(chunk);
      offset += chunkSize;
    }

    return chunks;
  };

  const saveUploadState = (index: number, bytesUploaded: number) => {
    const uploadState = {
      file,
      bytesUploaded,
      index,
    };

    localStorage.setItem('uploadState', JSON.stringify(uploadState));
  };

  const clearUploadState = () => {
    localStorage.removeItem('uploadState');
  };

  const resumePreviousUpload = () => {
    const uploadStateString = localStorage.getItem('uploadState');
    if (!uploadStateString) return;

    const uploadState = JSON.parse(uploadStateString);
    const { file: prevFile, bytesUploaded, index } = uploadState;

    try {
      const chunk = prevFile.slice(bytesUploaded, prevFile.size);
      const upload = new Upload(chunk, {
        endpoint: 'http://127.0.0.1:8000/tus', // Asegúrate de que este endpoint sea correcto
        uploadSize: prevFile.size,
        headers: {
          'Upload-Offset': String(bytesUploaded),
          'Upload-Length': String(prevFile.size),
          'Upload-Metadata': `filename ${encodeURIComponent(prevFile.name)}`,
        },
        onError: (error: Error | DetailedError) => {
          console.log(`Chunk ${index + 1} failed: ${error}`);
        },
        onProgress: (bytesUploaded: number, bytesTotal: number) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          console.log(`Chunk ${index + 1} uploaded: ${percentage}%`);
          saveUploadState(index, bytesUploaded);
        },
        onSuccess: () => {
          console.log(`Chunk ${index + 1} successfully uploaded.`);
          clearUploadState();
        },
      });

      upload.start();
    } catch (error) {
      console.error('Error resuming upload:', error);
    }
  };

  return (
          <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
          </div>
  );
};

export default FileUpload;
