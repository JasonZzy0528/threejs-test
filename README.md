# Clearance calculation

## Table Of Contents
- [Installation](#installation)
- [Build & Develoment](#build-&-development)
- [Deployment](#deployment)

## Installation
`npm install`

## Build & Development
For generate front-end:
- Dev mode: `gulp serve`

For generate server-side clearance calculation:
- create './calculation/db/dbConfig.json' with following format:
```json
{
  "user": "user",
  "database": "database",
  "password": "password",
  "host": "localhost",
  "port": 35432
}
```
- To run server-side calculation:
  - command line:  "node jsfile pole_ids_array catenaries_start_and_end_ids point_to_get_intersection"
  - command line example :
  ```
  node ./calculation/calculation.js "[116449646802843, 102443810998013]" "[102443810998013, 116449646802843]" "[0,0,0]"
  ```
  - intersection will be print out at console likes :
  ```code
  THREE.WebGLRenderer 84
  THREE.WebGLRenderer: TypeError: _canvas.addEventListener is not a function
  THREE.WebGLRenderer: WEBGL_depth_texture extension not supported.
  THREE.WebGLRenderer: OES_texture_float extension not supported.
  THREE.WebGLRenderer: OES_texture_float_linear extension not supported.
  THREE.WebGLRenderer: OES_texture_half_float extension not supported.
  THREE.WebGLRenderer: OES_texture_half_float_linear extension not supported.
  THREE.WebGLRenderer: OES_standard_derivatives extension not supported.
  THREE.WebGLRenderer: ANGLE_instanced_arrays extension not supported.
  THREE.WebGLRenderer: OES_element_index_uint extension not supported.
  [ Vector3 {
    x: 1746234.3927937532,
    y: 5912667.490510127,
    z: 126.54973231720744 } ]
  ```

  ## Deployment
  docker
