define(['THREE', './workers', './PointAttributeNames', './Version'],
	function(THREE, workers, PointAttributeNames, Version) {

function networkToNative(val) {
    return ((val & 0x00FF) << 24) |
           ((val & 0xFF00) <<  8) |
           ((val >> 8)  & 0xFF00) |
           ((val >> 24) & 0x00FF);
}

GreyhoundBinaryLoader = function(version, boundingBox, scale){
    console.log("GreyhoundBinaryLoader.cst");
	if(typeof(version) === "string"){
		this.version = new Version(version);
	}else{
		this.version = version;
	}

	this.boundingBox = boundingBox;
	this.scale = scale;
};

GreyhoundBinaryLoader.prototype.load = function(node){
    console.log("GreyhoundBinaryLoader.load");
	if(node.loaded){
		return;
	}

	var scope = this;

	var url = node.getURL();

	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'arraybuffer';
	xhr.overrideMimeType('text/plain; charset=x-user-defined');
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4) {
			if (xhr.status === 200 || xhr.status === 0) {
				var buffer = xhr.response;
				scope.parse(node, buffer);
			} else {
				console.log('Failed to load file! HTTP status: ' + xhr.status + ", file: " + url);
			}
		}
	};
	try{
		xhr.send(null);
	}catch(e){
		console.log("error loading point cloud: " + e);
	}
};

GreyhoundBinaryLoader.prototype.parse = function(node, buffer){
    console.log("GreyhoundBinaryLoader.parse");
	var NUM_POINTS_BYTES = 4;
	var NUM_POINTS_BYTE_SIZE = 4;

    var view = new DataView(
            buffer, buffer.byteLength - NUM_POINTS_BYTES, NUM_POINTS_BYTES);
    var numPoints = networkToNative(view.getUint32(0));
	var pointAttributes = node.pcoGeometry.pointAttributes;

    node.numPoints = numPoints;
    console.log("numPoints from read:");
    console.log(node.numPoints);


	var ww = workers.greyhoundBinaryDecoder.getWorker();
	ww.onmessage = function(e){
		var data = e.data;

		console.log("tight bounding box");
		console.log(data.tightBoundingBox.min);
		console.log(data.tightBoundingBox.max);

		var buffers = data.attributeBuffers;
		var tightBoundingBox = new THREE.Box3(
			new THREE.Vector3().fromArray(data.tightBoundingBox.min),
			new THREE.Vector3().fromArray(data.tightBoundingBox.max)
		);

		console.log("GreyhoundBinaryLoader.prototype.parse 0");
		workers.greyhoundBinaryDecoder.returnWorker(ww);

		var geometry = new THREE.BufferGeometry();

		for(var property in buffers){
			if(buffers.hasOwnProperty(property)){
				var buffer = buffers[property].buffer;
				var attribute = buffers[property].attribute;
				var numElements = attribute.numElements;
				console.log("numElements");
				console.log(numElements);

				if(parseInt(property) === PointAttributeNames.POSITION_CARTESIAN){
					geometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array(buffer), 3));
					console.log(geometry);
				}else if(parseInt(property) === PointAttributeNames.COLOR_PACKED){
					geometry.addAttribute("color", new THREE.BufferAttribute(new Float32Array(buffer), 3));
				}else if(parseInt(property) === PointAttributeNames.INTENSITY){
					geometry.addAttribute("intensity", new THREE.BufferAttribute(new Float32Array(buffer), 1));
				}else if(parseInt(property) === PointAttributeNames.CLASSIFICATION){
					geometry.addAttribute("classification", new THREE.BufferAttribute(new Float32Array(buffer), 1));
				}else if(parseInt(property) === PointAttributeNames.NORMAL_SPHEREMAPPED){
					geometry.addAttribute("normal", new THREE.BufferAttribute(new Float32Array(buffer), 3));
				}else if(parseInt(property) === PointAttributeNames.NORMAL_OCT16){
					geometry.addAttribute("normal", new THREE.BufferAttribute(new Float32Array(buffer), 3));
				}else if(parseInt(property) === PointAttributeNames.NORMAL){
					geometry.addAttribute("normal", new THREE.BufferAttribute(new Float32Array(buffer), 3));
				}
			}
		}
		geometry.addAttribute("indices", new THREE.BufferAttribute(new Float32Array(data.indices), 1));

		if(!geometry.attributes.normal){
			var buffer = new Float32Array(numPoints*3);
			geometry.addAttribute("normal", new THREE.BufferAttribute(new Float32Array(buffer), 3));
		}

		geometry.boundingBox = node.boundingBox;
		node.geometry = geometry;
		node.tightBoundingBox = tightBoundingBox;
		node.loaded = true;
		node.loading = false;
		node.pcoGeometry.numNodesLoading--;
	};

	var message = {
		buffer: buffer,
		pointAttributes: pointAttributes,
		version: this.version.version,
        schema: node.pcoGeometry.schema,
		min: [ node.boundingBox.min.x, node.boundingBox.min.y, node.boundingBox.min.z ],
		max: [ node.boundingBox.max.x, node.boundingBox.max.y, node.boundingBox.max.z ],
		offset: [node.pcoGeometry.offset.x, node.pcoGeometry.offset.y, node.pcoGeometry.offset.z],
		bbOffset: [node.pcoGeometry.bbOffset.x, node.pcoGeometry.bbOffset.y, node.pcoGeometry.bbOffset.z],
		scale: this.scale
	};

	console.log(message);

	ww.postMessage(message, [message.buffer]);

};

return GreyhoundBinaryLoader;

});
