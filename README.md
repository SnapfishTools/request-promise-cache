# Request-Promise-Cache

This package is a wrapper on [`request-promise-native`](https://www.npmjs.com/package/request-promise-native), which caches the responses
with the help of [`http-cache-semantics`](https://www.npmjs.com/package/http-cache-semantics).

[`http-cache-semantics`](https://www.npmjs.com/package/http-cache-semantics) Does not actually cache the response but parses the request and response headers and gives us the ability to decide whether to cache or not.
And [`cache-base`](https://www.npmjs.com/package/cache-base) is used internally to actually cache the response.

## Installation

This module is installed via private git:

```
npm install --save git+https://github.com/SnapfishTools/request-promise-cache.git

```
## Usage

```
import * as request  from 'request-promise-cache';

const response = await request.get(url)

```
