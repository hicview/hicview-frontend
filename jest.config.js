const {defaults} = require('jest-config')
const babelSettings = require('./babel.config.js')
module.exports = {
  "rootDir": "test",
//  ...babelSettings,
  "transform": {
    // Transform js codes
    "^.+\\.jsx?$": "babel-jest",
    // Transform ts codes
    "^.+\\.tsx?$": "ts-jest"
  },
  // Mock for PIXI.js canvas
  /*

    #Developer's Notes
    --------------------
    Currently `jest-webgl-canvas-mock is the only package that supports both webgl and canvas mock, which enables us to test `PIXI.js`. For canvas only mock, it's recommended to use `jest-canvas-mock`. For webgl only mock, it's recommended to use `webgl-mock` package.
    
                         By Kevin M 2019-07-28
   */
  "setupFiles": ["jest-webgl-canvas-mock"],
  "testRegex": "(/test/.*|(\\.|/)(test|spec))\\.(ts|js)x?$",  
  moduleFileExtensions:[...defaults.moduleFileExtensions, 'ts', 'tsx']

}
