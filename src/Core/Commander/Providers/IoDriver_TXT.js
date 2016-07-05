/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global */

define('Core/Commander/Providers/IoDriver_TXT', ['Core/Commander/Providers/IoDriver','when'], function(IoDriver,when) {


    function IoDriver_TXT() {
        //Constructor
        IoDriver.call(this);

    }

    IoDriver_TXT.prototype = Object.create(IoDriver.prototype);

    IoDriver_TXT.prototype.constructor = IoDriver_TXT;

    IoDriver_TXT.prototype.read = function(url) {

        return when.promise(function(resolve, reject)
        //return new Promise(function(resolve, reject)
        {
            var xhr = new XMLHttpRequest();

            xhr.open("GET", url, true);

            xhr.overrideMimeType('text/plain');

            xhr.crossOrigin = '';


            xhr.onload = function() {
                resolve(this.responseText);
            };

            xhr.onerror = function() {

                reject(Error("Error IoDriver_TXT"));

            };

            xhr.send(null);
        });

    };

    return IoDriver_TXT;

});
