import { getDate } from "./getDate"

export function makeXml(layers, file_info) {
    var xmlData = '<?xml version="1.0"?><data><parts>';
    layers.forEach(layer => {
        if (!layer.parts) return;
        layer.parts.forEach((row, index) => {
            
            let top_thick_grinding = 0, left_thick_grinding = 0;

            const height = row.height;
            const width = row.width;

            let grinding = false;
            if (row.top_thick_grinding && row.top_thick_grinding > 0) {
                top_thick_grinding = +row.top_thick_grinding;
                grinding = true;
            } else if (layer.top_thick_grinding && layer.top_thick_grinding > 0) {
                top_thick_grinding = +layer.top_thick_grinding;
                grinding = true;
            }

            if (row.left_thick_grinding && row.left_thick_grinding > 0) {
                left_thick_grinding = +row.left_thick_grinding;
                grinding = true;
            } else if (layer.left_thick_grinding && layer.left_thick_grinding > 0) {
                left_thick_grinding = +layer.left_thick_grinding;
                grinding = true;
            }

            const quantity = "1";
            const allowRotation = row.allow_rotation ? "1" : "0";
            let label = row.label || row.id;

            let discription = "...";
            if (row.discription) {
                discription = row.discription;
            } else if (layer.discription) {
                discription = layer.discription;
            }

            if (grinding) {
                label = row.height + " x " + row.width;
            }
            const material = row.material ? row.material : layer.material || "";
            // Закатка
            const topName = row.top_name ? "x" : "";
            const topThick = "";
            const leftName = row.left_name ? "x" : "";
            const leftThick = "";
            const bottomName = row.bottom_name ? "x" : "";
            const bottomThick = "";
            const rightName = row.right_name ? "x" : "";
            const rightThick = "";

            const rowData = `
			<row>
				<length>${height}</length>
				<width>${width}</width>
				<quantity>${quantity}</quantity>
				<grain>0</grain>
				<allow_rotation>${allowRotation}</allow_rotation>
				<label>${discription}</label>
				<material>${material}</material>
				<customer>${label}</customer>
				<edge_band>
					<top_name>${topName}</top_name>
					<top_thick>${topThick}</top_thick>
					<left_name>${leftName}</left_name>
					<left_thick>${leftThick}</left_thick>
					<bottom_name>${bottomName}</bottom_name>
					<bottom_thick>${bottomThick}</bottom_thick>
					<right_name>${rightName}</right_name>
					<right_thick>${rightThick}</right_thick>
				</edge_band>
				<grinding>
					<top_thick>${top_thick_grinding}</top_thick>
					<left_thick>${left_thick_grinding}</left_thick>
					<bottom_thick>0</bottom_thick>
					<right_thick>0</right_thick>
				</grinding>
				<useit>1</useit>
			</row>
		`;

            xmlData += rowData;
        });
    });

    xmlData += "</parts></data>";

    const blob = new Blob([xmlData], { type: "application/xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    const file = file_info.file_name.split(/\./);
    link.download = file[0] + " " + getDate() + ".xml";
    link.click();

    URL.revokeObjectURL(url);
}