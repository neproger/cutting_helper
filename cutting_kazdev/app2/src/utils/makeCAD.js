
import { draw_map } from './sketchup_api'

export async function makeCAD(maps) {
    var all_maps = [...maps] || [];
    console.log('all_maps', all_maps);
    draw_map(all_maps);
}


