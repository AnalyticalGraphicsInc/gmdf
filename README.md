# The `*.gmdf` file

The glTF Metadata File (GMDF) for Systems Tool Kit (STK)

## Contributors

* Greg Beatty, Analytical Graphics, Inc.
* Ed Mackey, Analytical Graphics, Inc.
* Alex Wood, Analytical Graphics, Inc.

## Status

Draft

## Dependencies

Written against the [glTF 2.0 spec](https://github.com/KhronosGroup/glTF), with the [`AGI_articulations`](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/AGI_articulations) and [`AGI_stk_metadata`](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/AGI_stk_metadata) extensions applied.

## Overview

The [`AGI_articulations`](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/AGI_articulations) and [`AGI_stk_metadata`](https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/AGI_stk_metadata) glTF 2.0 vendor extensions supply a number of different kinds of metadata to help with analysis of physical objects represented by glTF models.  As an alternative to supplying this metadata as extensions within a glTF file, the same metadata can also be supplied in an external file with the `*.gmdf` file extension, with the same path and base filename as the associated `*.gltf` or `*.glb` file.  One purpose of this is to allow the model author to iterate on their model, re-exporting it from a 3D authoring package or content pipeline to produce new versions of the model without overwriting the existing metadata.  Optionally, once the model is finalized, the metadata can then be moved into the glTF's JSON structure as extensions, and the external file deleted.

In the case where an external file and embedded metadata both exist for the same model, the embedded metadata are ignored and only the external file is used.  This allows an analyst to adjust or override metadata without needing to edit a glb file that may itself already contain metadata.

When the external file is used, an extra property `modelNodes` becomes available to articulations and solar panel groups, to associate the contents of the file with named glTF nodes.  In the case of attach points, the node names are called out directly with a list of strings, as shown below.

Nodes are referenced by name, not index number as is typical within a glTF file's internals.  This means that the normally optional node names are required for this external-file usage pattern.  But the advantage is that it allows the model to be modified and retrace its steps through the content production pipeline, possibly re-ordering and re-indexing the contained nodes, without breaking the association with articulations, attach points, and solar panel groups.

The following is an example of the contents of a `*.gmdf` file, that would be valid when placed next to a `*.gltf` or `*.glb` file of the same base filename, when that model contains named glTF nodes matching the names supplied here: `"Antenna-Node"`, `"Vehicle-Node"`, and `"SolarPanels-Node"`.

```json
{
    "AGI_articulations": {
        "attachPoints": [
            "Antenna-Node"
        ],
        "articulations": [
            {
                "name": "Vehicle",
                "modelNodes": [
                    "Vehicle-Node"
                ],
                "stages": [
                    {
                        "name": "MoveX",
                        "type": "xTranslate",
                        "minimumValue": -1000.0,
                        "maximumValue": 1000.0,
                        "initialValue": 0.0
                    },
                    {
                        "name": "Size",
                        "type": "uniformScale",
                        "minimumValue": 0.0,
                        "maximumValue": 1.0,
                        "initialValue": 1.0
                    }
                ]
            }
        ]
    },
    "AGI_stk_metadata": {
        "solarPanelGroups": [
            {
                "name": "Panel1",
                "efficiency": 14.0,
                "modelNodes": [
                    "SolarPanels-Node"
                ]
            }
        ]
    }
}
```

## gmdf Ancillary File Schema

- **gmdf external file JSON schema**: [gmdf.schema.json](schema/gmdf.schema.json)

## Known Implementations

* [STK (Systems Tool Kit)](https://www.agi.com/products/engineering-tools) version 11.5 and higher
