# Typescript framework

## tl;dr

By defining your classes like this, using the `@Api.V3.xxx` decorators

```ts
@Api.V3.resource("Foo")
class Foo {
	@Api.V3.apiField()
	id: number;
	@Api.V3.apiField()
	name: string;
	count: number;
}
@Api.V3.resource("Bar")
class Bar {
	static barStatusEnum = [new Lucca.Domain.EnumValue(0, "zero")];
	@Api.V3.apiField("moment")
	start: moment.Moment;
	@Api.V3.apiField("duration")
	duration: moment.Duration;
	@Api.V3.apiField("date")
	date: Date;
	@Api.V3.apiField("enum", barStatusEnum)
	status: Lucca.Domain.EnumValue;
	@Api.V3.apiResource("Foo")
	foo: Foo;
	@Api.V3.apiResource("Foo", true)
	fooBis: Foo;
	@Api.V3.apiResources("Foo")
	fooArray: Foo[];
}
```

you can use the static method `Api.V3.getApiFields` to compute automatically the fields to ask the api


```ts
Api.V3.getApiFields(Foo);
// => "id,name"
Api.V3.getApiFields(Bar);
// => "start,duration,date,status,foo[id,name],fooBis[id,name],fooArray[id,name]"
Api.V3.getApiFields([Foo,Bar]);
// => "id,name,start,duration,date,status,foo[id,name],fooBis[id,name],fooArray[id,name]"
```

The static method `Api.V3.fromApiData` allows you to transform a response of the api into the kind of objects you want. It will automatically transform to moment the fields flagged as `apiFields("moment")`,to duration the fields flagged as `apiField("duration")`, to date the fields flagged as `apiField("date")` and fields flagged as `apiField("enum", enumValues)` will also be transformed.

```ts
let apiFoo = { id: 1, name: "leon", otherField: "some stuff" };
<Foo>Api.V3.fromApiData(Foo, apiFoo); 
// => { id: 1, name: "leon", otherField: "some stuff" }
// all the keys of the apiData are transferred to the returned object, even if its not a property of class Foo

let apiBar = { start: '2015-01-01', duration: '3:00:00', date: '2015-01-01', status: 0, foo: apiFoo, fooBis: apiFoo, fooArray: [apiFoo] };
<Bar>Api.V3.fromApiData(Bar, apiBar); 
// => { start: moment('2015-01-01'), duration: moment.duration('3:00:00'), date: new Date('2015-01-01'), status: { key: 0, label: "zero" }, foo: { id: 1, name: "leon", otherField: "some stuff" }, fooBis: { id: 1, name: "leon", otherField: "some stuff" }, fooArray: [{ id: 1, name: "leon", otherField: "some stuff" }]}
// start was transformed into a moment, status into an EnumValue, duration into a duration and date into a date
// fromApiData was recursively called on every field flagged as apiResource

let apiFooBar = { id: 1, start: '2016-01-01', status: 1 };
<Foo & Bar>Api.V3.fromApiData([Foo, Bar], apiFooBar);
// => { id:1, start: moment('2016-01-01'), status: { key:1, label: "UNKNOWN_KEY" } }
```

The static method `Api.V3.toApiData` will transform an object into something postable to the api. It will remove fields not marked as `apiField`, extract the key of fields flagged as `apiField("enum")` and format fields flagged as `apiField("moment")`, `apiField("duration")` and `apiField("date")`. It will also be called recursively on each field flagged as `apiResource`

