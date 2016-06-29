module Api.V3 {
	"use strict";
	class Dependency {
		public key: string;
		public types: string[];
		public extractId: boolean;
		public isArray: boolean;
	}
	class Field {
		public key: string;
		public type: string;
		public enumValues: EnumValue[];
	}

	export function getApiFields(resourceTypes: any[] & any): string {
		if (resourceTypes.length) {
			return _recursiveGetFieldsAndDependenciesForTypes(resourceTypes, 0);
		} else {
			return _recursiveGetFieldsAndDependenciesForTypes([resourceTypes], 0);
		}
	}
	export function toApiData(resourceTypes: any[] & any, data: any): any {
		if (resourceTypes.length) {
			return _recursiveToApiData(resourceTypes, data, 0);
		} else {
			return _recursiveToApiData([resourceTypes], data, 0);
		}
	}
	export function fromApiData(resourceTypes: any[] & any, data: any): any {
		if (resourceTypes.length) {
			return _recursiveFromApiData(resourceTypes, data, 0);
		} else {
			return _recursiveFromApiData([resourceTypes], data, 0);
		}
	}


	let resources = {};
	let MAGIC_MAX_DEPTH = 5;
	function _recursiveGetFieldsAndDependenciesForTypes(types: any[], depth: number): string {
		return _.reduce(types, (fields: string[], type: any) => {
			let r = new type();
			fields = _.union(fields, _.pluck(r._fields, "key"));
			if (depth < MAGIC_MAX_DEPTH) {
				_.each(r._dependencies, (dependency: Dependency): void => {
					let combinedFields =
						_recursiveGetFieldsAndDependenciesForTypes(
							_.map(dependency.types, (typeName: string) => {
								return resources[typeName];
							})
							, depth + 1);
					fields.push(dependency.key + "[" + combinedFields.toString() + "]");
				});
			}
			return fields;
		}, []).toString();
	}

	function _getFieldsListForTypes(types: any[]): Field[] {

		let r = _.reduce(types, (fields: Field[], type: any) => {
			let resource = new type();
			fields = fields.concat(resource._fields || []);
			return fields;
		}, []);
		return r;
	}
	function _getDependenciesListForTypes(types: any[]): Dependency[] {
		let r = _.reduce(types, (dependencies: Dependency[], type: any) => {
			return dependencies.concat(<Dependency[]>new type()._dependencies || []);
		}, []);
		return r;
	}
	function _recursiveToApiData(resourceTypes: any[], data: any, depth: number): any {
		if (!data || depth === MAGIC_MAX_DEPTH) {
			return undefined;
		}
		let apiData = {};
		_.each(_getFieldsListForTypes(resourceTypes), (field: Field) => {
			let key = field.key;
			let value = data[key];
			if (!!field.type) {
				apiData[key] = formatFrom(field, value);
			} else {
				apiData[key] = value;
			}
		});
		_.each(_getDependenciesListForTypes(resourceTypes), (dependency: Dependency) => {
			let key = dependency.key;
			let value = data[key];
			if (dependency.extractId) {
				apiData[key + "Id"] = extractId(value);
			} else {
				let dependencyTypes = _.map(dependency.types, (typeName: string) => { return resources[typeName]; });
				if (!dependency.isArray) {
					apiData[key] = _recursiveToApiData(dependencyTypes, value, depth + 1);
				} else if (data[key] !== undefined) {
					apiData[key] = [];
					// For each object in the array of data, transform the object into object expected by the api
					_.map(value, (val: any) => {
						apiData[key].push(_recursiveToApiData(dependencyTypes, val, depth + 1));
					});
				}
			}
		});

		// remove all key with value === undefined
		_.each(_.keys(apiData), (key: string) => {
			if (apiData[key] === undefined) {
				delete apiData[key];
			}
		});

		return apiData;
	}
	function _recursiveFromApiData(resourceTypes: any[], apiData: any, depth: number): any {
		if (!apiData || depth === MAGIC_MAX_DEPTH) {
			return undefined;
		}
		let data = {};
		let indexedFields = _.indexBy(_getFieldsListForTypes(resourceTypes), "key");
		let indexedDependencies = _.indexBy(_getDependenciesListForTypes(resourceTypes), "key");
		// loop on each of the key of the apiData object
		_.mapObject(apiData, (val: any, key: string) => {
			if (!!indexedFields[key] && !!indexedFields[key].type) {
				// the key is one of the field with a special type (moment, duration, enum, other?), format it in our data object
				data[key] = formatTo(indexedFields[key], val);
			} else if (!!indexedDependencies[key]) {
				// this is a dependency, extract the data from it
				let dependencyTypes = _.map(indexedDependencies[key].types, (typeName: string) => { return resources[typeName]; });
				if (indexedDependencies[key].isArray) {
					data[key] = _.map(val, (item: any) => {
						return _recursiveFromApiData(dependencyTypes, item, depth + 1);
					});
				} else {
					data[key] = _recursiveFromApiData(dependencyTypes, val, depth + 1);
				}
			} else {
				// just copy the val
				data[key] = val;
			}
		});
		return data;
	}

	/////////////////////////
	// format functions    //
	/////////////////////////
	let MAGIC_FORMAT_MOMENT = "YYYY-MM-DD[T]HH:mm:ss";
	function formatTo(field: Field, value: any): any {
		switch (field.type) {
			case "moment":
				return formatToMoment(value);
			case "enum":
				return formatToEnum(value, field.enumValues);
			case "duration":
				return formatToDuration(value);
			case "date":
				return formatToDate(value);

			default:
				console.warn("Unknown type " + field.type + " for field " + field.key);
				return value;
		}
	};
	function formatToMoment(value: any): moment.Moment {
		if (value === undefined || value === null) {
			return value;
		}
		return moment(value);
	}
	function formatToEnum(enumKey: any, enumValues: EnumValue[]): EnumValue {
		if (enumKey === undefined || enumKey === null) {
			return enumKey;
		}
		return _.findWhere(enumValues, { key: enumKey }) || new EnumValue(enumKey);
	}
	function formatToDuration(value: any): moment.Duration {
		if (value === undefined || value === null) {
			return value;
		}
		return moment.duration(value);
	}
	function formatToDate(value: any): Date {
		if (value === undefined || value === null) {
			return value;
		}
		return formatToMoment(value).toDate();
	}
	function formatFrom(field: Field, value: any): any {
		switch (field.type) {
			case "moment":
				return formatFromMoment(<moment.Moment>value);
			case "enum":
				return formatFromEnum(<EnumValue>value);
			case "duration":
				return formatFromDuration(<moment.Duration>value);
			case "date":
				return formatFromDate(<Date>value);

			default:
				console.warn("Unknown type " + field.type + " for field " + field.key);
				return value;
		}
	};
	function formatFromMoment(value: moment.Moment): string {
		if (value === undefined || value === null) {
			return <any>value;
		}
		if (!value.isValid()) {
			// return the initial parameter;
			/* tslint:disable */
			return <any>(value)["_i"];
			/* tslint:enable */
		}
		return value.format(MAGIC_FORMAT_MOMENT);
	}
	function formatFromEnum(enumValue: EnumValue): any {
		if (enumValue === undefined || enumValue === null) {
			return <any>enumValue;
		}
		return enumValue.key;
	}
	function formatFromDuration(value: moment.Duration): string {
		if (value === undefined || value === null) {
			return <any>value;
		}
		if (moment.isDuration(value)) {
			let formattedValue: string = "";
			let days: number = value.days();
			// Handle negative values
			if (value.asMilliseconds() < 0) {
				formattedValue = "-";
				value = moment.duration(-value);
			}
			if (days > 0) {
				formattedValue += days + ".";
				value = value.subtract(moment.duration(days, "days"));
			}
			formattedValue += moment().startOf("day").add(value).format("HH:mm:ss");
			return formattedValue;
		}
	}
	function formatFromDate(value: Date): string {
		if (value === undefined || value === null) {
			return <any>value;
		}
		if (!moment(value).isValid()) {
			return value.toString();
		}
		return formatFromMoment(moment(value));
	}
	///////////////////////////
	// extract dependency id //
	///////////////////////////
	function extractId(value: any): any {
		if (value === undefined || value === null) {
			return value;
		}
		return value.id;
	}
	///////////////////////////
	// decorator functions   //
	///////////////////////////
	export function apiField(format?: string, enumValues?: EnumValue[]): (target: any, key: string) => void {
		return (target: any, key: string) => {
			if (!target._fields) {
				target._fields = [];
			}
			let _field = <Field>{ key: key, type: format, enumValues: enumValues };
			target._fields.push(_field);
		};
	}

	export function apiResource(resourceName: string, extractId?: boolean): (target: any, propertyKey: string) => void {
		return (target: any, propertyKey: string) => {
			if (!target._dependencies) {
				target._dependencies = [];
			}
			let dependency = <Dependency>{ key: propertyKey, extractId: !!extractId, isArray: false, types: resourceName.split(",") };
			target._dependencies.push(dependency);
		};
	}

	export function apiResources(resourceName: string): (target: any, propertyKey: string) => void {
		return (target: any, propertyKey: string) => {
			if (!target._dependencies) {
				target._dependencies = [];
			}
			let dependency = <Dependency>{ key: propertyKey, extractId: false, isArray: true, types: resourceName.split(",") };
			target._dependencies.push(dependency);
		};
	}

	export function resource(resourceName?: string): (target: any) => void {
		return (target: any) => {
			let name = resourceName;

			if (!name) {
				name = target.name;
				console.warn("You did not provide a name for the resource: " + name + ", it will not work with ie 9- or if your code is minified");
			}
			if (!!resources[name]) {
				console.warn("Duplicate resource: " + name);
			}
			resources[name] = target;
		};
	}
}
