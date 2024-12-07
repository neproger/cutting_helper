import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server';
import pdfMake from "pdfmake";
import pdfFonts from "./vfs_fonts";
import { getDate } from "./getDate"
import CutMapSVG from '../components/cutting/CutMapSVG';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export function makePdf(maps, parts) {
    const typeCut = window.userSettings.typeCut;
    const tapeDepth = window.userSettings.tapeDepth;

    const file = window.fileInfo.file_name.split(/\./);
    const file_name = file[0];
    const file_path = window.fileInfo.file_path;
    const date = getDate();

    let content = [];
    let tape_count = 0;

    if (!parts || parts < 1) return;

    const rowHeader = [
        { text: "#", style: 'header', },
        { text: "Длинна", style: 'header' },
        { text: "x+", style: 'header' },
        { text: "Ширина", style: 'header' },
        { text: "y+", style: 'header' },
        { text: "Кол", style: 'header' },
        { text: "Слой", style: 'header' },
        { text: "Описание", style: 'header' }
    ];
    var pdfData = new Array();
    pdfData.push(rowHeader);
    var part_count = 0
    parts.forEach((part, index) => {
        part_count += part.ids.length
        const obj = part.part
        if (obj.type !== "parts") return;

        if (obj.top_name) tape_count += (obj.height + 100) * part.ids.length;
        if (obj.bottom_name) tape_count += (obj.height + 100) * part.ids.length;
        if (obj.left_name) tape_count += (obj.width + 100) * part.ids.length;
        if (obj.right_name) tape_count += (obj.width + 100) * part.ids.length;

        let height = obj.height;
        let width = obj.width;

        if (typeCut) {

            if (obj.left_name) {
                height -= tapeDepth;
            }
            if (obj.right_name) {
                height -= tapeDepth;
            }
            if (obj.top_name) {
                width -= tapeDepth;
            }
            if (obj.bottom_name) {
                width -= tapeDepth;
            }
            console.log('makePdf ', typeCut, tapeDepth, height)
        }
        let top_thick_grinding = obj.top_thick_grinding || 0;
        let left_thick_grinding = obj.left_thick_grinding || 0;

        let grinding = false;
        if (obj.top_thick_grinding > 0) {
            grinding = true;
        }

        if (obj.left_thick_grinding > 0) {
            grinding = true;
        }

        const w = 32;
        const h = 17;

        const svgheight = (
            <svg width={w} height={h} xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="0"
                    alignment-baseline="before-edge"
                    font-size="10"
                    font-weight="bold"
                    fill="black"
                >
                    {height + top_thick_grinding}
                </text>
                {obj.top_name &&
                    <line
                        x1={1}
                        y1={h - 3}
                        x2={w - 1}
                        y2={h - 3}
                        stroke="black"
                        stroke-width="1"
                    />}

                {obj.bottom_name &&
                    <line
                        x1={1}
                        y1={h - 1}
                        x2={w - 1}
                        y2={h - 1}
                        stroke="black"
                        stroke-width="1"
                    />}
            </svg>
        );

        const svgWidth = (
            <svg width={w} height={h} xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="0"
                    alignment-baseline="before-edge"
                    font-size="10"
                    font-weight="bold"
                    fill="black"
                >
                    {width + left_thick_grinding}
                </text>
                {obj.left_name ?
                    <line
                        x1={1}
                        y1={h - 3}
                        x2={w - 1}
                        y2={h - 3}
                        stroke="black"
                        stroke-width="1"
                    />
                    : ""}
                {obj.right_name ?
                    <line
                        x1={1}
                        y1={h - 1}
                        x2={w - 1}
                        y2={h - 1}
                        stroke="black"
                        stroke-width="1"
                    />
                    : ""}
            </svg>
        );

        let discription = obj.discription ? obj.discription : "...";
        if (grinding) {
            discription = height + " x " + width + " | " + discription
        }
        const rowData = [ // [16, 32, 16, 32, 16, 16, 182, 150],
            svg_text(index + 1, 15, h),
            {
                svg: renderToStaticMarkup(svgheight)
            },
            svg_text(top_thick_grinding ? top_thick_grinding : "-", 15, h),
            {
                svg: renderToStaticMarkup(svgWidth)
            },
            svg_text(left_thick_grinding ? left_thick_grinding : "-", 15, h),
            svg_text(part.ids.length, 15, h),
            svg_text(obj.label, 180, h),
            svg_text(discription, 148, h)
        ];

        pdfData.push(rowData);
    });

    const tapeMeters = ((tape_count + 500) / 1000).toFixed(1);
    content = [
        {
            text: `${maps[0].name} | ${maps[0].width} x ${maps[0].height} | деталей: ${part_count} | ${tapeMeters}м кромки`,
            fontSize: 12,
            margin: [0, 0, 0, 4],
        },
        {
            table: {
                headerRows: 1,
                widths: [16, 32, 16, 32, 16, 16, 182, 150],
                body: pdfData,
                fontSize: 8,
                pageBreak: 'after',
            },
        },
    ];

    let count = 0;

    maps.forEach((map, index) => {
        const svg = <CutMapSVG cut_result={{ result: map.result, sheet: map }} />
        const svg_map = renderToStaticMarkup(svg);
        const material_name = map.name;
        const material_height = map.height;
        const material_width = map.width;
        const material_code = map.code;
        const block_count = map.partsCount;
        const percentage = map.percentage

        let before = ''
        if (count === 0) {
            before = 'before';
            count += 1
        } else {
            before = '';
            count = 0
        };
        content.push(
            [
                {
                    text: `${index + 1}# ${material_name} | ${material_height}x${material_width} | код: ${material_code} | деталей: ${block_count} | ${percentage}%`,
                    fontSize: 10,
                    margin: [0, 0, 0, 4],
                    pageBreak: before,
                    alignment: "left",
                },
                {
                    svg: svg_map,
                    width: 535,
                    height: 350,
                    margin: [0, 0, 0, 10],
                    alignment: "left",
                },


            ]
        );
    });

    var docDefinition = {
        info: {
            title: `PDF отчет - ${file_name}`,
            author: "ANTwood",
            subject: "astana_woodwork",
        },
        pageSize: "A4",
        pageOrientation: "portrait",
        pageMargins: [30, 30, 30, 30],
        header: [
            {
                text: file_path + " | дата: " + date,
                fontSize: 8,
                alignment: "left",
                margin: [20, 10, 20, 0],
            },
        ],
        footer: function (currentPage, pageCount) {
            return {
                text: "Страница " + currentPage + " из " + pageCount,
                fontSize: 8,
                alignment: "right",
                margin: [10, 10, 20, 0],
            };
        },

        content: content,

        styles: {
            header: {
                bold: true,
                fontSize: 8,
            },
            id: {
                fontSize: 8,
            },
            tableHeader: {
                bold: true,
            },
        },
        defaultStyle: {
            fontSize: 10,
        },
    };

    pdfMake.fonts = {
        Roboto: {
            normal: "Roboto-Regular.ttf",
            bold: "Roboto-Medium.ttf",
            italics: "Roboto-Italic.ttf",
            bolditalics: "Roboto-MediumItalic.ttf",
        },
        Symbol: {
            normal: "Symbol",
        },
        ZapfDingbats: {
            normal: "ZapfDingbats",
        },
    };
    console.log('docDefinition', docDefinition)
    pdfMake.createPdf(docDefinition).download(`${file_name}_${maps[0].code}_${date}.pdf`);
}

const svg_text = (text, w, h, size) => {
    const svg = (
        <svg width={w} height={h} xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="0" alignment-baseline="before-edge" font-size={size ? size : 8} fill="black">
                {text}
            </text>
        </svg>
    );
    const svgString = renderToStaticMarkup(svg);
    return {
        svg: svgString,
    };
}