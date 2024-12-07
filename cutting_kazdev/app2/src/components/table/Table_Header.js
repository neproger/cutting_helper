import React from 'react';
import { MdOutlineDeleteForever } from "react-icons/md";

function Header({ layer, materials }) {
    return (
        <tr className="header_row" target_type="layers" id={layer.id}>
            <th className="id_column">
                <div className="id pointer-events">#</div>
            </th>
            <th className="length_column">
                <div className="grid_2x2">
                    <input
                        className="search"
                        search_param="height"
                        type="number"
                        name="search"
                        placeholder="поиск"
                    />
                    <input
                        type="number"
                        className="input_grinding"
                        name="top_thick_grinding"
                        defaultValue={layer.top_thick_grinding || ""}
                        placeholder="отступ"
                    />
                </div>
                <label className="toggle sort_parts" sort_param="height"></label>
            </th>
            <th className="rotation_column">
                <label className="toggle">повернуть</label>
            </th>
            <th className="width_column grid_1x">
                <div className="grid_2x2">
                    <input
                        className="input_grinding"
                        search_param="width"
                        type="number"
                        name="search"
                        placeholder="поиск"
                    />
                    <input
                        type="number"
                        className="input_grinding"
                        name="left_thick_grinding"
                        defaultValue={layer.left_thick_grinding || ""}
                        placeholder="отступ"
                    />
                </div>
                <label className="toggle sort_parts" sort_param="width"></label>
            </th>
            <th className="">
                <label className="toggle pointer-events">кол</label>
            </th>
            <th className="discription_column">
                <textarea
                    type="text-area"
                    className="input_layer_discription"
                    name="discription"
                    placeholder={"описание слоя"}
                >
                    {layer.discription || ""}
                </textarea>
            </th>
            <th className="material_column">
                <select name="material">
                    <option value="">Не выбрано</option>
                    {materials.map((material) => (
                        <option
                            key={material.code}
                            className="dropdown-material"
                            value={material.code}
                            selected={layer.material === material.code}
                        >
                            {material.name}
                            {material.height && material.width ? ` ${material.height} x ${material.width}` : ""}
                        </option>
                    ))}
                </select>
                <label className="toggle">материал</label>
            </th>
            
            <th className="remove_column link">
                <MdOutlineDeleteForever className="pointer-events" size="16" />
            </th>
        </tr>
    );
}

export default Header;
