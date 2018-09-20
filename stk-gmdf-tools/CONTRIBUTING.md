Thanks for contributing to stk-gmdf-tools!

Contributions to this repository should follow the same general guidelines as [the main Cesium CONTRIBUTING guide](https://github.com/AnalyticalGraphicsInc/cesium/blob/master/CONTRIBUTING.md).

## Contributor License Agreement (CLA)

Before we can merge a pull request, we require a signed Contributor License Agreement.  There is a CLA for:

* [individuals](https://github.com/AnalyticalGraphicsInc/cesium/blob/master/Documentation/Contributors/CLAs/individual-cla-agi-v1.0.txt) and
* [corporations](https://github.com/AnalyticalGraphicsInc/cesium/blob/master/Documentation/Contributors/CLAs/corporate-cla-agi-v1.0.txt).

This only needs to be completed once, and enables contributions to all of the projects under the [Analytical Graphics Inc](https://github.com/AnalyticalGraphicsInc) organization.  The CLA ensures you retain copyright to your contributions, and provides us the right to use, modify, and redistribute your contributions using the [Apache 2.0 License](LICENSE.md).

Please email a completed CLA with all fields filled in to [cla@agi.com](mailto:cla@agi.com).  Related questions are also welcome.

## Developer Environment

[VSCode](https://code.visualstudio.com/) itself is used for developing and debugging its own extensions.

You will also need [NodeJS](https://nodejs.org/en/) installed, for npm package management.

1. Use `git` to clone this repository to a local disk.
2. Open a shell and run `npm install` in the `stk-gmdf-tools` folder of the cloned repository, to install npm packages.
3. Launch VSCode and click "Open Folder" on the `stk-gmdf-tools` folder of the cloned repository.

To launch the debugger, press <kbd>F5</kbd>.  This will open a second copy of VSCode, with a built-from-source version of
the extension installed.  If you already have this extension from the marketplace installed, there will be an info message
letting you know that the built version has overwritten it for just the debugger session.

## CHANGELOG.md

Please add bullet point(s) for changes or new features to the top of `CHANGELOG.md`.  The publish date can be left as `UNRELEASED` since
the release is not on any set schedule, and likely will not happen on the same day that the pull request is created.

## Code of Conduct

To ensure an inclusive community, contributors and users in the Cesium community should follow the [code of conduct](./CODE_OF_CONDUCT.md).
