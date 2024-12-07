import { packer, SortStrategy, SplitStrategy, SelectionStrategy  } from 'guillotine-packer'

export async function parts_packer(sheet, parts, tool) {
    console.log('parts_packer', sheet, parts, tool)
    const typeCut = window.userSettings.typeCut;
    const tapeDepth = +window.userSettings.tapeDepth;

    var cutPieces = [];

    if (!parts) return;

    parts.forEach(stack => {
        const part = stack.part;

        var w = Math.round(part.width);
        var h = Math.round(part.height);
        if (typeCut) {
            if (part.left_name) {
                h -= tapeDepth;
            }
            if (part.right_name) {
                h -= tapeDepth;
            }
            if (part.top_name) {
                w -= tapeDepth;
            }
            if (part.bottom_name) {
                w -= tapeDepth;
            }
        }

        w += part.left_thick_grinding ? part.left_thick_grinding : 0;
        h += part.top_thick_grinding ? part.top_thick_grinding : 0;


        stack.ids.forEach(id => {
            cutPieces.push({
                name: id,
                width: w,
                height: h,
            });
        });
    })

    const requestBody = {
        binHeight: Math.round(sheet.height - (tool * 2)),
        binWidth: Math.round(sheet.width - (tool * 2)),
        items: cutPieces
    };
    const options = {
        kerfSize: tool,
        splitStrategy: SplitStrategy.LongLeftoverAxisSplit,
        selectionStrategy: SelectionStrategy.BEST_SHORT_SIDE_FIT,
        SortStrategy : SortStrategy.Differences,
        allowRotation: sheet.allow_rotation ? true : false,
    };

    const result = packer(requestBody, options);
    console.log('parts_packer result', result)
    return result
};