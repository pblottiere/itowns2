/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global */

define('Core/Commander/Providers/IoDriverGPX', ['Core/Commander/Providers/IoDriver', 'when'], function(IoDriver, when) {


    function IoDriverGPX() {
        //Constructor
        IoDriver.call(this);

    }

    IoDriverGPX.prototype = Object.create(IoDriver.prototype);

    IoDriverGPX.prototype.constructor = IoDriverGPX;

    IoDriverGPX.prototype.read = function(url) {


        return when.promise(function(resolve, reject)
        //return new Promise(function(resolve, reject)
        {
            var xhr = new XMLHttpRequest();

            xhr.open("GET", url, true);

            xhr.responseType = "document";

            xhr.crossOrigin = '';

            xhr.onload = function() {

                resolve(this.response);

            };

            xhr.onerror = function() {

                reject(Error("Error IoDriverGPX"));

            };

            xhr.send(null);
        });

    };

    return IoDriverGPX;

});
