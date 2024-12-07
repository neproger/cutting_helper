import drawBlockJSX from './drawBlockJSX'
import React from 'react'

export default function generateSvgMap(stockPiece, parts, tool, material) {

    const hs = material.height;
    const ws = material.width;

    const typeCut = window.userSettings.typeCut;
    const tapeDepth = +window.userSettings.tapeDepth;

    var pieses = [];
    const arr = stockPiece.cutPieces ? stockPiece.cutPieces : stockPiece
    arr.forEach(detail => {
        const id = detail.externalId ? detail.externalId : detail.item.name
        const index = parts.findIndex(part => part.ids.includes(id));
        const part = {...parts[index].part};

        var w = part.width + (part.left_thick_grinding ? part.left_thick_grinding : 0);
        var h = part.height + (part.top_thick_grinding ? part.top_thick_grinding : 0);
        
        if (typeCut) {
            if (part.left_name) {
                h -= tapeDepth;
            }
            if (part.right_name) {
                h -= tapeDepth;
            }
            if (part.top_name) {
                w -= tapeDepth;
            }
            if (part.bottom_name) {
                w -= tapeDepth;
            }
        }

        var rotated = false;
        console.log('generateSvgMap ', part)
        if ((detail.width !== w) && (detail.height !== h)) {
            console.log('rotated ', detail.width, w);
            [part.top_name, part.bottom_name, part.left_name, part.right_name] = [ part.left_name, part.right_name, part.bottom_name, part.top_name]
            rotated = true;
        }
        // console.log('part ', part)

        var w = detail.width;
        var h = detail.length ? detail.length : detail.height;
        const block = {
            ...part,
            cut_index: index,
            id: id,
            r: rotated,
            x: detail.y + tool,
            y: detail.x + tool,
            w: h,
            h: w,
        };
        pieses.push(block);
    });

    /*<defs>
        <symbol id="icon_rotate" viewBox="0 0 24 24">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.00003 12C6.00003 8.67198 8.64024 6 11.8655 6C14.03 6 15.9294 7.20124 16.9464 9L15 9L15 10.5L19.5 10.5L19.5 6L18 6L18 7.84807C16.6827 5.83414 14.4311 4.5 11.8655 4.5C7.78348 4.5 4.50003 7.87217 4.50003 12L6.00003 12Z"></path>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M18 12C18 15.328 15.3598 18 12.1346 18C9.97007 18 8.0706 16.7988 7.05359 15L9.00003 15L9.00003 13.5L4.50003 13.5L4.50003 18L6.00003 18L6.00003 16.1519C7.31734 18.1659 9.56889 19.5 12.1346 19.5C16.2165 19.5 19.5 16.1278 19.5 12L18 12Z"></path>
        </symbol>
    </defs> */

    const svg = (
        <svg
            version="1.1"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`${- tool} ${- tool} ${hs + tool * 2} ${ws + tool * 2}`}
        >
            <rect className={stockPiece.cutPieces ? "ROOT_NODE" : "ROOT_NODE PACKER"} x={0} y={0} width={hs} height={ws} fill="none" stroke="black" strokeWidth={2}></rect>
            {pieses.map((part) => drawBlockJSX(part))}
        </svg>
    );

    return svg;
}

