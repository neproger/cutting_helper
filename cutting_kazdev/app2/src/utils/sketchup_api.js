/* global sketchup */

export function draw_map(array) {
    try {
        sketchup.draw_map(JSON.stringify(array));
    } catch (e) {
        console.error(e);
    }
}

export function select_entity(id) {
    try {
        sketchup.select_entity(id);
    } catch (e) {
        console.error(e);
    }
}

export function get_parts() {
    try {
        sketchup.get_parts();
    } catch (e) {
        console.error(e);
    }
}

export function post_block_bitmap(png, id, w, h) {
    try {
        sketchup.post_block_bitmap(png, id, w, h);
    } catch (e) {
        console.error(e);
    }
}

export function get_layers() {
    try {
        sketchup.get_layers();
    } catch (e) {
        console.error(e);
    }
}

export function get_settings() {
    try {
        sketchup.get_settings();
    } catch (e) {
        console.error(e);
    }
}

export function set_settings(settings) {
    try {
        sketchup.set_settings(settings);
    } catch (e) {
        console.error(e);
    }
}

export function save_material(material) {
    try {
        sketchup.save_material(material);
    } catch (e) {
        console.error(e);
    }
}

export function add_material(material) {
    try {
        sketchup.add_material(material);
    } catch (e) {
        console.error(e);
    }
} //

export function delete_material(code) {
    try {
        sketchup.delete_material(code);
    } catch (e) {
        console.error(e);
    }
}

export function set_data(type, id, name, value) {
    try {
        sketchup.set_data(type, id, name, value);
    } catch (e) {
        console.error(e);
    }
}

export function set_data_array(array) {
    try {
        sketchup.set_data_array(array);
    } catch (e) {
        console.error(e);
    }
}

export function get_file_info() {
    try {
        sketchup.get_file_info();
    } catch (e) {
        console.error(e);
    }
}