```ts
let foo: Foo = { id: 1, name: "myFoo", count: 42 };
Api.V3.toApiData(Foo, foo);
// => { id: 1, name: "myFoo" };
// property 'count' is ignored because not flagged as apiField

let bar: Bar = { start: moment('2016-01-01'), duration: moment.duration('3:00:00'), date: new Date('2016-01-01'), status: {key: 0, label: "zero" } }
Api.V3.toApiData(Bar, bar);
// => { start: "2016-01-01T00:00:00", duration: "03:00:00", date: "2016-01-01T00:00:00", status: 0 };
bar.foo = foo;
Api.V3.toApiData(Bar, bar);
// => { start: "2016-01-01T00:00:00", duration: "03:00:00", date: "2016-01-01T00:00:00", status: 0, foo: { id: 1, name: "myFoo" } }

Api.V3.toApiData([Foo, Bar], { id: 1, start: moment('2016-01-01') });
// => { id: 1, start: "2016-01-01T00:00:00" }
```

the second argument of `apiResource` is used by `toApiData` to just extract the `id` of the resource

```ts
let foo = { id:1, name: "myFoo" };
let bar = { foo: foo, fooBis: foo };
Api.V3.toApiData(Bar, bar);
// => { foo: { id: 1, name: "myFoo" }, fooBisId: 1 }
// bar.foo is transformed by calling toApiData on foo 
// while bar.fooBis is transformed by creating the property fooBisId and setting it to bar.foobis.id
```

## Decorators

### Api.V3.apiField

`Api.v3.apiField()`, a property decorator, allowing to loop on each decorated field at class creation and populating an hidden member `_field`. Using the tl;dr example 

```ts
new Foo()._fields; 
// => [{ key: "id" }, { key: "name" }]
new Bar()._fields; 
// => [{ key: "start", type: "moment" }, { key: "duration", type:"duration" }, { key: "date", type: "date" }, { key: "status", type: "enum", enumValues: [...] }]
```

It is used by

 - `getApiFields` to get the list of field keys 
 - `fromApiData` to transform the data into the right format
 - `toApiData` to exclude some properties and format the data into something understandable by the api

### Api.V3.apiResource

`Api.V3.apiResource(resourceType: string, extractId?: boolean)`, a property decorator on each decorated field at class creation and populating an hidden member `_dependencies`. Using the tl;dr example 

```ts
new Foo()._dependencies; 
// => undefined
new Bar()._dependencies; 
// => [{ key: "foo", type: "Foo" }, { key: "fooBis", type: "Foo", extractId: true, isArray: false }, { key: "fooArray", type: "Foo", extractId: false, isArray: true }]
```

### Api.V3.apiResources

`Api.V3.apiResources(resourceType: string)`, same as `Api.V3.apiResource` but handles an array of dependencies. Using the tl;dr example 

### Api.V3.resource

`Api.V3.resource(resourceName?: string)`, a class decorator, allowing to loop on each decorated class during script initialization. We store in a private dictionary the name and the function of each decorated class

```ts
resources = 
{
	"Foo": Foo,
	"Bar": Bar
}
```

You don't have to provide a `resourceName` but it won't work in ie 9 or under or if you minify your code

We use that in addition of the `_dependencies` member to know what function to call to initialize a dependency of a certain type

```ts
getApiFields(Bar) = 
	new Bar()._fields + // "start,duration,date,status"
	",foo[" + new resources["Foo"]()._fields + "]" // ",foo[id,name]"
	",fooBis[" + new resources["Foo"]()._fields + "]"; ",fooBis[id,name]"
```

We're forced to use this kind of synthax instead of just passing the function `Foo` to `apiResource` because otherwise, the order in which the classes are defined matters. For example

```ts
class Tata {
	@apiResource(Titi) // the function Titi does not exists yet
	titi: Titi;
}
class Titi { 
	@apiField
	id: number;
}
class Toto {
	@apiResource(Titi) // the function Titi exists
	titi: Titi;
}
getApiField(Tata);
// => "titi[]";
getApiField(Toto);
// => "titi[id]";
```

### Limitations

#### Class extension

During transpilation, typescript decorators add somme code to the object prototype. As a result it does not work at all with class extension. The apiFields of the class extending appear in the extended class

