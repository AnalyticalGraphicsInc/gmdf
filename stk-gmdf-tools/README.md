# GMDF Extension for Visual Studio Code

[![GitHub issues](https://img.shields.io/github/issues/AnalyticalGraphicsInc/gmdf.svg)](https://github.com/AnalyticalGraphicsInc/gmdf/issues) [![GitHub license](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/AnalyticalGraphicsInc/gltf-vscode/blob/master/stk-gmdf-tools/LICENSE.md)

The glTF Metadata File (GMDF) for Systems Tool Kit (STK) provides a means of conveying metadata about a glTF file, outside of that file.  This is done so that 3D models can be re-exported and overwritten by the content creation tools that are used to author them, without overwriting the metadata.

See the [GMDF repository on GitHub](https://github.com/AnalyticalGraphicsInc/gmdf) for more information.

## Features

This VSCode extension provides:

### JSON schema validation of `*.gmdf` files.

This offers hover tooltips for property descriptions, auto-complete (<kbd>CTRL</kbd> + <kbd>space</kbd>) for suggested property names, and validation of required fields.

### Editor command `Inject GMDF into glTF`

With a glTF file open for edit, run this command by pressing <kbd>F1</kbd> and typing the first part of the name of the command, `Inject GMDF into glTF`.  It will look for a `*.gmdf` file in the same folder as the glTF file, read its contents, and insert them into the glTF file using glTF extension(s).  Note this will re-format the JSON of your glTF file in the process.

The result is left in the editor, but not saved to disk unless you save it.  You can also use the text editor's undo function to undo this action.

### Editor command `Extract GMDF from glTF`

With a glTF file open for edit, run this command by pressing <kbd>F1</kbd> and typing the first part of name of this command, `Extract GMDF from glTF`.  It will pop open a "Save File" dialog to ask to save the new GMDF file.  The result is written to disk, and then opened for edit.

## Sample models

There are some [sample models](https://github.com/AnalyticalGraphicsInc/gmdf/blob/master/samples/) available that use gmdf, alongside ones that use the corresponding glTF extensions.

## Source code

on [GitHub](https://github.com/AnalyticalGraphicsInc/gmdf/blob/master/stk-gmdf-tools/).  See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Apache 2.0, see [LICENSE.md](LICENSE.md).

## Release Notes

See [CHANGELOG.md](CHANGELOG.md).
