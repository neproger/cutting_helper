
import React, { useEffect, useState } from 'react'
import { save_material, delete_material, add_material } from '../../utils/sketchup_api'
import Modal from '../Modal';

export default function MaterialsPage({ materials }) {
    const [show, setShow] = useState(true);
    const [searchParams, setSearchParams] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);  // isDeleteModalOpen
    const [newMaterial, setSNewMaterial] = useState({
        type: "materials",
        name: "Имя",
        code: "CODE",
        allow_rotation: false,
        width: 0,
        height: 0,
        x: 0,
        y: 0
    });
    const handleSave = () => {
        if (newMaterial) {
            const existMaterial = materials.find(material => material.code === newMaterial.code);
            if(existMaterial){
                save_material(newMaterial);
            } else {
                add_material(newMaterial);
            }
            
            console.log('newMaterial', newMaterial);
        }
        closeModal();
    };

    const openModal = () => {
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setSNewMaterial({
            type: "materials",
            name: "Имя",
            code: "CODE",
            allow_rotation: false,
            width: 0,
            height: 0,
            x: 0,
            y: 0
        });
        setIsModalOpen(false);
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);  // isDeleteModalOpen
    const [newDeleteCode, setDeleteCode] = useState('');
    const handleDelete = () => {
        if (newDeleteCode) {
            delete_material(newDeleteCode);
            console.log('newMaterial', newDeleteCode);
        }
        closeDeleteModal();
    };
    const openDeleteModal = () => {
        setIsDeleteModalOpen(true);
    };
    const closeDeleteModal = () => {
        setDeleteCode('');
        setIsDeleteModalOpen(false);
    };

    async function onClick(e) {
        const target = e.target
        const name = target.getAttribute('name');
        console.log('onClick target', target);

        if (name === 'new') {
            openModal();
            console.log('onClick new');
            return;
        }


        const targetrow = e.target.closest("tr");
        if (!targetrow) return;
        const code = targetrow.getAttribute("code");
        if (name === 'edit') {
            const material = materials.find(material => material.code === code);
            setSNewMaterial(material);
            openModal();
            console.log('onClick', material);
            return;
        } //delete_material
        if (name === 'delete') {
            setDeleteCode(code);
            openDeleteModal();
            console.log('onClick delete_material', code);
            return;
        }
    };

    const existingMaterial = materials.find(mat => mat.code === newMaterial.code);

    const headerText = existingMaterial ? 'Изменение материала' : 'Создание материала';
    const modalButtonText = existingMaterial ? 'Изменить' : 'Создать';
    // console.log(materials)
    newMaterial
    return (
        <>
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <h2>{headerText}</h2>
                <div className="grid_row_style">
                    <span>Наименование:</span>
                    <input
                        type="text"
                        name="name"
                        placeholder={newMaterial.name}
                        onChange={(e) => setSNewMaterial(prevState => ({ ...prevState, name: e.target.value }))}
                    />
                </div>
                <div className="grid_row_style">
                    <span>Код:</span>
                    <input
                        type="text"
                        name="code"
                        placeholder={newMaterial.code}
                        onChange={(e) => setSNewMaterial(prevState => ({ ...prevState, code: e.target.value }))}
                    />
                </div>
                <div className="grid_row_style">
                    <span>Длинна:</span>
                    <input
                        type="number"
                        name="height"
                        placeholder={newMaterial.height}
                        onChange={(e) => setSNewMaterial(prevState => ({ ...prevState, height: +e.target.value }))}
                    />
                </div>
                <div className="grid_row_style">
                    <span>Ширина:</span>
                    <input
                        type="number"
                        name="width"
                        placeholder={newMaterial.width}
                        onChange={(e) => setSNewMaterial(prevState => ({ ...prevState, width: +e.target.value }))}
                    />
                </div>
                <div className="grid_row_style">
                    <span>Врашать детали:</span>
                    <label className="toggle">
                        <input
                            type="checkbox"
                            name="allow_rotation"
                            className="toggle__input"
                            checked={newMaterial.allow_rotation}
                            onChange={(e) => setSNewMaterial(prevState => ({ ...prevState, allow_rotation: e.target.checked }))}
                        />
                        <div className="toggle__fill"></div>{newMaterial.typeCut ? "вращаются" : "не вращаются"}
                    </label>
                </div>
                <div className="button" onClick={handleSave}>{modalButtonText}</div>
            </Modal>
            <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
                <h2>Удаление материала</h2>
                <div className="">
                    <h3>Вы уверяны что хотите удалить материал?</h3>
                    <label className="mt-10" sort_param="width">Это действие будет невозможно отменить!!!</label>
                </div>
                <div className="grid_2x2 mt-5">
                    <div className="button" onClick={handleDelete}>Удалить</div>
                    <div className="button" onClick={closeDeleteModal}>Отменить</div>
                </div>
            </Modal>
            <table className='materials_table' onClick={onClick} >
                <caption >
                    <div className='cursor-pointer' name='new'>Создать материал</div>
                </caption>
                <thead >
                    <tr className="header_material_row" target_type="materials" >
                        <th className="id_material_column">
                            <div className="id">#</div>
                        </th>
                        <th className="name_material_column">
                            <label className="" sort_param="name">Наименование</label>
                        </th>
                        <th className="code_material_column">
                            <label className="" sort_param="code">Код</label>
                        </th>
                        <th className="height_material_column">
                            <label className="" sort_param="height">Длинна</label>
                        </th>
                        <th className="width_material_column">
                            <label className="" sort_param="width">Ширина</label>
                        </th>
                        <th className="allow_rotation_material_column">
                            <label className="" sort_param="allow_rotation">Вращать</label>
                        </th>
                        <th className="options_column">
                            <label className="" >Опции</label>
                        </th>
                    </tr>
                </thead>
                <tbody className={show ? "show" : "hidden"}>

                    {materials.map((material, index) => (
                        <tr
                            code={material.code}
                            target_type="materials"
                        >
                            <td className="">
                                <div className="id pointer-events">{index + 1}</div>
                            </td>
                            <td className="">
                                <div className="">{material.name}</div>
                            </td>
                            <td className="">
                                <div className="">{material.code}</div>
                            </td>
                            <td className="">
                                <div className="">{material.height}</div>
                            </td>
                            <td className="">
                                <div className="">{material.width}</div>
                            </td>
                            <td className="">
                                <div className="">{material.allow_rotation ? ' + ' : ' - '}</div>
                            </td>
                            <td className="">
                                <div className="link" name='edit'>edit</div>
                                <div className="link" name='delete'>delete</div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>

    )
}