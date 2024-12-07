export function makeMaterialsXml(materials) {
    var xmlData = '<?xml version="1.0"?><data><stock>';

    materials.forEach((row, index) => {
        const rowData = `
			<row>
				<length>${row.height}</length>
				<width>${row.width}</width>
				<quantity>1000</quantity>
				<grain>0</grain>
				<label>${row.name}</label>
				<material>${row.code}</material>
				<trim>
                    <top_thick>0</top_thick>
                    <left_thick>0</left_thick>
                    <bottom_thick>0</bottom_thick>
                    <right_thick>0</right_thick>
                </trim>
                <price>0.000000</price>
			    <priority>0</priority>
				<useit>1</useit>
			</row>
		`;
        xmlData += rowData;
    });

    xmlData += "</stock></data>";

    const blob = new Blob([xmlData], { type: "application/xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    
    link.download = "stock2d.xml";
    link.click();

    URL.revokeObjectURL(url);
}