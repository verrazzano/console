// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

/*jshint -W020 */
/*jshint -W117 */
// globals
const requirejs = require('requirejs');
require('amd-loader');
require('ts-node').register({lazy: true});

var glob = require('glob').sync

function gatherAllTestFiles() {
    // gather test files 
    var filePatterns = [
        'integtest/*.spec.ts'
    ];

    return filePatterns.map(function(pattern){
        return glob(pattern);
    }).flat();
}

function runMocha() {
    // mocha
    const classMocha = require('mocha');
    const testUtils = require('./utils/Utils');
    // const mocha = new classMocha({rootHooks: {beforeAll: testUtils.Utils.navigateAndLogin}});
    const mocha = new classMocha();
    mocha.reporter('spec').ui('bdd');
    const allTestFiles = gatherAllTestFiles();
    allTestFiles.forEach(function(file){
        mocha.addFile(file);
    });
    console.log("Running mocha");
    mocha.timeout(30000);
    // --file ./test/setup-elastic.js
    mocha.run();
}

runMocha();

