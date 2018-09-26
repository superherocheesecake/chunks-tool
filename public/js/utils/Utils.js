const LoadingUtils = require('./LoadingUtils.js');
const CanvasUtils = require('./CanvasUtils.js');
const TransformUtils = require('./TransformUtils.js');
const FileUtils = require('./FileUtils.js');

let Utils = {};
_.extend(Utils, LoadingUtils, CanvasUtils, TransformUtils, FileUtils);

module.exports = Utils;