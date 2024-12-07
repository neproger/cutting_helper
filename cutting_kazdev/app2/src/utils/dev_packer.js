
// Основная функция dev_packer
const dev_packer = async (sheet, parts, tool, offset) => {
    // console.log(sheet, parts, tool, offset);

    // Подготовка входных деталей
    const newParts = parts.sort((a, b) => b.width - a.width);

    // Настройка листа
    let newSheet = {
        ...sheet,
        x: offset,
        y: offset,
        width: sheet.width - offset * 2,
        height: sheet.height - offset * 2,
    };

    // Процесс размещения деталей на листах
    let sheets = [newSheet];
    const { sheets: updatedSheets, errorParts } = placePartsOnSheets(sheets, newParts, tool);

    newSheet = {
        ...sheet,
        x: 0,
        y: 0,
    };

    return {
        result: updatedSheets,
        sheet: newSheet,
        errorParts: errorParts,
    };
};
export const prepareSheet = (sheet, offset) => {
    return {
        ...sheet,
        x: offset,
        y: offset,
        width: sheet.width - offset * 2,
        height: sheet.height - offset * 2,
    };
};
// Функция для подготовки входных деталей
export const prepareParts = (parts, material, layers) => {
    // console.log('prepareParts', parts, material);
    const materialParts = parts.flatMap((stack, index) => {
        const layer = layers.find(layer => layer.id === stack.part.layer_id);
        return stack.ids.map(id => ({
            ...stack.part,
            id,
            index: index + 1,
            // Добавляем шлифовку к ширине и высоте детали
            width: stack.part.width + (stack.part.left_thick_grinding || layer?.left_thick_grinding || 0),
            height: stack.part.height + (stack.part.top_thick_grinding || layer?.top_thick_grinding || 0),
            left_thick_grinding: stack.part.left_thick_grinding || layer?.left_thick_grinding || 0,
            top_thick_grinding: stack.part.top_thick_grinding || layer?.top_thick_grinding || 0,
        }))
    });
    
    return materialParts.map(newPart => {
        // Если разрешено вращение и ширина больше высоты, выполняем поворот
        if (material.allow_rotation && newPart.width > newPart.height) {
            [
                newPart.width,
                newPart.height,
                newPart.top_name,
                newPart.bottom_name,
                newPart.left_name,
                newPart.right_name,
                newPart.left_thick_grinding,
                newPart.top_thick_grinding,
            ] = [
                    newPart.height,
                    newPart.width,
                    newPart.right_name,
                    newPart.left_name,
                    newPart.bottom_name,
                    newPart.top_name,
                    newPart.top_thick_grinding,
                    newPart.left_thick_grinding,
                ];
            newPart.cut_rotated = true;
        }
        return newPart;
    });
};
// Функция для размещения детали на листе
export const placePartOnSheet = (sheet, width, height, tool) => {
    const rightSheet = {
        ...sheet,
        width: sheet.width - width - tool,
        height: height,
        x: sheet.x + width + tool,
        y: sheet.y,
    };

    const bottomSheet = {
        ...sheet,
        width: sheet.width,
        height: sheet.height - height - tool,
        x: sheet.x,
        y: sheet.y + height + tool,
    };

    const rightSheet2 = {
        ...sheet,
        width: sheet.width - width - tool,
        height: sheet.height,
        x: sheet.x + width + tool,
        y: sheet.y,
    };

    const bottomSheet2 = {
        ...sheet,
        width: width,
        height: sheet.height - height - tool,
        x: sheet.x,
        y: sheet.y + height + tool,
    };

    return { rightSheet, bottomSheet, rightSheet2, bottomSheet2 };
};
// Функция для размещения деталей на листах
export const placePartsOnSheets = (sheets, parts, tool, variant) => {
    console.log('placePartsOnSheets', sheets, parts, tool, variant);
    const errorParts = [];
    parts.forEach((part) => {
        const height = part.height + (part.top_thick_grinding ? part.top_thick_grinding : 0);
        const width = part.width + (part.left_thick_grinding ? part.left_thick_grinding : 0);
        const fittingSheets = sheets.filter(sheet => {
            if (sheet.type !== 'materials') return false;
            // Если поворот не разрешен, проверяем стандартные размеры
            return sheet.width >= width && sheet.height >= height;
        });        

        if (fittingSheets.length < 1) {
            errorParts.push(part)
            return;
        };
        // Найти самый маленький по площади лист, на который помещается деталь
        const sheet = fittingSheets.reduce((smallestSheet, currentSheet) => {
            const smallestSheetArea = smallestSheet.width * smallestSheet.height;
            const currentSheetArea = currentSheet.width * currentSheet.height;
            return currentSheetArea < smallestSheetArea ? currentSheet : smallestSheet;
        });

        // принимаем парт и щит и далее функция для размещения детали на листе
        const { rightSheet, bottomSheet, rightSheet2, bottomSheet2 } = placePartOnSheet(sheet, width, height, tool);

        const newPart = {
            ...part,
            x: sheet.x,
            y: sheet.y,
        };
        // Определяем, какой из вариантов лучше подходит
        const sheetsToAdd = (variant === 'horizontal')
            ? [rightSheet, bottomSheet]
            : [rightSheet2, bottomSheet2];

        // Добавляем оставшиеся части, если их размеры больше нуля
        sheetsToAdd.forEach(sheet => {
            if (sheet.width > 0 && sheet.height > 0) {
                sheets.push(sheet);
            }
        });
        // Добавляем новую часть в список листов

        sheets.splice(sheets.indexOf(sheet), 1); // Удаляем исходный лист
        sheets.sort((a, b) => a.x - b.x || a.y - b.y);
        sheets.push(newPart); // Добавляем часть на лист

    });
    return { sheets, errorParts };
};

