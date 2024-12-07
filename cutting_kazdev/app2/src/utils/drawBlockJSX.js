import React from 'react'

export default function drawBlockJSX(block) {
    const textX = block.x + block.w / 2; // x-координата середины прямоугольника
    const textY = block.y + block.h / 2; // y-координата середины прямоугольника

    const typeCut = window.userSettings.typeCut;
    const tapeDepth = +window.userSettings.tapeDepth;

    var w = block.width;
    var h = block.height;
    if (typeCut) {
        if (block.left_name) {
            w -= tapeDepth;
        }
        if (block.right_name) {
            w -= tapeDepth;
        }
        if (block.top_name) {
            h -= tapeDepth;
        }
        if (block.bottom_name) {
            h -= tapeDepth;
        }
    }
    const p = 14;
    const offset = 8;

    const top = block.top_name;
    const right = block.right_name;
    const bottom = block.bottom_name;
    const left = block.left_name;

    const left_griding = block.left_thick_grinding;
    const top_griding = block.top_thick_grinding;

    let grinding = "";

    if (left_griding || top_griding) {
        grinding = h + "мм x " + w + "мм";
    }

    const BOTTOM_LEFT_TEXT = `${grinding} #${block.discription || "..."}`;
    const CENTER_TEXT = block.cut_index + 1
    const layer_id = block.layer_id;

    const rotated = block.r || false;
    const slice = ((block.w - 90) / 13).toFixed(0)
    const tSlice = ((block.w - 130) / 13).toFixed(0)

    const fontSize = 60;
    return (
        <g >
            <rect
                part_id={block.id}
                layer_id={layer_id}
                rotated_block={rotated ? 1 : 0}
                className="BLOCK cursor-pointer"
                x={block.x}
                y={block.y}
                width={block.w}
                height={block.h}
                fill='#fff'
                stroke="black"
                strokeWidth="1"
            />
            {top ? (
                <line
                    x1={block.x + p}
                    y1={block.y + p}
                    x2={block.x + block.w - p}
                    y2={block.y + p}
                    stroke="black"
                    strokeWidth="4"
                />
            ) : <></>}
            {bottom ? (
                <line
                    x1={block.x + p}
                    y1={block.y + block.h - p}
                    x2={block.x + block.w - p}
                    y2={block.y + block.h - p}
                    stroke="black"
                    strokeWidth="4"
                />
            ) : <></>}
            {left ? (
                <line
                    x1={block.x + p}
                    y1={block.y + p}
                    x2={block.x + p}
                    y2={block.y + block.h - p}
                    stroke="black"
                    strokeWidth="4"
                />
            ) : <></>}
            {right ? (
                <line
                    x1={block.x + block.w - p}
                    y1={block.y + p}
                    x2={block.x + block.w - p}
                    y2={block.y + block.h - p}
                    stroke="black"
                    strokeWidth="4"
                />
            ) : <></>}

            <text
                className="CENTER_TEXT"
                x={textX}
                y={textY}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize={fontSize + offset}
                fontWeight="bold"
                fill="black"
                opacity="0.4"
                transform={block.r ? (`rotate(90, ${textX}, ${textY})`) : ""}
            >
                {CENTER_TEXT}
            </text>

            <defs>
                <clipPath id={`BOTTOM_LEFT_TEXT${block.id}`}>
                    <rect
                        x={block.x + p + offset}
                        y={block.y + block.h - p - fontSize}
                        width={block.w - fontSize - p * 2 - offset }
                        height={fontSize}
                    />
                </clipPath>
            </defs>
            <text
                clipPath={`url(#BOTTOM_LEFT_TEXT${block.id})`}
                className="BOTTOM_LEFT_TEXT"
                x={block.x + p + offset}
                y={block.y + block.h - p}
                textAnchor="start"
                alignmentBaseline="after-edge"
                fontSize={fontSize - offset}
                fill="black"
            >
                {block.w > 200 && block.h > 200 ? BOTTOM_LEFT_TEXT : ""}
            </text>

            <text
                className="TOP_LEFT_TEXT"
                x={block.w > 110 ? block.x + p + offset : block.w / 2 + block.x}
                y={block.h > 110 ? block.y + p : block.y + block.h / 2}
                textAnchor={block.w > 110 ? "start" : "middle"}
                alignmentBaseline={block.h > 110 ? "before-edge" : "middle"}
                fontSize={block.w > 110 && block.h > 110 ? fontSize : fontSize * 0.8}
                fontWeight="bold"
                fill="black"
            >
                {block.w}
            </text>
            <text
                className="BOTTOM_RIGHT_TEXT"
                x={block.w > 110 ? block.x + block.w - p : block.x + block.w / 2 + p / 3}
                y={block.h > 110 ? block.y + block.h - p - offset : block.y + block.h / 2}
                textAnchor={block.h > 110 ? "start" : "middle"}
                alignmentBaseline={block.w > 110 ? "after-edge" : "middle"}
                fontSize={block.w > 110 && block.h > 110 ? fontSize : fontSize * 0.8}
                fontWeight="bold"
                fill="black"
                transform={`rotate(-90, ${block.w > 110 ? block.x + block.w - p : block.x + block.w / 2 + p / 3
                    },${block.h > 110 ? block.y + block.h - p - offset : block.y + block.h / 2})`}
            >
                {block.h}
            </text>

            <defs>
                <clipPath id={`TOP_RIGHT_TEXT${block.id}`}>
                    <rect
                        x={block.x + p + offset}
                        y={block.y + p + offset + fontSize}
                        width={block.w - fontSize  - p  - offset}
                        height={fontSize}
                    />
                </clipPath>
            </defs>
            <text
                clipPath={`url(#TOP_RIGHT_TEXT${block.id})`}
                className="TOP_RIGHT_TEXT"
                x={block.x + p + offset}
                y={block.y + p + offset + fontSize}
                textAnchor="start"
                alignmentBaseline="before-edge"
                fontSize={fontSize - offset}
                fill="black"
            >
                {block.w > 200 && block.h > 200 ? block.label : ""}
            </text>
        </g>
    );

}