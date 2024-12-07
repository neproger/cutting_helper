
import { renderToStaticMarkup } from 'react-dom/server';



export function makeBitmap(part) {
    return new Promise((resolve, reject) => {
        const svgXML = renderToStaticMarkup(part.svg);
        const blob = new Blob([svgXML], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        const image = new Image();
        image.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = part.width;
            canvas.height = part.height;
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);

            const canvasDataUrl = canvas.toDataURL('image/png');
            resolve(canvasDataUrl);

            URL.revokeObjectURL(url);
        };

        image.onerror = function (error) {
            reject(new Error('Ошибка загрузки изображения: ' + error.context));
        };

        image.src = url;
    });
}
