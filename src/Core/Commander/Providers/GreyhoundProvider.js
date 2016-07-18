define('Core/Commander/Providers/GreyhoundProvider',
        ['THREE',
        './Potree/GreyhoundLoader',
        './Potree/PointCloudOctree'],
        function(THREE,
            GreyhoundLoader,
            PointCloudOctree) {

    var sceneInstance  = null;
    var potreeInstance = null;
    var GreyhoundProvider = function (scene)
    {
        this.loader = new GreyhoundLoader();
        sceneInstance = scene;

        this.loader.load("greyhound://192.168.1.19:5000/greyhound/", function(geometry) {
            console.log("loader.load!!!!!");
            var material = new THREE.PointsMaterial( { size: 1000000, vertexColors: THREE.VertexColors } );
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

    GreyhoundProvider.prototype.getObject = function() {
        if(potreeInstance)
            return potreeInstance.children[0];
        else
            return undefined;
    };

    return GreyhoundProvider;
});
