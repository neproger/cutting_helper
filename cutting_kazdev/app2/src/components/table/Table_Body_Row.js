import { MdOutlineDeleteForever } from "react-icons/md";
import React from 'react'
const Table_Body_Row = ({ row, materials, index, clones, handleDragOver, handleDrop, handleDragStart }) => {
    const part = row.part;
    const top_name = part.top_name
    const top_thick_grinding = part.top_thick_grinding
    const hold = part.hold
    const left_thick_grinding = part.left_thick_grinding
    const bottom_name = part.bottom_name
    const left_name = part.left_name
    const right_name = part.right_name
    const rotation = part.rotation
    const allow_rotation = part.allow_rotation
    const discription = part.discription
    const typeCut = window.userSettings.typeCut;
    const tapeDepth = +window.userSettings.tapeDepth;
    let height = part.height;
    let width = part.width;

    if (typeCut) {
        if (part.left_name) {
            height -= tapeDepth;
        }
        if (part.right_name) {
            height -= tapeDepth;
        }
        if (part.top_name) {
            width -= tapeDepth;
        }
        if (part.bottom_name) {
            width -= tapeDepth;
        }
    }

    const {
        id,
        type
    } = part;

    if (type !== "parts") {
        return null;
    }

    return (
        <tr
            /* draggable="true" */
            onDragOver={handleDragOver}
            onDragStart={(e) => handleDragStart(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            id={id}
            clones={clones}
            target_type="parts"
            className={clones.some(id => window.selected.includes(id)) ? "active" : ""}
        >
            <td className="id_column link">
                <div className="id pointer-events">{index + 1}</div>
                <label className="toggle">
                    <input
                        type="checkbox"
                        name="hold"
                        className="toggle__input"
                        checked={hold}
                    />
                    <div className="toggle__fill"></div>{/* снизу */}
                </label>
            </td>
            <td className="length_column">
                <div className="grid_2x2 tape_toggle">
                    <div className="length">{height}</div>
                    <input
                        type="number"
                        className="input_grinding"
                        name="top_thick_grinding"
                        value={top_thick_grinding || ""}
                        placeholder="отступ"
                    />
                </div>
                <div className="grid_2x2">
                    <label className="toggle">
                        <input
                            type="checkbox"
                            name="top_name"
                            className="toggle__input"
                            checked={top_name}
                        />
                        <div className="toggle__fill"></div>{/* сверху */}
                    </label>
                    <label className="toggle">
                        <input
                            type="checkbox"
                            name="bottom_name"
                            className="toggle__input"
                            checked={bottom_name}
                        />
                        <div className="toggle__fill"></div>{/* снизу */}
                    </label>
                </div>
            </td>
            <td className="rotation_column">
                <label className="toggle">
                    <input
                        type="checkbox"
                        name="rotation"
                        className="rotation toggle__input"
                        checked={rotation}
                    />
                    <div className="toggle__fill"></div>{/* повернуть */}
                </label>
            </td>
            <td className="width_column">
                <div className="grid_2x2 tape_toggle">
                    <div className="width">{width}</div>
                    <input
                        type="number"
                        className="input_grinding"
                        name="left_thick_grinding"
                        value={left_thick_grinding || ""}
                        placeholder="отступ"
                    />
                </div>
                <div className="grid_2x2">
                    <label className="toggle">
                        <input
                            type="checkbox"
                            name="left_name"
                            className="left_name toggle__input"
                            checked={left_name}
                        />
                        <div className="toggle__fill"></div>{/* слева */}
                    </label>
                    <label className="toggle">
                        <input
                            type="checkbox"
                            name="right_name"
                            className="right_name toggle__input"
                            checked={right_name}
                        />
                        <div className="toggle__fill"></div>{/* справа */}
                    </label>
                </div>
            </td>
            <td className="count_column">
                <div className="count">{row.ids.length}</div>
                {/* <label className="toggle pointer-events">шт</label> */}
            </td>
            <td className="discription_column">
                <textarea
                    type="text"
                    className="input_discription"
                    name="discription"
                    placeholder={"описание детали"}
                    value={discription || ""}
                />
                {/* <label className="toggle">описание</label> */}
            </td>
            <td className="material_column">
                <span>{part.material ? part.material : ""}</span>
                <select name="material">
                    <option value="">Не выбрано</option>
                    {materials.map((material) => (
                        <option
                            key={material.code}
                            className="dropdown-material"
                            value={material.code}
                            selected={part.material === material.code}
                        >
                            {material.name}
                            {material.height && material.width ? ` ${material.height} x ${material.width}` : ""}
                        </option>
                    ))}
                </select>
                {/* <label className="toggle">материал</label> */}
            </td>
            <td className="remove_column link">
                <MdOutlineDeleteForever className="pointer-events" size="16" />
            </td>
        </tr>
    );
};

export default Table_Body_Row;