```ts
class Foo {
	@Api.V3.apiField
	id: number;
}
class extendFoo {
	@Api.V3.apiField
	name: string;
}
new Foo()._fields; // ["id", "name"];
```

#### Class name

The `Api.V3.resource` class decorator extracts the name of the class but not the name of the module. As a result having two class with the same name in different modules will not work

```ts
module Lucca {
	@Api.V3.resource
	class User { 
		@apiField
		id: number;
		@apiResource("User")
		manager: User
	}
}
module Timmi {
	@Api.V3.resource
	class User { 
		@apiField
		id: number;
		@apiResource("User") // the framework will not be able to know if this is a Timmi.User or a Lucca.User when trying to determine what are its apiFields
		manager: Lucca.User,
		@apiResource("User") // the framework will not be able to know if this is a Timmi.User or a Lucca.User when trying to determine what are its apiFields
		timmiManager: Timmi.User,
	}
}
```

## Generic service

The module `Timmi.Service` exposes an abstract class `GenericService`. It exposes a set of methods to easily get an item or a collection from the api **V3**.

### Extending `GenericeService`

The `GenericService` need `$http` and `$q` to be injected so your service shoud at least look like this

```ts
export class MyCustomService extends GenericService {
	static $inject: Array<string> = ["$http", "$q"];

	constructor($http: angular.IHttpService, $q: angular.IQService) {
		super($http, $q);
	}
}
```

You can also set the `mainApiUrl` in the constructor if your service will almost always call the same api.

### Using the methods

`GenericService` provides these methods:

```ts
protected getUniqItemAsync(types: any & any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any>
protected getItemByIdAsync(id: number, types: any & any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any>
protected getItemByFilterAsync(filter: string, types: any & any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any>

protected getCollectionAsync(types: any & any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any[]>
protected getCollectionByFilterAsync(filter: string, types: any & any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any[]>

protected postItemAsync(types: any & any[], data: any, apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any>

protected putItemAsync(id: number, types: any & any[], data: any, apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any>

protected deleteItemByIdAsync(id: number, apiUrl?: string): ng.IPromise<any>
```

If no `apiUrl` is provided, it will use the `mainApiUrl`

the `types` parameter is used to tranform the api response using the method `fromApiData`. In case of method `postItemAsync` and `putItemAsync`, it is also used to transform the data you want to `post/put` into something that will not be thrown by the api via the metho `toApiData`

`types` is also used to compute the fields to ask the api via the method `getApiFields`.

The parameter `fieldTypes` is used when you wnat to ask for the fields of a certain class/classes but know the api response is not of this type. 

For example:

```ts
class Foo {
	@apiField
	id: number;
}
class Bar {
	@apiField
	name: string;
}
getCollectionAsync(Foo, "/api/v3/foos"); 
// will call GET "/api/v3/foos?fields=id"
// and returns a ng.IPromise<Foo[]>
getItemByIdAsync(Bar, 42, "/api/v3/bars", Foo); 
// will call GET "/api/v3/bars/42?fields=id", uses the apiFields of type Foo
// and returns a ng.IPromise<Bar>, but transforms the response into Bar
getUniqItemAsync([Foo, Bar], "/api/v3/foobar"); 
// will call GET "/api/v3/foobar?fields=id,name"
// and returns a ng.IPromise<Foo & Bar>
```

### Casting the returned promise

The promise returnd by the `GenericService` are of type `ng.Ipromise<any>` or `ng.Ipromise<any[]>` but you can cast the `any` part to whatever class you want and it is recommended of you to do so if you know what kind of object the api will return.

```ts
@resource
class Foo { ... }
@resource 
class FooTree {
	node: Foo;
	chilren: FooTree[];
}
<ng.Ipromise<Foo[]>> super.getCollectionAsync(Foo);
<ng.Ipromise<FooTree>> super.getUniqItemAsync(FooTree, "/api/v3/foos/tree", Foo);
```
