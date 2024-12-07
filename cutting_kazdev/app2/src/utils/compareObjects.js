export function compareObjects(obj1, obj2) {
    let areEqual = true;
    const includedKeys = [
        'width',
        'height',
        'label',
        'left_name',
        'right_name',
        'top_name',
        'bottom_name',
        'discription',
        'rotation',
        'allow_rotation',
        'material',
        "hold"
    ]

    includedKeys.forEach(key => {
        if (obj1[key] === null && (obj2[key] === false || obj2[key] === "" || obj2[key] === 0)) {
            return;
        }

        if (!(key in obj1) && (obj2[key] === false || obj2[key] === "" || obj2[key] === 0)) {
            return;
        }  

        if (obj2[key] === null && (obj1[key] === false || obj1[key] === "" || obj1[key] === 0)) {
            return;
        }  

        if (!(key in obj2) && (obj1[key] === false || obj1[key] === "" || obj1[key] === 0)) {
            return;
        }        

        if (obj1[key] != obj2[key]) {
            areEqual = false;
        }
    });

    return areEqual;
}
