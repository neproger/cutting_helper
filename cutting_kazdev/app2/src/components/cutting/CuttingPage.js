import React, { useEffect, useState } from 'react'

import CuttingBlock from './CuttingBlock';

import { compareObjects } from '../../utils/compareObjects'


export default function CuttingPage({ materials, layers }) {
    
    const [partsState, setPartsState] = useState([]);
    function compareArray(parts) {
        if (parts.length < 1) return;
        var newRows = [];
        parts.forEach(part => {
            const index = newRows.findIndex(row => {
                return compareObjects(row.part, part);
            });

            if (index === -1) {
                newRows.push({
                    ids: [part.id],
                    part: part
                });
            } else {
                newRows[index].ids.push(part.id);
            }
        });
        // console.log('compareArray', newRows);
        return newRows;
    };

    useEffect(() => {
        if (!layers) {
            console.log('CuttingPage error', layers);
            return;
        }
        var new_parts = [];
        layers.forEach(layer => {
            const parts = layer.parts;
            if (parts && parts.length > 0) {
                parts.forEach(part => {
                    var new_part = { ...part }
                    if (!new_part.material) {
                        new_part.material = layer.material
                    }
                    new_parts.push(new_part);
                })
            }
        });
        setPartsState(compareArray(new_parts));
    }, [layers]);



    return (
        <div >

            {materials.map((material) => {
                return <CuttingBlock
                    key={material.code}
                    material={material}
                    layers={layers}
                    parts={partsState.filter(part => part.part.material === material.code)}
                    
                />
            })}

        </div>
    )
}