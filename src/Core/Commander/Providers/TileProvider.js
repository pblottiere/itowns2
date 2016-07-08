/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * A Faire
 * Les tuiles de longitude identique ont le maillage et ne demande pas 1 seule calcul pour la génération du maillage
 *
 *
 *
 *
 */



define('Core/Commander/Providers/TileProvider', [
        'when',
        'THREE',
        'Core/Geographic/Projection',
        'Core/Commander/Providers/WMTS_Provider',
        'Core/Commander/Providers/KML_Provider',
        'Globe/TileGeometry',
        'Core/Geographic/CoordWMTS',
        'Core/Math/Ellipsoid',
        'Globe/BuilderEllipsoidTile',
        'Core/defaultValue',
        'Scene/BoundingBox',
        'Core/Commander/Providers/GPX_Provider'
    ],
    function(
        when,
        THREE,
        Projection,
        WMTS_Provider,
        KML_Provider,
        TileGeometry,
        CoordWMTS,
        Ellipsoid,
        BuilderEllipsoidTile,
        defaultValue,
        BoundingBox,
        GPX_Provider
    ) {

        function TileProvider(size,gLDebug) {
            //Constructor

            this.projection = new Projection();
            this.providerWMTS = new WMTS_Provider({support : gLDebug});
            this.ellipsoid = new Ellipsoid(size);
            this.providerKML = new KML_Provider(this.ellipsoid);
            this.providerGPX = new GPX_Provider(this.ellipsoid);
            this.builder = new BuilderEllipsoidTile(this.ellipsoid,this.projection);

            this.providerElevationTexture = this.providerWMTS;
            this.providerColorTexture = this.providerWMTS;

            this.cacheGeometry = [];
            this.tree = null;
            this.nNode = 0;

        }

        TileProvider.prototype.constructor = TileProvider;

        TileProvider.prototype.getGeometry = function(bbox, cooWMTS) {
            var geometry = undefined;
            var n = Math.pow(2, cooWMTS.zoom + 1);
            var part = Math.PI * 2.0 / n;

            if (this.cacheGeometry[cooWMTS.zoom] !== undefined && this.cacheGeometry[cooWMTS.zoom][cooWMTS.row] !== undefined) {
                geometry = this.cacheGeometry[cooWMTS.zoom][cooWMTS.row];
            } else {
                if (this.cacheGeometry[cooWMTS.zoom] === undefined)
                    this.cacheGeometry[cooWMTS.zoom] = new Array();

                var precision = 16;
                var rootBBox = new BoundingBox(0, part + part * 0.01, bbox.minCarto.latitude, bbox.maxCarto.latitude);

                geometry = new TileGeometry(rootBBox, precision, this.ellipsoid, cooWMTS.zoom);
                this.cacheGeometry[cooWMTS.zoom][cooWMTS.row] = geometry;

            }

            return geometry;
        };

        // 52.0.2739.0 dev (64-bit)
       // TileProvider.prototype.getKML= function(){

        TileProvider.prototype.getKML= function(tile){

            if(tile.link.layer.visible && tile.level  === 16)
            {
                var longitude   = tile.bbox.center.x / Math.PI * 180 - 180;
                var latitude    = tile.bbox.center.y / Math.PI * 180;

                return this.providerKML.loadKMZ(longitude, latitude).then(function (collada){

                    if(collada && tile.link.children.indexOf(collada) === -1)
                    {
                            tile.link.add(collada);
                            tile.content = collada;
                    }

                }.bind(this));
            }
        };

        TileProvider.prototype.getGPX = function(tile,url){
           if(/*tile.link.layer.visible &&*/ tile.level  === 16)
            {
                return this.providerGPX.parseGPX(url).then(function (gpx){

                    if(gpx && tile.link.children.indexOf(gpx) === -1)
                    {
                            tile.link.add(gpx);
                            tile.content = gpx;
                    }

                }.bind(this));
            }
       };

        TileProvider.prototype.executeCommand = function(command) {

            var bbox = command.paramsFunction.bbox;

            // TODO not generic
            var tileCoord = this.projection.WGS84toWMTS(bbox);
            var parent = command.requester;

            // build tile
            var geometry = undefined; //getGeometry(bbox,tileCoord);

            var params = {bbox:bbox,zoom:tileCoord.zoom,segment:16,center:null,projected:null}

            var tile = new command.type(params,this.builder);

            tile.tileCoord = tileCoord;
            tile.material.setUuid(this.nNode++);
            tile.link = parent.link;
            tile.geometricError = Math.pow(2, (18 - tileCoord.zoom));

            if (geometry) {
                tile.rotation.set(0, (tileCoord.col % 2) * (Math.PI * 2.0 / Math.pow(2, tileCoord.zoom + 1)), 0);
            }

            parent.worldToLocal(params.center);

            tile.position.copy(params.center);
            tile.setVisibility(false);

            parent.add(tile);
            tile.updateMatrix();
            tile.updateMatrixWorld();

            var map = command.paramsFunction.layer.parent;
            var elevationServices = map.elevationTerrain.services;
            var colorServices = map.colorTerrain.services;

            tile.WMTSs = [];

            // TODO passer mes layers colors?
            var paramsColor = [];

            for (var i = 0; i < colorServices.length; i++)
            {
                var layer = map.colorTerrain.children[i];
                var tileMT = this.providerColorTexture.layersWMTS[colorServices[i]].tileMatrixSet;

                if(!tile.WMTSs[tileMT])
                    tile.WMTSs[tileMT] = this.projection.getCoordWMTS_WGS84(tile.tileCoord, tile.bbox,tileMT);

                 paramsColor[i] = {visible:layer.visible ? 1 : 0,opacity:layer.opacity || 1.0};
            }

            var requests = [

                    this.providerElevationTexture.getElevationTexture(tile,elevationServices).then(function(terrain){

                        this.setTextureElevation(terrain);}.bind(tile)),

                    this.providerColorTexture.getColorTextures(tile,colorServices,paramsColor).then(function(colorTextures){

                        this.setTexturesLayer(colorTextures,1);}.bind(tile))

                    ,this.getKML(tile),
                    this.getGPX(tile,"http://rks1306w175.ign.fr/ULTRA2009.gpx")

                ];

            return when.all(requests).then(function() {
                return command.resolve(tile);
            });
        };

        return TileProvider;

    });
