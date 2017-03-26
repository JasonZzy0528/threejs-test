# Clearance calculation

## Table Of Contents
- [Installation](#installation)
- [Build & Develoment](#build-&-development)
- [Deployment](#Deployment)

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
- `npm start`

## Deployment
docker
