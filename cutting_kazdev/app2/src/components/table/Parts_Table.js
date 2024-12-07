import Table_Header from "./Table_Header"
import Table_Rows from "./Table_Rows"
import React, { useState } from 'react'
import { select_entity, set_data_array, add_material, post_block_bitmap } from '../../utils/sketchup_api'
import { getWord } from "../../utils/getWord";

export default function Parts_Table({ parts, layer, materials }) {
    const [show, setShow] = useState(true);
    const [searchParams, setSearchParams] = useState({});

    async function onClick(e) {
        const target = e.target;
        // console.log('target', target)
        if (target.classList.contains("length") || target.classList.contains("width")) {
            const targetrow = target.closest("tr");  // Найти ближайший родительский элемент <tr>

            if (!targetrow) return;
            const type = targetrow.getAttribute("target_type");
            const clones = targetrow.getAttribute("clones");
            const part_ids = clones.replace(/\[|\]/g, '')
                .split(',')
                .map(numStr => parseInt(numStr.trim()));

            var param = '';
            if (target.classList.contains("length")) {
                param = 'length'
            } else if (target.classList.contains("width")) {
                param = 'width'
            }
            var data = []
            part_ids.forEach(id => {
                data.push({
                    type: type,
                    id: id,
                    name: 'tape_toggle',
                    param: param
                });
            });
            // set_data_array(data);


            console.log(method, data);
            return;
        }

        if (target.classList.contains("show_table")) {
            console.log('show', show)
            setShow(!show)
            return
        }
        const targetrow = e.target.closest("tr");
        if (!targetrow) return;
        const id = targetrow.getAttribute("id");
        const type = targetrow.getAttribute("target_type");

        if (target.classList.contains("id_column")) {
            const ids = target.parentElement.getAttribute("clones");
            if (!ids || ids.length < 1) return;
            const numbers = ids.replace(/\[|\]/g, '') // Удаление скобок
                .split(',') // Разделение строки на массив строк по запятой
                .map(numStr => parseInt(numStr.trim())); // Преобразование каждой строки в число

            // console.log('clones', numbers)
            select_entity(numbers)
            return
        };

        if (target.classList.contains("remove_column")) {
            window.stateAction({
                action: "delete",
                data: {
                    type,
                    id: +id,
                    layer: layer.id
                }
            })
            return
        };

        if (target.classList.contains("sort_parts")) {
            const field = target.getAttribute("sort_param");
            if (target.classList.contains("max-min")) {
                target.classList.remove("max-min");
                target.classList.add("min-max");
                window.stateAction({
                    action: "sort_parts",
                    data: {
                        layer_id: +id,
                        field: field,
                        mode: "min-max"
                    }
                });
            } else {
                target.classList.remove("min-max");
                target.classList.add("max-min");
                window.stateAction({
                    action: "sort_parts",
                    data: {
                        layer_id: +id,
                        field: field,
                        mode: "max-min"
                    }
                });
            }
            return
        };
    }

    async function onChange(e) {
        const target = e.target
        const targetrow = e.target.closest("tr");
        if (!targetrow) return;
        const id = +targetrow.getAttribute("id");
        const clones = targetrow.getAttribute("clones");
        const name = target.name;
        const type = targetrow.getAttribute("target_type");
        const target_type = target.getAttribute("type");
        let value = target.value;

        if (name === "search") {
            const search_param = target.getAttribute("search_param");
            setSearchParams((prev) => {
                if (!value) {
                    const { [search_param]: _, ...rest } = prev;
                    return rest;
                };
                return {
                    ...prev,
                    [search_param]: value,
                };
            });
            return;
        };

        if (target_type === "checkbox") {
            value = target.checked ? true : false;
        };
        if (target_type === "number") {
            value = +target.value;
        };

        if (type === "layers" && name === "allow_rotation") {
            var data = []
            parts.forEach(part => {
                data.push({
                    type: part.type,
                    id: part.id,
                    name: name,
                    param: value
                });
            });
            set_data_array(data);
            return;
        };

        if (type === "layers") {
            var data = []
            data.push({
                type: type,
                id: id,
                name: name,
                param: value
            });
            set_data_array(data);
            return;
        };

        const part_ids = clones.replace(/\[|\]/g, '')
            .split(',')
            .map(numStr => parseInt(numStr.trim()));

        if (window.selected && window.selected.length > 0 && window.selected.every(id => part_ids.includes(id)) && name === "hold") {
            var data = [];
            window.selected.forEach(id => {
                data.push({
                    type: type,
                    id: id,
                    name: name,
                    param: value
                });
            });

            set_data_array(data);
            return;
        } else {
            var data = []
            part_ids.forEach(id => {
                data.push({
                    type: type,
                    id: id,
                    name: name,
                    param: value
                });
            });
            set_data_array(data);
            return;
        };
    };

    // console.log(parts)
    if (!parts) return;
    if (parts.length < 1) return;

    return (
        <>
            <table onClick={onClick} onChange={onChange}>
                <caption className="">
                    <div layer_id={layer.id} className="show_table cursor-pointer caption">
                        <div>
                            {layer.label}{show ? " ▲" : " ▼"}
                        </div>
                        <div>{parts.length || "loding"} {getWord(parts.length)}</div>
                    </div>
                </caption>
                <thead className={show ? "show" : "hidden"}>
                    <Table_Header layer={layer} materials={materials} />
                </thead>
                <tbody className={show ? "show" : "hidden"}>
                    <Table_Rows
                        materials={materials}
                        parts={parts.filter(part => {
                            return Object.keys(searchParams).every(key => {
                                const fieldValue = String(part[key]);
                                const searchValue = String(searchParams[key]);
                                return !searchValue || fieldValue.includes(searchValue);
                            });
                        })} />
                </tbody>
            </table>
        </>

    )
}