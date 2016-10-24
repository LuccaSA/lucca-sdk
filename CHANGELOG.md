# Change log

## 1.0.5 - Typescript framework fix

### New features
 - `postItemAsync` doesn't call `postItemsAsync` cuz not every api supports collection posted

## 1.0.4 - Typescript framework update

### New features
 - added method `getItemByIdSafeAsync` that returns `undefined` even if the api returns a 404
 - `putItemAsync` `id` parameter now `number | string` instead of `number`

## 1.0.3 - Typescript framework

### New features
 - the typescript framework to query the api, see the [readme](https://github.com/LuccaSA/lucca-sdk/tree/master/Typescript) for more info
 - support for AuthenticationType "webservice"

## 1.0.2 - RDD and ApiService

### New features
 - WebClient can now be mocked in ApiService

#### Dependencies
 - RDD has been udpated ( 1.0.8.3 to 1.0.10.)

## 1.0.1 - First use by  WS BI

### New features
 - ApiService with Users and Permissions service in order to make API v2 or v3 calls

### Breaking changes

### Resolved issues

#### Dependencies
