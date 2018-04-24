
// this module determines whether cache the response or not based on headers
// https://www.npmjs.com/package/http-cache-semantics
const cachePolicy = require('http-cache-semantics');
const stealthyRequire = require('stealthy-require');
import * as request from 'request-promise-native';
import request1 = require('request');

declare const requestPromise: request1.RequestAPI<request.RequestPromise, request.RequestPromiseOptions, request1.RequiredUriUrl>;
export = requestPromise;
