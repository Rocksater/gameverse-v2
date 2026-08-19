/**
 * Compresses raw client image files to WebP format via HTML5 Canvas.
 * Reduces avatar payloads from ~3MB to <100KB before Storage upload.
 */
export const compressToWebP = (file, quality = 0.8) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas image compression failed'));
            return;
          }
          const compressedFile = new File(
            [blob],
            `${file.name.split('.')[0]}.webp`,
            { type: 'image/webp' }
          );
          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };
    img.onerror = (err) => reject(err);
  });