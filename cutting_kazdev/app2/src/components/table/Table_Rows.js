import React, { useEffect, useState } from 'react';
import Table_Body_Row from './Table_Body_Row';
import { compareObjects } from '../../utils/compareObjects';

export default function Table_Rows({ materials, parts }) {
    const [rows, setRows] = useState([]);

    const handleDragStart = (e, index) => {
        e.dataTransfer.setData('index', index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, toIndex) => {
        const fromIndex = e.dataTransfer.getData('index');
        const draggedRow = rows[fromIndex];
        const newRows = [...rows];
        newRows.splice(fromIndex, 1);
        newRows.splice(toIndex, 0, draggedRow);
        setRows(newRows);
    };

    useEffect(() => {
        if (parts.length < 1) {
            setRows([]);
            return;
        }

        const newRows = parts.reduce((acc, part) => {
            const index = acc.findIndex(row => compareObjects(row.part, part));

            if (index === -1) {
                acc.push({
                    ids: [part.id],
                    part: part
                });
            } else {
                acc[index].ids.push(part.id);
            }

            return acc;
        }, []);

        setRows(newRows);
    }, [parts]);

    return (
        <>
            {rows.length > 0 ? (
                rows.map((r, index) => (
                    <Table_Body_Row
                        key={index}
                        row={r}
                        materials={materials}
                        index={index}
                        clones={r.ids}
                        handleDragOver={handleDragOver}
                        handleDrop={handleDrop}
                        handleDragStart={handleDragStart}
                    />
                ))
            ) : (
                <div>Не найдено</div>
            )}
        </>
    );
}
