# Clearance calculation

## Table Of Contents
- [Installation](#installation)
- [Build & Develoment](#build--development)
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
  - clearance:  ```$ node calculation.js ${projectId} ${circuitId}}```
  - bush fire risk area: ```$ node bush_calculation.js ${projectId} ${circuitId}}```
  - command line example :
```
$ node calculation.js 150205403579429 150215238968366
$ node calculation.js 154543648056821 154544010327544
$ node bush_calculation.js 154543648056821 154544010327544
```

## Deployment
