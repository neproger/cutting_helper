import React, { useState } from 'react';

const CutMapSVG = ({ cut_result }) => {
    const [parts, setParts] = useState(cut_result.result);

    if (!cut_result) {
        return null;
    }

    const handleDragStart = (e, part) => {
        console.log('handleDragStart', part);
        e.stopPropagation(); // Предотвращает распространение события
        e.dataTransfer.setData('draggedPart', JSON.stringify(part));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e, material) => {
        e.stopPropagation(); // Предотвращает распространение события
        e.preventDefault();
        const draggedPart = JSON.parse(e.dataTransfer.getData('draggedPart'));

        const updatedParts = parts.map((part) => {
            if (part.id === draggedPart.id) {
                return {
                    ...part,
                    x: material.x + (e.clientX - material.x),
                    y: material.y + (e.clientY - material.y)
                };
            }
            return part;
        });

        setParts(updatedParts);
    };

    const SVGpart = ({ part }) => {
        // console.log('part', part);
        const p = 15;
        const fontSize = 40;
        const CENTER_TEXT = part.index;
        const left_grinding = part.top_thick_grinding ? part.top_thick_grinding : 0;
        const top_grinding = part.left_thick_grinding ? part.left_thick_grinding : 0;
        const height = part.width - top_grinding;
        const width = part.height - left_grinding;


        let grinding = "";

        if (left_grinding || top_grinding) {
            grinding = width + "мм x " + height + "мм";
        }

        const BOTTOM_LEFT_TEXT = `${grinding} # ${part.description || "Нет описания"}`;
        if (width < 1 || height < 1 || !part) {
            return null;
        }

        if (part.type === 'materials') {
            return (
                <g
                    draggable="true"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, part)}
                    transform={`translate(${part.y}, ${part.x})`}
                >
                    <rect
                        code={part.code}
                        x={0}
                        y={0}
                        width={width}
                        height={height}
                        fill={"grey"}
                        stroke="none"
                    />
                    <text
                        className="TOP_LEFT_TEXT"
                        x={width > 110 ? p * 1.4 : width / 2}
                        y={height > 110 ? p * 1.4 : height / 2}
                        textAnchor={width > 110 ? "start" : "middle"}
                        alignmentBaseline={height > 110 ? "before-edge" : "middle"}
                        fontSize={`${fontSize * 0.5}`}
                        fill={"white"}
                        fontWeight="light"
                    >
                        {width}
                    </text>
                    <text
                        className="BOTTOM_RIGHT_TEXT"
                        x={width > 110 ? width - p * 1.2 : width / 2 + p / 3}
                        y={height > 110 ? height - p * 1.2 : height / 2}
                        textAnchor={height > 110 ? "start" : "middle"}
                        alignmentBaseline={width > 110 ? "after-edge" : "middle"}
                        fontSize={`${fontSize * 0.5}`}
                        fill={"white"}
                        transform={`rotate(-90, ${width > 110 ? width - p * 1.2 : width / 2 + p / 3},${height > 110 ? height - p * 1.2 : height / 2})`}
                    >
                        {height}
                    </text>
                </g>
            );
        }
        const lineOptions = (value) => {
            return {
                stroke: "black",
                strokeWidth: "4",
                display: value ? 'block' : 'none',
            }
        };
        return (
            <g
                draggable={true}
                onDragStart={(e) => handleDragStart(e, part)}
                transform={`translate(${part.y + left_grinding / 2}, ${part.x + top_grinding / 2})`}
            >
                <rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    id={`part#${part.id}`}
                    part_id={part.id}
                    className="BLOCK cursor-pointer"
                    layer_id={part.layer_id}
                    fill={"lightgrey"}
                    stroke="black"
                    strokeWidth={4}
                />
                <line
                    x1={p}
                    y1={p}
                    x2={width - p}
                    y2={p}
                    {...lineOptions(part.top_name)}
                />
                <line
                    x1={p}
                    y1={height - p}
                    x2={width - p}
                    y2={height - p}
                    {...lineOptions(part.bottom_name)}
                />
                <line
                    x1={p}
                    y1={p}
                    x2={p}
                    y2={height - p}
                    {...lineOptions(part.left_name)}
                />
                <line
                    x1={width - p}
                    y1={p}
                    x2={width - p}
                    y2={height - p}
                    {...lineOptions(part.right_name)}
                />
                <text
                    className="CENTER_TEXT"
                    x={width / 2}
                    y={height / 2}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize={fontSize}
                    fontWeight="bold"
                    fill="black"
                    opacity="0.4"
                    transform={part.cut_rotated ? (`rotate(90, ${width / 2}, ${height / 2})`) : ""}
                >
                    {CENTER_TEXT}
                </text>
                <text
                    className="TOP_LEFT_TEXT"
                    x={width > 140 ? p * 1.4 : width / 2}
                    y={height > 140 ? p * 1.4 : height / 2}
                    textAnchor={width > 140 ? "start" : "middle"}
                    alignmentBaseline={height > 140 ? "before-edge" : "middle"}
                    fontSize={fontSize * 1.2}
                    fontWeight="bold"
                    fill={part.type === 'parts' ? "black" : "lightgrey"}
                >
                    {width + left_grinding}
                </text>
                <text
                    className="BOTTOM_RIGHT_TEXT"
                    x={width > 140 ? width - p * 1.2 : width / 2 + p / 3}
                    y={height > 140 ? height - p * 1.2 : height / 2}
                    textAnchor={height > 140 ? "start" : "middle"}
                    alignmentBaseline={width > 140 ? "after-edge" : "middle"}
                    fontSize={fontSize * 1.2}
                    fontWeight="bold"
                    fill={part.type === 'parts' ? "black" : "lightgrey"}
                    transform={`rotate(-90, ${width > 140 ? width - p * 1.2 : width / 2 + p / 3},${height > 140 ? height - p * 1.2 : height / 2})`}
                >
                    {height + top_grinding}
                </text>
                <defs>
                    <clipPath id={`BOTTOM_LEFT_TEXT${part.id}`}>
                        <rect
                            x={p * 1.4}
                            y={height - p - fontSize * 1.4}
                            width={width - fontSize - p * 4}
                            height={fontSize * 1.5}
                        />
                    </clipPath>
                </defs>
                <text
                    clipPath={`url(#BOTTOM_LEFT_TEXT${part.id})`}
                    className="BOTTOM_LEFT_TEXT"
                    x={p * 1.4}
                    y={height - p}
                    textAnchor="start"
                    alignmentBaseline="after-edge"
                    fontSize={fontSize * 1.2}
                    fill="black"
                >
                    {width > 100 && height > 100 ? BOTTOM_LEFT_TEXT : ""}
                </text>
            </g>
        );
    }

    return (
        <svg className={cut_result.sheet.code} width="100%" height="100%" viewBox={`0 0 ${cut_result.sheet.height} ${cut_result.sheet.width}`} xmlns="http://www.w3.org/2000/svg">
            <g>
                <rect
                    className="ROOT_NODE"
                    x={0}
                    y={0}
                    width={cut_result.sheet.height}
                    height={cut_result.sheet.width}
                    fill={"none"}
                    stroke={"black"}
                    strokeWidth={4}
                />
            </g>
            {parts.map((part, partIndex) => {
                if (part.type === 'parts') {
                    return <>
                        <rect
                            transform={`translate(${part.y}, ${part.x})`}
                            x={0}
                            y={0}
                            width={part.height}
                            height={part.width}
                            fill={"none"}
                            stroke="black"
                            strokeWidth={4}
                        />
                        <SVGpart key={partIndex} part={part} />
                    </>
                }
                return <SVGpart key={partIndex} part={part} />
            })}
        </svg>
    );
};

export default CutMapSVG;
