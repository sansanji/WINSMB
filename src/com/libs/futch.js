const futch = (url, opts = {}, onProgress) => {
  console.log(url, opts);
  return new Promise((res, rej) => {
    const xhr = new XMLHttpRequest();
    xhr.open(opts.method || 'get', url);
    xhr.responseType = 'blob';
    for (const k in opts.headers || {}) xhr.setRequestHeader(k, opts.headers[k]);
    xhr.onload = e => res(e.target);
    xhr.onerror = rej;
    if (xhr.upload && onProgress) xhr.upload.onprogress = onProgress; // event.loaded / event.total * 100 ; //event.lengthComputable
    xhr.send(opts.body);
  });
};
export default futch;
