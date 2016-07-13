define('Core/Commander/Providers/PotreeProvider',
        ['THREE',
        './Potree/POCLoader',
        './Potree/PointCloudOctree'],
        function(THREE,
            POCLoader,
            PointCloudOctree) {

    var sceneInstance  = null;
    var potreeInstance = null;
    var PotreeProvider = function (scene)
    {
        this.loader = new POCLoader();
        sceneInstance = scene;

        this.loader.load("resources/stereotest/cloud.js", function(geometry){
            var material = new THREE.PointsMaterial( { size: 1, vertexColors: THREE.VertexColors } );
            var pointcloud = new PointCloudOctree(geometry, material);

            var bottomLeft = new THREE.Vector3 (4201215.424138484, 171429.945145441, 4779294.873914789);
            pointcloud.position.copy(bottomLeft);

            //change axis
            potreeInstance = new THREE.Object3D();

            potreeInstance.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI / 2 ));
            potreeInstance.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ),  Math.PI ));

            potreeInstance.add(pointcloud);

            sceneInstance.add(potreeInstance);
	});

    };

    PotreeProvider.prototype.getPotree = function() {
        if(potreeInstance)
            return potreeInstance.children[0];
        else
            return undefined;
    };

    return PotreeProvider;
});