const findTargetPart = (parts) => {
    return parts.reduce((bestPart, currentPart) => {
        if (
            currentPart.width >= bestPart.width ||
            (currentPart.width === bestPart.width && currentPart.height < bestPart.height)
        ) return currentPart;
        return bestPart;
    }, parts[0]);
};
export const makeCutTape = (parts, material, tool) => {
    let sortedParts = [];
    // Сортировка частей по ширине в убывающем порядке
    sortedParts = parts;

    var newPart = findTargetPart(sortedParts);
    newPart.x = material.x;
    newPart.y = material.y;

    const cuttingTapeSheet = {
        ...material,
        width: newPart.width,
    };
    let verticalParts = sortedParts.filter(part =>
        part.width <= cuttingTapeSheet.width &&
        part.height <= cuttingTapeSheet.height &&
        part.id !== newPart.id
    );
    if (material.allow_rotation) {
        console.log('material.allow_rotation: ', material.allow_rotation);
    }
    var partsSubset = findOptimalSolution(verticalParts, cuttingTapeSheet.height - newPart.height - tool, 'height', tool);
    console.log('Оптимизированные деталы на полосе: ', partsSubset);
    var remainingParts = verticalParts.filter(part => !partsSubset.some(p => p.id === part.id));
    let offset = newPart.height + tool + material.x;
    const cuttingTapeParts = partsSubset.sort((a, b) => b.width - a.width).flatMap(part => {
        let nPart;

        nPart = {
            ...part,
            x: cuttingTapeSheet.x,
            y: offset,
        };
        const nSheet = {
            ...cuttingTapeSheet,
            width: cuttingTapeSheet.width - nPart.width - tool,
            height: nPart.height,
            x: cuttingTapeSheet.x + nPart.width + tool,
            y: offset,
        };
        offset += nPart.height + tool;
        return [nPart, nSheet];
    });
    cuttingTapeParts.push(newPart);

    const lastPart = cuttingTapeParts.reduce((maxPart, part) => {
        if (part.x > maxPart.x && part.type === 'parts') return part;
        console.log('maxPart: ', maxPart);
        return maxPart;
    }, newPart);
    const cutSheet = {
        ...cuttingTapeSheet,
        x: lastPart.x,
        y: offset,
        height: material.height - offset + material.x,
    };
    cuttingTapeParts.push(cutSheet);
    

    if (remainingParts.length > 0) {
        let { sheets, errorParts } = placePartsOnSheets(cuttingTapeParts, remainingParts, tool);
    
        if (cuttingTapeSheet.allow_rotation && errorParts.length > 0) {
            console.log('material.allow_rotation: ', material.allow_rotation, errorParts);
    
            const rotatedParts = errorParts.map(part => {
                if (part.width > part.height) {
                    return {
                        ...part,
                        width: part.height,
                        height: part.width,
                        cut_rotated: true,
                    };
                }
                return part;
            });
    
            const finalResult = placePartsOnSheets(sheets, rotatedParts, tool);
    
            return {
                cuttingTapeParts: finalResult.sheets,
                cuttingTapeSheet,
                remainingParts: finalResult.errorParts,
            };
        }
    
        return {
            cuttingTapeParts: sheets,
            cuttingTapeSheet,
            remainingParts: errorParts,
        };
    }
    
    return {
        cuttingTapeParts,
        cuttingTapeSheet,
        remainingParts,
    };
};

