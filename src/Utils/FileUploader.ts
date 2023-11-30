import axios, {AxiosProgressEvent} from 'axios';

let uploadPromises: any[] = [];

export const sendFileToServer = (file: any) => {
  let chunkSize = 5 * 1024 * 1024; // 5 MB chunk size
  let chunks: any[] = [];
  let fileSize = file.size;
  let start = 0;
  let end = chunkSize;

  while (start < fileSize) {
    chunks.push(file.slice(start, end));
    start = end;
    end = start + chunkSize;
  }

  chunks.forEach((chunk, index) => {
    let formData = new FormData();
    formData.append('chunk', chunk, `chunk-${index}`);

    const config = {
      onUploadProgress: (r: AxiosProgressEvent) => {
        //setLoadingInformation(r);
      },
      baseURL: import.meta.env.VITE_API_UPLOAD,
    };
    //axios.post('file-management/files', formData, config)

    let uploadPromise = axios.post('file-management/chunked-files', formData, config);
    uploadPromises.push(uploadPromise);
  });

  Promise.all(uploadPromises)
    .then(responses => {
      console.log('All chunks uploaded successfully!');
    })
    .catch(error => {
      console.error('Error uploading chunks:', error);
    });
};
