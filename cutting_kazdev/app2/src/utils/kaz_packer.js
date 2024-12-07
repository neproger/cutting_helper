export function placeProducts(work_parts, sheet) {
    for (let i = work_parts.length - 1; i >= 0; i--) {
        const part = work_parts[i];

        if (
            (part.width > sheet.width || part.height > sheet.height) &&
            !part.rotation
        ) {
            console.log(
                `Продукт с ID ${part.id} не вмещается на исходный лист `,
                part,
                finishedSheet
            );

            work_parts.splice(i, 1);
        } else if (
            (part.width > sheet.height || part.width > sheet.height) &&
            part.rotation
        ) {
            console.log(
                `Продукт с ID ${part.id} не вмещается на исходный лист`,
                part,
                finishedSheet
            );
            work_parts.splice(i, 1);
        }
    }

    if (work_parts.length < 1) {
        console.log(
            "//////////////work_parts.length work_parts ",
            work_parts.length
        );
        return;
    }

    var partCounter = 0;

    // Разбиваем массив на три подмассива
    const notallowRotation = work_parts.filter(
        (part) => !part.allow_rotation || undefined
    );
    const allowRotation = work_parts.filter((part) => part.allow_rotation);

    // Сортируем каждый из подмассивов по требованиям
    notallowRotation.sort((a, b) => {
        let aWidth = a.rotation ? a.height : a.width;
        let aHeight = a.rotation ? a.width : a.height;

        let bWidth = b.rotation ? b.height : b.width;
        let bHeight = b.rotation ? b.width : b.height;

        if (aWidth - bWidth !== 0) {
            return bWidth - aWidth; // Убывание width
        } else {
            return bHeight - aHeight; // Убывание height
        }
    });

    allowRotation.sort((a, b) => {
        const areaA = a.width * a.height;
        const areaB = b.width * b.height;

        return areaB - areaA; // Убывание площади
    });

    work_parts.sort((a, b) => {
        const areaA = a.width * a.height;
        const areaB = b.width * b.height;

        return areaB - areaA; // Убывание площади
    });

    // Объединяем отсортированные подмассивы в один
    /* work_parts = [];
    var work_parts = notallowRotation.concat(allowRotation); */

    console.log("work_parts... ", work_parts);

    work_parts.forEach((part) => {
        if (part.used) return;
        var sheets = finishedSheet.parts.filter(
            (sheet) => sheet.type === "sheets"
        );

        sheets.sort((b, a) => a.y - b.y);

        console.log("sheets.sort((a, b) => ", sheets);

        for (let i = 0; i < sheets.length; i++) {
            const sheet = sheets[i];

            if (!sheet.type === "sheets") {
                continue;
            }

            const placement = placeProduct(part, sheet);

            if (!placement) continue;
            console.log("placement", placement);

            if (!placement.bottomSpace.area || !placement.rightSpace.area) {
                continue;
            }

            if (
                placement.bottomSpace.width > 20 &&
                placement.bottomSpace.height > 20
            ) {
                placement.bottomSpace.id = database.generateId();
                finishedSheet.parts.push(placement.bottomSpace);
            }

            if (
                placement.rightSpace.width > 20 &&
                placement.rightSpace.height > 20
            ) {
                placement.rightSpace.id = database.generateId();
                finishedSheet.parts.push(placement.rightSpace);
            }

            const index = finishedSheet.parts.findIndex(
                (item) => item.id === placement.spaceSheet.id
            );

            if (index !== -1) {
                finishedSheet.parts.splice(index, 1);
            }

            placement.part.used = true;
            finishedSheet.parts.push(placement.part);
            partCounter++;
        }
    });

    if (finishedSheet.parts.length > 0) {
        finishedSheet.id = database.generateId();
        finishedSheet.type = "finishedSheets";
        finishedSheet.parts_count = partCounter;
        database.add(finishedSheet);
        finishedSheet = {
            ...sheet,
            type: "sheets",
            parts: [baseSheet],
        };
        work_parts = parts.filter((part) => !part.used);
        for (let i = work_parts.length - 1; i >= 0; i--) {
            const part = work_parts[i];

            /* console.log(
                    `// Проверка, вмещается ли продукт на листе ${part.id}
            `,
                    part.width,
                    finishedSheet.width
                ); */

            if (
                (part.width > sheet.width || part.height > sheet.height) &&
                !part.rotation
            ) {
                console.log(
                    `Продукт с ID ${part.id} не вмещается на исходный лист `,
                    part,
                    finishedSheet
                );

                work_parts.splice(i, 1); // переход к следующему продукту
            }

            if (
                (part.width > sheet.width || part.height > sheet.height) &&
                part.rotation
            ) {
                console.log(
                    `Продукт с ID ${part.id} не вмещается на исходный лист`,
                    part,
                    finishedSheet
                );
                work_parts.splice(i, 1);
            }
        }
    }
}

