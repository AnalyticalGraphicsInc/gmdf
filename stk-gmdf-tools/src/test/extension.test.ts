//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import { suite, it } from 'mocha';
import * as gmdfExtension from '../extension';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
suite('Extension Tests', function () {

    // Defines a Mocha unit test
    it('can clear metadata', function() {
        let test = {
            nodes: [{
                name: "node1",
                extensions: {
                    AGI_articulations: {
                        isAttachPoint: true
                    }
                }
            }],
            extensionsUsed: [
                "AGI_articulations"
            ]
        };

        let expected = {
            nodes: [{
                name: "node1"
            }]
        };

        let actual = gmdfExtension.removeEmbeddedData(test);
        assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });
});
