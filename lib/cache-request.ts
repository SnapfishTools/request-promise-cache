
// this module determines whether cache the response or not based on headers
// https://www.npmjs.com/package/http-cache-semantics
const cachePolicy = require('http-cache-semantics');
const  stealthyRequire = require('stealthy-require');
import * as request from 'request-promise-native';
const CacheBase = require('cache-base');
const cache = new CacheBase();
interface CacheValue {
    policy: any;
    response: any;
}
interface NewRequest {
    method: string;
    headers: any;
    url: string;
}



const request_promise = stealthyRequire(require.cache, function () {
    return require('request-promise-native');
});
request_promise.get = getCached

export = request_promise;

async function getCached(url: string, options?: request.RequestPromiseOptions,
    callback?: any) {
    const newRequest: NewRequest = {
        headers: options || {},
        method: 'GET',
        url,
    };
    const requestInCache = cache.get(url);
    if (requestInCache) {
        console.log(`request '${url}' found in cache.`)
        const { policy, response } = requestInCache;
        if (isCachedRequestStale(policy, newRequest)) {
            console.log('request cache is stale,validating with server...');
            // request in cache is stale, hence verify with the server
            const refreshedCacheValue = await revalidateCachedRequest(requestInCache, newRequest);
            console.log('validation is done.');
            addToCache(newRequest.url, refreshedCacheValue);
            return refreshedCacheValue.response;
        }
        response.headers = policy.responseHeaders();
        return response;
    }
    console.log(`request '${url}' was not found in cache.`)
    // request is not in cache
    const response = await requestSever(newRequest.url, newRequest.headers);
    console.log(`Received response from server.`)
    const policy = new cachePolicy(newRequest, { headers: response.headers });
    if (policy.storable()) {
        console.log('request can be cached.')
        addToCache(newRequest.url, { policy, response: response.body });
        console.log(`request '${url}' added to cache.`)
    }
    return response.body;
}

function isCachedRequestStale(policy: any, newRequest: NewRequest): any {
    return !(policy && policy.satisfiesWithoutRevalidation(newRequest))
}

async function revalidateCachedRequest(requestInCache: CacheValue, newRequest: NewRequest): Promise<CacheValue> {
    const { policy, response } = requestInCache;
    // new headers to enquire the server whether content is modified or not
    const newHeaders = policy.revalidationHeaders(newRequest)
    let serverResponse = await requestSever(newRequest.url, newHeaders).catch((error: any) => {
        if (error.statusCode !== 304) {
            throw error;
        }
        console.log('content on server is not modified');
        // content is not modified.
        serverResponse = error.response;
    });
    const { policy: updatedPolicy, modified } = policy.revalidatedPolicy(newRequest, serverResponse);
    // if content is not modified(i.e status = 304) use stale cache and update headers(like age)
    // otherwise use server response and add to cache along with new policy.
    const updatedResponse = modified ? (serverResponse && serverResponse.body) : response;
    updatedResponse.headers = updatedPolicy.responseHeaders();
    return {
        policy: updatedPolicy,
        response: updatedResponse
    }
}
async function requestSever(url: string, options: request.RequestPromiseOptions): Promise<request.FullResponse> {
    return await request.get(url,
        { resolveWithFullResponse: true, ...options, simple: false, });
}

function addToCache(key: string, value: CacheValue) {
    cache.set(key, value);
}