export function placeProduct(part, spaceSheet) {
    if (part.used) {
        console.log("placeProduct деталь из used");
        return false;
    }

    const { tool } = database;
    const { x, y } = spaceSheet;
    let rightSpace = {};
    let bottomSpace = {};

    /* console.log("/////////placeProduct START", part, spaceSheet); */

    // Заливка
    let fill = "#c0c0c0";
    let r_fill = "grey";
    let b_fill = "yellow";
    let used = false;
    if (part) {
        let r_width,
            r_height,
            r_x,
            r_y,
            r_area,
            b_width,
            b_height,
            b_x,
            b_y,
            b_area;
        let r_width_2,
            r_height_2,
            r_x_2,
            r_y_2,
            r_area_2,
            b_width_2,
            b_height_2,
            b_x_2,
            b_y_2,
            b_area_2;
        let r_width_result,
            r_height_result,
            r_x_result,
            r_y_result,
            r_area_result,
            r_status_result,
            b_width_result,
            b_height_result,
            b_x_result,
            b_y_result,
            b_area_result,
            b_status_result;
        console.log("||| allow_rotation1 |||");
        r_width = spaceSheet.width - part.width - tool;
        r_height = spaceSheet.height;
        r_x = x + part.width + tool;
        r_y = y;
        r_area = r_width * r_height;

        b_width = part.width;
        b_height = spaceSheet.height - part.height - tool;
        b_x = x;
        b_y = y + part.height + tool;
        b_area = b_width * b_height;

        console.log("||| allow_rotation2 |||");
        r_width_2 = spaceSheet.width - part.height - tool;
        r_height_2 = spaceSheet.height;
        r_x_2 = x + part.height + tool;
        r_y_2 = y;
        r_area_2 = r_width_2 * r_height_2;

        b_width_2 = part.height;
        b_height_2 = spaceSheet.height - part.width - tool;
        b_x_2 = x;
        b_y_2 = y + part.width + tool;
        b_area_2 = b_width_2 * b_height_2;

        if (part.allow_rotation) {
            let maxArea = Math.max(r_area, b_area, r_area_2, b_area_2);
            if (maxArea === r_area || maxArea === b_area) {
                console.log("Первый вариант имеет самый большой остаток.");
                // Присваиваем значения для первого варианта к соответствующим переменным
                r_width_result = r_width;
                r_height_result = r_height;
                r_x_result = r_x;
                r_y_result = r_y;
                r_area_result = r_area;
                if (r_width >= -tool && r_height >= -tool) {
                    r_status_result = true;
                    part.rotation = false;
                }

                b_width_result = b_width;
                b_height_result = b_height;
                b_x_result = b_x;
                b_y_result = b_y;
                b_area_result = b_area;
                if (b_width >= -tool && b_height >= -tool) {
                    b_status_result = true;
                    part.rotation = false;
                }
            } else if (maxArea === r_area_2 || maxArea === b_area_2) {
                console.log("Втоорой вариант имеет самый большой остаток.");
                // Присваиваем значения для второго варианта к соответствующим переменным
                r_width_result = r_width_2;
                r_height_result = r_height_2;
                r_x_result = r_x_2;
                r_y_result = r_y_2;
                r_area_result = r_area_2;
                if (r_width_2 >= -tool && r_height_2 >= -tool) {
                    r_status_result = true;
                    part.rotation = true;
                }

                b_width_result = b_width_2;
                b_height_result = b_height_2;
                b_x_result = b_x_2;
                b_y_result = b_y_2;
                b_area_result = b_area_2;
                b_area_result = b_area;
                if (b_width_2 >= -tool && b_height_2 >= -tool) {
                    b_status_result = true;
                    part.rotation = true;
                }
            }
        } else if (!part.rotation) {
            console.log("||| !rotation |||");
            r_width_result = r_width;
            r_height_result = r_height;
            r_x_result = r_x;
            r_y_result = r_y;
            r_area_result = r_area;
            if (r_width >= -tool && r_height >= -tool) {
                r_status_result = true;
            }

            b_width_result = b_width;
            b_height_result = b_height;
            b_x_result = b_x;
            b_y_result = b_y;
            b_area_result = b_area;
            if (b_width >= -tool && b_height >= -tool) {
                b_status_result = true;
            }
        } else if (part.rotation) {
            console.log("||| rotation |||");
            r_width_result = r_width_2;
            r_height_result = r_height_2;
            r_x_result = r_x_2;
            r_y_result = r_y_2;
            r_area_result = r_area_2;
            if (r_width_2 >= -tool && r_height_2 >= -tool) {
                r_status_result = true;
            }

            b_width_result = b_width_2;
            b_height_result = b_height_2;
            b_x_result = b_x_2;
            b_y_result = b_y_2;
            b_area_result = b_area_2;
            part.rotation = true;
            if (b_width_2 >= -tool && b_height_2 >= -tool) {
                b_status_result = true;
            }
        }

        rightSpace = {
            ...spaceSheet,
            side: "right",
            type: "sheets",
            fill: r_fill,
            width: r_width_result,
            height: r_height_result,
            x: r_x_result,
            y: r_y_result,
            area: r_status_result,
        };

        bottomSpace = {
            ...spaceSheet,
            side: "bottom",
            type: "sheets",
            fill: b_fill,
            width: b_width_result,
            height: b_height_result,
            x: b_x_result,
            y: b_y_result,
            area: b_status_result,
        };

        if (r_status_result && b_status_result) {
            Object.assign(part, { x, y, used, fill });
            return { part, bottomSpace, rightSpace, spaceSheet };
        } else {
            return false;
        }
    }
}