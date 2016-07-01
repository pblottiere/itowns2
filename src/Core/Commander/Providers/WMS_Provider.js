/**
 * Generated On: 2015-10-5
 * Class: WMS_Provider
 * Description: Provides data from a WMS stream
 */


define('Core/Commander/Providers/WMS_Provider', [
        'Core/Commander/Providers/Provider',
        'Core/Commander/Providers/IoDriver_XBIL',
        'Core/Commander/Providers/IoDriver_Image',
        'Core/Commander/Providers/IoDriverXML',
        'when',
        'Core/defaultValue',
        'THREE',
        'Core/Commander/Providers/CacheRessource'
    ],
    function(
        Provider,
        IoDriver_XBIL,
        IoDriver_Image,
        IoDriverXML,
        when,
        defaultValue,
        THREE,
        CacheRessource) {

        /**
         * Return url wmts MNT
         * @param {String} options.url: service base url
         * @param {String} options.layer: requested data layer
         * @param {String} options.format: image format (default: format/jpeg)
         * @returns {Object@call;create.url.url|String}
         */
        function WMS_Provider(options) {
            //Constructor

            Provider.call(this, new IoDriver_XBIL());
            this.cache = CacheRessource();
            this.ioDriverImage = new IoDriver_Image();
            this.ioDriverXML = new IoDriverXML();
            
            this.layersWMS = [];
            
            this._ready       = false;
        }

        WMS_Provider.prototype = Object.create(Provider.prototype);

        WMS_Provider.prototype.constructor = WMS_Provider;
        
        WMS_Provider.prototype.url = function(coord) {
            
                var bbox = coord.minCarto.longitude + "," + coord.minCarto.latitude + "," +
                           coord.maxCarto.longitude + "," + coord.maxCarto.latitude;
                var url = this._url + '&bbox=' + bbox + '&crs=' + this._crs;
                return url;    
        };                    

        WMS_Provider.prototype.addLayer = function(layer){
            if(!layer.name)
                throw new Error('layerName is required.');
            
            this._baseUrl = layer.url;
            this._layerName = layer.name;
            this._format = defaultValue(layer.mimeType, "image/png");
            this._crs = defaultValue(layer.projection, "EPSG:4326");
            this._width = defaultValue(layer.heightMapWidth, 256);
            this._version = defaultValue(layer.version, "1.3.0");
            this._styleName = defaultValue(layer.style, "normal");

            this._url =   this._baseUrl + 
                          '?SERVICE=WMS&REQUEST=GetMap&layers=' + this._layerName + 
                          '&version=' + this._version + 
                          '&styles=' + this._styleName +
                          '&format=' + this._format;
                  
            var maxZoom = layer.maxLevel;
            var minZoom = 0;
            
            this.layersWMS[layer.id] = {
                    customUrl: this._url,
                    mimetype:  this._format,
                    zoom:{min:minZoom,max:maxZoom},
                    fx : layer.version || 0.0
                };      
        };

        WMS_Provider.prototype.executeCommand = function(){
            console.log("executeCommandWMS");
        };
        /**
         * Return url wms IR coverage
         * ex url: http://realearth.ssec.wisc.edu/api/image?products=globalir&bounds=-85,-178,85,178&width=1024&height=512
         * We can also specify time of coverage image like &time=2016-02-12+10:42
         * @param {type} coWMS
         * @returns {Object@call;create.urlOrtho.url|String}
         */
        WMS_Provider.prototype.urlGlobalIR = function(coWMS) {
            var latBound = coWMS.latBound || new THREE.Vector2(-85, 85);
            var longBound = coWMS.longBound || new THREE.Vector2(-178, 178);

            var width = coWMS.width || 1024;
            var height = coWMS.height || 512;

            var urlBaseService = "http://realearth.ssec.wisc.edu/api/image?products=globalir&bounds=";

            // URL for all globe  IR imagery
            var url = urlBaseService + latBound.x + "," + longBound.x + "," + latBound.y + "," + longBound.y +
                "&width=" + width + "&height=" + height;


            //"http://realearth.ssec.wisc.edu/api/image?products=globalir_20160212_080000&"+
            //"x="+coWMS.col+"&y="+coWMS.row+"&z=" + coWMS.zoom;
            return url;


        };

                /**
         * Returns the url for a WMS query with the specified bounding box
         * @param {BoundingBox} bbox: requested bounding box
         * @returns {Object@call;create.url.url|String}
         */
        WMS_Provider.prototype.urlClouds = function(bbox) {
            var url = this.baseUrl + "?LAYERS=" + this.layer + "&FORMAT=" + this.format +
                "&SERVICE=WMS&VERSION=1.1.1" + "&REQUEST=GetMap&BBOX=" +
                bbox.minCarto.longitude + "," + bbox.minCarto.latitude + "," +
                bbox.maxCarto.longitude + "," + bbox.maxCarto.latitude +
                "&WIDTH=" + this.width + "&HEIGHT=" + this.height + "&SRS=" + this.srs;
            return url;
        };


        /**
         * Returns a texture from the WMS stream with the specified bounding box
         * @param {BoundingBox} bbox: requested bounding box
         * @returns {WMS_Provider_L15.WMS_Provider.prototype@pro;_IoDriver@call;read@call;then}
         */
        WMS_Provider.prototype.getTexture = function(bbox) {

            if (bbox === undefined)
                return when(-2);

            var url = this.url(bbox);

            var textureCache = this.cache.getRessource(url);

            if (textureCache !== undefined)
                return when(textureCache);
            return this.ioDriverImage.read(url).then(function(image) {
                var result = {};
                result.texture = new THREE.Texture(image);
                result.texture.generateMipmaps = false;
                result.texture.magFilter = THREE.LinearFilter;
                result.texture.minFilter = THREE.LinearFilter;
                result.texture.anisotropy = 16;

                this.cache.addRessource(url, result.texture);
                return result.texture;

            }.bind(this));
        };

        return WMS_Provider;

    });
