/**
 * Generated On: 2015-10-5
 * Class: ManagerCommands
 * Description: Cette classe singleton gère les requetes/Commandes  de la scène. Ces commandes peuvent etre synchrone ou asynchrone. Elle permet d'executer, de prioriser  et d'annuler les commandes de la pile. Les commandes executées sont placées dans une autre file d'attente.
 */

define('Core/Commander/ManagerCommands', [
        'Core/Commander/Interfaces/EventsManager',
        'Globe/Globe',
        'Core/Commander/Providers/TileProvider',
        'PriorityQueue'
    ],
    function(
        EventsManager,
        Globe,
        TileProvider,
        PriorityQueue
    ) {

        var instanceCommandManager = null;

        function ManagerCommands(scene) {
            //Constructor
            if (instanceCommandManager !== null) {
                throw new Error("Cannot instantiate more than one ManagerCommands");
            }

            this.queueAsync = new PriorityQueue({
                comparator: function(a, b) {
                    var cmp = b.priority - a.priority;
                    // Prioritize recent commands
                    if (cmp == 0) {
                        return b.timestamp - a.timestamp;
                    }
                }
            });

            this.queueSync = null;
            this.loadQueue = [];
            this.providerMap = {};
            this.history = null;
            this.eventsManager = new EventsManager();
            this.currentCommandsCount = 0;
            this.maxConcurrentCommands = 16;

            if(!scene)
                throw new Error("Cannot instantiate ManagerCommands without scene");

            this.scene = scene;

        }

        ManagerCommands.prototype.constructor = ManagerCommands;

        ManagerCommands.prototype.addCommand = function(command) {
            this.queueAsync.queue(command);
        };

        ManagerCommands.prototype.addLayer = function(layer, provider) {
            this.providerMap[layer.id] = provider;
        };

        ManagerCommands.prototype.addMapProvider = function(map) {

            var tileProvider = new TileProvider(map.size,this,map.gLDebug);
            this.addLayer(map.tiles,tileProvider);

        };

        ManagerCommands.prototype.getProvider = function(layer) {
            return this.providerMap[layer.id];
        };

        ManagerCommands.prototype.commandsLength = function() {
            return this.queueAsync.length;
        };

        ManagerCommands.prototype.isFree = function() {
            return this.commandsLength()===0;
        };

        ManagerCommands.prototype.fillCommandPool = function() {

            var command;
            var that = this;
            function launchCommand(cmd) {
                var providers = that.getProviders(cmd.layer);
                for (var i = 0; i < providers.length; i++) {
                    that.currentCommandsCount++;
                    var p = providers[i].executeCommand(cmd);
                    if(p) {
                        p.then(function() {
                            that.currentCommandsCount--;
                        });
                    } else {
                        that.currentCommandsCount--;
                    }
                }
            }

            for(var i = this.currentCommandsCount; i < this.maxConcurrentCommands; i++) {
                command = this.deQueue();
                if(command){
                    launchCommand(command);
                }
            }

            return this.currentCommandsCount === 0;
        };

        ManagerCommands.prototype.getProviders = function(layer)
        {

            // TEMP
            var providers = [];
            var provider = this.providerMap[layer.id];

            if(!provider)
            {
                for(var key in layer.children)
                {
                    provider = this.providerMap[layer.children[key].id];

                    if(providers.indexOf(provider) < 0)
                        providers.push(provider);
                }

            }
            else
                providers.push(provider);

            return providers;

        };


        /**
         */
        ManagerCommands.prototype.deQueue = function() {

            while (this.queueAsync.length > 0) {
                var cmd = this.queueAsync.peek();
                var requester = cmd.requester;
                if (cmd.earlyDropFunction && cmd.earlyDropFunction(cmd)) {
                    while (requester.children.length > 0) {
                        var child = requester.children[0];
                        child.dispose();
                        requester.remove(child);
                    }
                    requester.pendingSubdivision = false;
                    this.queueAsync.dequeue();
                } else {
                    return this.queueAsync.dequeue();
                }

            }

            return undefined;
        };

        /**
         */
        ManagerCommands.prototype.removeCanceled = function() {
            //TODO: Implement Me

        };

        /**
         */
        ManagerCommands.prototype.wait = function() {
            //TODO: Implement Me
            this.eventsManager.wait();
        };

        /**
         */
        ManagerCommands.prototype.forecast = function() {
            //TODO: Implement Me

        };

        /**
         * @param object
         */
        ManagerCommands.prototype.addInHistory = function(/*object*/) {
            //TODO: Implement Me

        };

        return function(scene) {
            instanceCommandManager = instanceCommandManager || new ManagerCommands(scene);
            return instanceCommandManager;
        };

    });
