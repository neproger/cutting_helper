import React, { useState } from 'react';
import { CgSpinner } from "react-icons/cg";
import { makePdf } from '../../utils/makePdf';
import { makeCAD } from '../../utils/makeCAD';
import { prepareParts, placePartsOnSheets, prepareSheet, makeCutTapeII, makeCutTape, sheetsMaker } from '../../utils/dev_packer';
import CutMapSVG from './CutMapSVG';
import { select_entity, save_material } from '../../utils/sketchup_api';
import { getWord } from '../../utils/getWord';

export default function CuttingBlock({ material, parts, layers }) {
    const [cutMaps, setCutMaps] = useState([]);
    const [hidden, setHidden] = useState(false);

    if (parts.length < 1) return null;

    const part_count = parts.reduce((acc, part) => acc + part.ids.length, 0);

    const hid = () => {
        setHidden(!hidden);
    };

    const handlePartClick = (e) => {
        const clonedElement = e.target;
        if (clonedElement.classList.contains('BLOCK')) {
            const id = +clonedElement.getAttribute("part_id");
            select_entity([id]);
        } else {
            select_entity([]);
        }
    };
    const prepareCutMap = (material, sheets) => {
        let partsArea = 0;
        let partsCount = 0;
        // Считаем общую площадь и количество частей
        sheets.forEach(detail => {
            if (detail.type === 'parts') {
                partsCount++;
                partsArea += (detail.width * detail.height);
            }
        });
        const percentage = (partsArea / (material.width * material.height)) * 100;
        return {
            ...material,
            partsCount: partsCount,
            percentage: percentage.toFixed(1),
            result: sheets,
        };
    }
    const cutParts = async (material, cutlist, tool, offset) => {
        var parts = prepareParts(cutlist, material, layers)
        let results = [];
        const cutSheet = prepareSheet(material, offset);
        let remainingParts = [...parts];
        let cutTapes = [];

        while (remainingParts.length > 0) {
            const {
                cuttingTapeParts,
                cuttingTapeSheet,
                remainingParts: newRemainingParts
            } = makeCutTape(remainingParts, cutSheet, tool);

            if (cuttingTapeParts && cuttingTapeParts.length > 0) {
                cutTapes.push({
                    ...cuttingTapeSheet,
                    parts: cuttingTapeParts,
                });
                remainingParts = newRemainingParts || [];
            } else {
                break;
            }
        }
        console.log('Нарезка частей на полосы:', cutTapes, offset);

        let allSheets = [];

        const optimizedSheets = await sheetsMaker(cutTapes, cutSheet, tool);

        if (Array.isArray(optimizedSheets) && optimizedSheets.length > 0) {
            allSheets.push(...optimizedSheets);
        }
        console.log('Оптимизация листов:', allSheets, optimizedSheets);


        if (allSheets.length > 0) {
            allSheets.forEach((sheetGroup, index) => {
                if (!Array.isArray(sheetGroup)) return;
        
                let allParts = [];
                let xOffset = 0;
        
                let finallyWidth = cutSheet.width;
                
        
                sheetGroup.forEach(sheet => {
                    if (sheet.parts.length > 0) {
                        allParts.push(...sheet.parts.map(part => ({
                            ...part,
                            x: part.x + xOffset,
                        })));
                        finallyWidth -= sheet.width + tool;
                        xOffset += sheet.width + tool;
                    } else {
                        console.error(`Invalid sheet parts at index ${index}:`, sheet);
                    }
                });
                let newSheet = {
                    ...cutSheet,
                    x: offset + xOffset,
                    width: finallyWidth,
                    height: cutSheet.height
                };
                allParts.push(newSheet);
                results.push(prepareCutMap(material, allParts));
            });
        }
        
        console.log('Размещение полос results:', results);
        return results;
    };
    const onClick = async (e) => {
        
        e.stopPropagation();
        const target = e.target;
        if (target.classList.contains("cut_map2")) {
            try {
                setCutMaps([]);
                const tool = material.tool || +window.userSettings.cuttingTool;
                const offset = material.offset || +window.userSettings.cuttingOffset;
                const results = await cutParts(material, parts, tool, offset);
                console.log('results', results, material);
                setCutMaps(results);
            } catch (error) {
                console.error('Ошибка при нарезке:', error);
            } finally {
                target.classList.remove("loading");
            }
        }

        if (target.classList.contains("drow_map")) {
            makeCAD(cutMaps);
        }

        if (target.classList.contains("print_map")) {
            const materialCode = material.code;
            const maps = cutMaps.filter(map => map.code === materialCode);
            makePdf(maps, parts);
        }
    };
    const onChange = async (e) => {
        const target = e.target;
        const name = target.name;
        const value = target.type === "checkbox" ? target.checked : +target.value;

        if (name === "allow_rotation") {
            const updatedMaterial = {
                ...material,
                [name]: value,
            };
            save_material(updatedMaterial);
        }
    };

    return (
        <div className="cutting_page">
            <div onClick={onClick} materialCode={material.code} className="flex_row space_between sticky card" onChange={onChange}>
                <div onClick={hid} className="material_description cursor-pointer">
                    {material.height} x {material.width} | {material.name} | деталей: {part_count} | листов: {cutMaps.length} {hidden ? "▼" : "▲"}
                </div>
                <label className="toggle">
                    <input
                        type="checkbox"
                        name="allow_rotation"
                        className="toggle__input"
                        checked={material.allow_rotation}
                    />
                    <div className="toggle__fill"></div>вращать
                </label>
                <div className="cut_map2 button">
                    Крой <CgSpinner size='16' className='spin hidden' />
                </div>
                <div className="print_map button">
                    Печать <CgSpinner size='16' className='spin hidden' />
                </div>
                <div className="drow_map button">
                    отрисовать
                </div>
            </div>
            {!hidden && cutMaps.map((map, index) => (
                <div key={index} className="svg_card card">
                    <div onClick={handlePartClick} className="svg_box">
                    <CutMapSVG cut_result={{ result: map.result, sheet: map }} />
                    </div>
                    <div className="svg_description pointer-events">
                        {index + 1} | {map.name} {map.height} x {map.width} | {map.partsCount} {getWord(map.partsCount)} | {map.percentage}%
                    </div>
                </div>
            ))}
        </div>
    );
}
