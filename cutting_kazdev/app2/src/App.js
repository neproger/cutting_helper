import { ThemeContext } from './ThemeContext';


import { get_parts, get_layers, get_file_info, get_settings, set_settings } from './utils/sketchup_api'
import './styles/App.css';
import './styles/class.css';
import React, { useEffect, useState, useContext } from 'react'
import Header from './components/Header';
import Parts_Table from './components/table/Parts_Table';
import CuttingPage from './components/cutting/CuttingPage';
import Modal from './components/Modal';

import { makeXml } from './utils/makeXml';
import MaterialsPage from './components/materials/MaterialsPage';

function App() {
    const { theme, toggleTheme } = useContext(ThemeContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userSettings, setUserSettings] = useState({});
    const [fileInfo, setFileInfo] = useState({});
    window.userSettings = userSettings;
    window.fileInfo = fileInfo;
    const [newSettings, setNewSettings] = useState({});
    const handleSave = () => {
        setIsModalOpen(false)
        if (newSettings) set_settings(newSettings);
    };

    const openModal = () => {
        setNewSettings(userSettings)
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setNewSettings({})
        setIsModalOpen(false);
    };
    const [currentPage, setCurrentPage] = useState('Список');
    const [layers, setLayers] = useState([]);
    const [materials, setMaterials] = useState([]);
    
    const [selected, setSelected] = useState([]);
    window.setSelected = setSelected;
    window.selected = selected;

    function selectItems() {
        console.log('selected', selected);

        const activated_rect = document.querySelectorAll('rect.BLOCK.active');
        activated_rect.forEach(element => {
            element.classList.remove('active');
        });

        // Add 'active' class to elements with IDs from the 'ids' array
        selected.forEach(id => {
            const rows = document.querySelectorAll(`tr[target_type="parts"][clones*="${id}"]`);
            const blocks = document.querySelectorAll(`rect.BLOCK[part_id*="${id}"]`);
            if (rows) {
                rows[0] && rows[0].scrollIntoView({ behavior: "smooth" });
            };
            if (blocks) {
                blocks[0] && blocks[0].parentNode.parentNode.scrollIntoView({ behavior: "smooth", block: "center" });
                blocks.forEach(element => {
                    element.classList.add('active');
                });
            };
        });
    }
    window.selectItems = selectItems;
    useEffect(() => {
        selectItems();
    }, [selected]);


    const stateAction = async ({ action, data, index }) => {
        switch (action) { // set_settings
            case "set_settings":
                // console.log(action, data);
                setUserSettings(data.userSettings);
                setMaterials(data.materials)
                break;
            case "edit":
                console.log('stateAction: ', action, data.type, data.id, data.name, data.value);
                setLayers(prevLayers => {
                    const updatedLayers = [...prevLayers];
                    if (data.type === "parts") {
                        const layerIndex = updatedLayers.findIndex(layer => layer.parts && layer.parts.some(part => part.id === data.id));
                        if (layerIndex !== -1) {
                            const newLayer = { ...updatedLayers[layerIndex] };
                            const partIndex = newLayer.parts.findIndex(part => part.id === data.id);
                            if (partIndex !== -1) {
                                newLayer.parts[partIndex] = {
                                    ...newLayer.parts[partIndex],
                                    [data.name]: data.value
                                };
                                updatedLayers[layerIndex] = newLayer;
                            }
                        }
                    } else if (data.type === "layers") {
                        updatedLayers.forEach((layer, index) => {
                            if (layer.id === data.id) {
                                updatedLayers[index] = {
                                    ...layer,
                                    [data.name]: data.value
                                };
                            }
                        });
                    }
                    return updatedLayers;
                });
                break;
            case "delete":
                setLayers(prev => {
                    if (data.type === "parts") {
                        // Удаление части из массива parts указанного слоя
                        return prev.map(layer => {
                            if (layer.id !== data.layer) return layer;
                            const updatedParts = layer.parts.filter(part => part.id !== data.id);
                            return {
                                ...layer,
                                parts: updatedParts,
                            };
                        });
                    } else if (data.type === "layers") {
                        // Очистка массива parts указанного слоя
                        return prev.map(layer => {
                            if (layer.id !== data.id) return layer;
                            return {
                                ...layer,
                                parts: [],
                            };
                        });
                    } else {
                        return prev;
                    }
                });
                break;
            case "set_parts":
                console.log('set_parts', data);
                setLayers(prevLayers => {
                    // Создаем копию предыдущего состояния
                    const updatedLayers = [...prevLayers];

                    // Проходим по каждой новой части
                    data.forEach(part => {
                        // Находим индекс слоя для этой части
                        const layerIndex = updatedLayers.findIndex(lay => lay.id === part.layer_id);

                        if (layerIndex !== -1) {
                            // Если слой найден, создаем копию слоя
                            const layer = { ...updatedLayers[layerIndex] };

                            // Если в слое нет массива parts, создаем его и добавляем новую часть
                            if (!layer.parts) {
                                layer.parts = [part];
                            } else {
                                // Находим индекс объекта с таким же id в массиве parts
                                const partIndex = layer.parts.findIndex(existingPart => existingPart.id === part.id);

                                // Если объект с таким id существует, заменяем его
                                if (partIndex !== -1) {
                                    layer.parts[partIndex] = part;
                                } else {
                                    // В противном случае добавляем новый объект в массив parts
                                    layer.parts.push(part);
                                }
                            }

                            // Обновляем слой в массиве обновленных слоев
                            updatedLayers[layerIndex] = layer;
                        } else {
                            // Если слой с указанным id не существует, создаем новый слой с массивом parts
                            updatedLayers.push({ id: part.layer_id, parts: [part] });
                        }
                    });

                    return updatedLayers;
                });
                break;
            case "get_parts":
                let allParts = [];
                layers.forEach(layer => {
                    if (layer.parts && layer.parts.length > 0) {
                        allParts = allParts.concat(layer.parts);
                    }
                });
                console.log("All parts:", allParts);
                break;
            case "set_layers":
                setLayers(data);
                break;
            case "set_file_info":
                // console.log('action', action, data)
                setFileInfo(data)
                break;
            case "sort_parts":
                console.log('sort_parts', data);
                setLayers(prevLayers => {
                    // Создаем копию предыдущего состояния
                    const updatedLayers = [...prevLayers];

                    // Находим индекс слоя, который нужно отсортировать
                    const layerIndex = updatedLayers.findIndex(lay => lay.id === data.layer_id);

                    if (layerIndex !== -1) {
                        // Если слой найден, создаем копию слоя
                        const layer = { ...updatedLayers[layerIndex] };

                        // Сортируем массив parts в слое
                        layer.parts.sort((a, b) => {
                            const valueA = a[data.field];
                            const valueB = b[data.field];
                            if (data.mode === "min-max") {
                                return valueA - valueB;
                            } else {
                                return valueB - valueA;
                            }
                        });

                        // Обновляем слой в массиве обновленных слоев
                        updatedLayers[layerIndex] = layer;
                    }

                    return updatedLayers;
                });
                break;
            default:
                console.log(action, data, index)
                break;
        }
    };
    window.stateAction = stateAction;

    useEffect(() => {
        get_layers();
        get_file_info();
        get_settings();
        get_parts();
    }, []);

    async function onClick(e) {
        const target = e.target;

        if (target.classList.contains("cutting_page")) {
            // console.log('cutting_page', target)
            if (currentPage !== "Крой") {
                setCurrentPage("Крой");
                return
            }
            return
        };

        if (target.classList.contains("get_parts")) {
            // console.log('get_parts');
            if (currentPage !== "Список") {
                setCurrentPage("Список");
                return
            }
            get_parts();
            return
        };
        if (target.classList.contains("get_xml")) {
            // console.log('get_xml')
            makeXml(layers, fileInfo);
            return
        };
        if (target.classList.contains("materials_page")) {
            if (currentPage !== "Материалы") {
                setCurrentPage("Материалы");
                return
            }
            return
        };
    }

    return (
        <div className={`app ${theme}`}>
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <h2>Настройки</h2>
                <div className="grid_row_style">
                    <span>Режущий инструмент:</span>
                    <input
                        type="number"
                        name="cuttingTool"
                        placeholder={newSettings.cuttingTool}
                        onChange={(e) => setNewSettings(prevState => ({ ...prevState, cuttingTool: e.target.value }))}
                    />
                </div>
                <div className="grid_row_style">
                    <span>Смещение:</span>
                    <input
                    type="number"
                    name="cuttingOffset"
                    placeholder={newSettings.cuttingOffset}
                    onChange={(e) => setNewSettings(prevState => ({ ...prevState, cuttingOffset: e.target.value }))}
                    />
                </div>
                <div className="grid_row_style">
                    <span>Толщина кромки:</span>
                    <input
                        type="number"
                        name="tapeDepth"
                        placeholder={newSettings.tapeDepth}
                        onChange={(e) => setNewSettings(prevState => ({ ...prevState, tapeDepth: e.target.value }))}
                    />
                </div>
                <div className="grid_row_style">
                    <span>Вычесть кромку:</span>
                    <label className="toggle">
                        <input
                            type="checkbox"
                            name="typeCut"
                            className="toggle__input"
                            checked={newSettings.typeCut}
                            onChange={(e) => setNewSettings(prevState => ({ ...prevState, typeCut: e.target.checked }))}
                        />
                        <div className="toggle__fill"></div>{newSettings.typeCut ? "вычитается" : "не вычитается"}
                    </label>
                </div>
                <div className="grid_row_style">
                    <span>Тема:</span>
                    <label className="toggle">
                        <div onClick={toggleTheme} className="toggle__fill"></div>{newSettings.typeCut ? "светлая" : "темная"}
                    </label>
                </div>
                <div className="button" onClick={handleSave}>Сохранить</div>
            </Modal>
            <header onClick={onClick}>
                <Header currentPage={currentPage} openModal={openModal} />

            </header>
            <content>
                {currentPage === 'Список' &&
                    layers && layers.map((layer) => {
                        return <Parts_Table
                            key={layer.id}
                            layer={layer}
                            parts={layer.parts}
                            materials={materials}
                            selected={selected}
                        />
                    })
                }
                {currentPage === 'Крой' &&
                    <CuttingPage
                        
                        layers={layers}
                        materials={materials} />
                }
                {currentPage === 'Материалы' &&
                    <MaterialsPage materials={materials} />
                }
            </content>
            <footer>
                <div>{""}</div>
                <div>{fileInfo.file_name}</div>
            </footer>
        </div>
    );

};

export default App;
