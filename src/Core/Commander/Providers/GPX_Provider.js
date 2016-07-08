/**
 * Generated On: 2016-07-07
 * Class: GPX_Provider
 * Description: Parse GPX file to get [lat, lon, alt]
 */
/* global Promise*/

define('Core/Commander/Providers/GPX_Provider', [
        'Core/Commander/Providers/Provider',
        'Core/Commander/Providers/IoDriverXML',
        'when',
        'THREE',
        'Core/Geographic/CoordCarto',
        'Renderer/BasicMaterial'
    ],
    function(
        Provider,
        IoDriverXML,
        when,
        THREE,
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

                if (result === undefined)
                    return undefined;

                console.log("  ");

                var wpt = [];
                wpt = result.getElementsByTagName("wpt");

                for (var i = 0; i < wpt.length; i++) {

                    var ele = [];
                    ele[i] = result.getElementsByTagName("ele")[i].childNodes[0].nodeValue;

                    var coords = [];
                    coords[0] = [wpt[i].attributes.lat.nodeValue,wpt[i].attributes.lon.nodeValue, ele[i]];
                        console.log(coords[0]);

                }
            }.bind(this));

        };

        return GPX_Provider;

    });