export const makeCutTapeII = (parts, material, tool) => {
    let sortedParts = [];
    // Сортировка частей по ширине в убывающем порядке
    sortedParts = parts;

    var newPart = findTargetPart(sortedParts);
    newPart.x = material.x;
    newPart.y = material.y;
    const { bottomSheet2 } = placePartOnSheet(material, newPart.width, newPart.height, tool);
    let offset = newPart.height + tool + material.x;
    const cuttigTapeSheet = {
        ...bottomSheet2,
        y: offset,
    };

    // Фильтрация частей для вертикальной полосы
    let verticalParts = sortedParts.filter(part =>
        part.width <= cuttigTapeSheet.width &&
        part.height <= cuttigTapeSheet.height &&
        part.id !== newPart.id
    ).sort((a, b) => b.width - a.width);

    if (material.allow_rotation) {
        console.log('material.allow_rotation: ', material.allow_rotation);
    }
    var { sheets: cuttingTapeParts, errorParts: remainingParts } = placePartsOnSheets([cuttigTapeSheet], verticalParts, tool);
    cuttingTapeParts.push(newPart);
    return {
        cuttingTapeParts,
        cuttigTapeSheet,
        remainingParts,
    };
};
export const sheetsMaker = async (tapes, material, tool) => {
    let allSheets = [];

    while (tapes.length > 0) {
        // Оптимизация текущего набора полос для одного листа
        const optimizedSheets = findOptimalSolution(tapes, material.width, 'width', tool);

        // Если есть оптимизированные полосы, создаем лист
        if (Array.isArray(optimizedSheets) && optimizedSheets.length > 0) {
            allSheets.push(optimizedSheets);
            // Убираем размещенные полосы из общего списка
            tapes = tapes.filter(tape => !optimizedSheets.includes(tape));
        } else {
            // Если больше не осталось подходящих полос, выходим из цикла
            break;
        }
    }

    return allSheets;
};
export const findOptimalSolution = (items, targetValue, field, tool) => {
    const dp = Array(targetValue + 1).fill(null);
    dp[0] = { value: 0, items: [], volume: 0 };

    for (const item of items) {
        const itemSize = item[field] + tool;
        const itemVolume = item.height * item.width;

        for (let value = targetValue; value >= itemSize; value--) {
            if (dp[value - itemSize] !== null) {
                const newValue = dp[value - itemSize].value + itemSize;
                const newVolume = dp[value - itemSize].volume + itemVolume;

                if (newValue <= targetValue) {
                    const newItems = [...dp[value - itemSize].items, item];

                    if (
                        dp[newValue] === null ||
                        newVolume > dp[newValue].volume || // Приоритет по объему
                        (newVolume === dp[newValue].volume && newItems.length < dp[newValue].items.length)
                    ) {
                        dp[newValue] = { value: newValue, items: newItems, volume: newVolume };
                    }
                }
            }
        }
    }

    let closestValue = 0;
    let maxVolume = 0;
    let resultItems = [];

    for (let value = targetValue; value >= 0; value--) {
        if (dp[value] !== null) {
            if (dp[value].volume > maxVolume) {
                closestValue = value;
                maxVolume = dp[value].volume;
                resultItems = dp[value].items;
            }
        }
    }

    return resultItems;
};

export default dev_packer;
