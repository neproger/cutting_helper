// Создаем конструктор Packer
const Packer = function (w, h) {
    this.init(w, h);
};

// Добавляем методы к прототипу Packer
Packer.prototype = {
    init: function (w, h) {
        this.root = { x: 0, y: 0, w: w, h: h };
    },

    fit: function (blocks, tool) {
        var node;
        for (const block of blocks) {
            if (block.ok === true) continue;
            if (node = this.findNode(this.root, block.w, block.h, block.ar)) {
                block.x = node.x;
                block.y = node.y;
                block.ok = true;
                block.fit = this.splitNode(node, block, tool);
            }
        }
    },

    findNode: function (root, w, h, ar) {
        if (root.used) {
            return this.findNode(root.right, w, h, ar) || this.findNode(root.down, w, h, ar);
        } else if (ar === true) {
            if ((w <= root.w) && (h <= root.h)) {
                return root;
            } else if ((h <= root.w) && (w <= root.h)) {
                root.rotated = true;
                return root;
            }
        } else {
            if ((w <= root.w) && (h <= root.h)) {
                return root;
            }

            return null;
        }
    },

    splitNode: function (node, block, tool) {
        if (node.rotated) {
            [block.w, block.h] = [block.h, block.w];
            block.r = true;
        }
        node.used = true;
        node.down = { x: node.x, y: node.y + block.h + tool, w: node.w, h: node.h - block.h - tool };
        node.right = { x: node.x + block.w + tool, y: node.y, w: node.w - block.w - tool, h: block.h };
        return node;
    }
};

// Экспортируем Packer
export default Packer;
