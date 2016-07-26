require('Potree');

define('Scene/PointCloud',
        ['THREE',
        'Scene/Layer',
        'Potree'],
        function(THREE, Layer, Potree) {

    var potreeInstance = null;
    var loaders = [];

    function PointCloud() {
        Layer.call(this);

        Potree.pointBudget = 10*1000*1000;

        //change axis
        potreeInstance = new THREE.Object3D();

        potreeInstance.quaternion.multiply(
                new THREE.Quaternion().setFromAxisAngle(
                    new THREE.Vector3( 1, 0, 0 ), -Math.PI / 2 ));
        potreeInstance.quaternion.multiply(
                new THREE.Quaternion().setFromAxisAngle(
                    new THREE.Vector3( 0, 0, 1 ),  Math.PI ));

        this.add(potreeInstance);
    }

    PointCloud.prototype = Object.create(Layer.prototype);

    PointCloud.prototype.constructor = PointCloud;

    PointCloud.prototype.update = function(camera, renderer) {
        console.log("update");
        console.log(potreeInstance.children);
        if ( potreeInstance )
            Potree.updatePointClouds(potreeInstance.children, camera, renderer);
    };

    PointCloud.prototype.load = function(url) {
        if(url.indexOf("greyhound://") === 0)
            this.load_greyhoud(url);
        //else if(url.indexOf("cloud.js") > 0)
        //    this.load_cloud(url);
    }

    PointCloud.prototype.load_greyhoud = function(url) {
        var loader = new Potree.GreyhoundLoader();

        console.log(loader);

        loader.load(url, function(geometry) {
            var material = new THREE.PointsMaterial( { size: 10000,
                vertexColors: THREE.VertexColors } );
            var pointcloud = new Potree.PointCloudOctree(geometry, material);

            var pos = new THREE.Vector3 (4201215.424138484, 171429.945145441,
                    4785694.873914789);
            pointcloud.position.copy(pos);

            potreeInstance.add(pointcloud);

        loaders.push(loader);
	});
    }

    /*PointCloud.prototype.load_cloud = function(url) {
        var loader = new Potree.POCLoader();

        console.log(url);

        loader.load(url, function(geometry) {
            var material = new THREE.PointsMaterial( { size: 1000.0,
                vertexColors: THREE.VertexColors } );
            var pointcloud = new Potree.PointCloudOctree(geometry, material);

            var pos = new THREE.Vector3 (4201215.424138484, 171429.945145441,
                    4779194.873914789);
            pointcloud.position.copy(pos);

            potreeInstance.add(pointcloud);
        });

        loaders.push(loader);
    }*/

    return PointCloud;
});
