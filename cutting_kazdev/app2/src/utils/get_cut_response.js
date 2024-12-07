export async function get_cut_response(sheet, parts, tool) {
    const url = 'http://localhost:3030/optimize'; // Замените на реальный URL сервера
    const typeCut = window.userSettings.typeCut;
    const tapeDepth = +window.userSettings.tapeDepth;

    var cutPieces = [];

    if (!parts) return;
    console.log('get_cut_response:', parts);
    parts.forEach(stack => {
        const part = stack.part;

        var w = Math.round(part.width);
        var h = Math.round(part.height);
        if (typeCut) {
            if (part.left_name) {
                w -= tapeDepth;
            }
            if (part.right_name) {
                w -= tapeDepth;
            }
            if (part.top_name) {
                h -= tapeDepth;
            }
            if (part.bottom_name) {
                h -= tapeDepth;
            }
        }

        w += part.left_thick_grinding ? part.left_thick_grinding : 0;
        h += part.top_thick_grinding ? part.top_thick_grinding : 0;


        stack.ids.forEach(id => {
            cutPieces.push({
                externalId: id,
                width: h,
                length: w,
                patternDirection: 'none',
                canRotate: part.allow_rotation ? true : false,
            });
        });
    })
    const requestBody = {
        method: 'guillotine',
        randomSeed: 1,
        cutWidth: tool,
        stockPieces: [
            {
                width: Math.round(sheet.height - (tool * 2)),
                length: Math.round(sheet.width - (tool * 2)),
                patternDirection: 'none',//ParallelToWidth
                price: 0
            }
        ],
        cutPieces: cutPieces
    };


    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
            timeout: 1000000,
        });

        if (response.ok) {
            const result = await response.json();
            console.log('result:', requestBody, result);
            return result
        } else {
            console.error('Error:', requestBody, sheet);
            alert('Error: ' + response.statusText)
        }
    } catch (error) {
        console.error('Error during fetch:', error);
    }
};