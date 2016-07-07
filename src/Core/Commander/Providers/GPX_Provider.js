/**
 * Generated On: 2016-07-07
 * Class: GPX_Provider
 * Description: Inserting GPX files in the scene
 */
/* global Promise*/
//
//define('Core/Commander/Providers/GPX_Provider', [
//        'Core/Commander/Providers/Provider',
//        'Core/Commander/Providers/IoDriverGPX',
//        'when',
//        'THREE',
//        'Scene/BoundingBox',
//        'Core/Geographic/CoordCarto',
//        'Renderer/BasicMaterial'
//    ],
//    function(
//        Provider,
//        IoDriverGPX,
//        when,
//        THREE,
//        BoundingBox,
//        CoordCarto,
//        BasicMaterial
//    ) {
//
//
//        function GPX_Provider(url) {
//            //Constructor
//            this.ioDriverGPX = new IoDriverGPX(url);
//        }
//
//        GPX_Provider.prototype = Object.create(Provider.prototype);
//
//        GPX_Provider.prototype.constructor = GPX_Provider;
//
//        GPX_Provider.prototype.parseGPX = function(url) {
//            return this.ioDriverGPX.load(url).then(function(result){
//                console.log(result);
//            });
//        };
//
//        return GPX_Provider;
//
//    });


define('Core/Commander/Providers/GPX_Provider', [
        'Core/Commander/Providers/Provider',
        'Core/Commander/Providers/IoDriverXML',
        'when',
        'THREE',
        'Scene/BoundingBox',
        'Renderer/ThreeExtented/KMZLoader',
        'Core/Geographic/CoordCarto',
        'Renderer/BasicMaterial'
    ],
    function(
        Provider,
        IoDriverXML,
        when,
        THREE,
        BoundingBox,
        KMZLoader,
        CoordCarto,
        BasicMaterial
    ) {


        function GPX_Provider(ellipsoid) {
            //Constructor
            this.ellipsoid = ellipsoid;
            this.ioDriverGPX = new IoDriverXML();
            this.cache = [];
        }

        GPX_Provider.prototype = Object.create(Provider.prototype);

        GPX_Provider.prototype.constructor = GPX_Provider;

        GPX_Provider.prototype.parseGPX = function(urlFile) {

            return this.ioDriverGPX.read(urlFile).then(function(result) {
                console.log(result);

                var wpt = [];
                wpt = result.getElementsByTagName("wpt");
                    console.log(wpt);

                for (var i = 0; i < wpt.length; i++) {

                    var coords = [];
                    coords[0] = [wpt[i].attributes.lat.nodeValue,wpt[i].attributes.lon.nodeValue];
                        console.log(coords[0]);

                }
            }.bind(this));

        };

        return GPX_Provider;

    });

