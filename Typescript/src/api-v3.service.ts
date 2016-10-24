module Api.V3 {
	"use strict";


	///////////////////////////
	// generic service       //
	///////////////////////////
	class HttpMethod {
		public static GET: string = "GET";
		public static POST: string = "POST";
		public static PUT: string = "PUT";
		public static DELETE: string = "DELETE";
	}

	export abstract class Service {
		protected $q: angular.IQService;
		protected $http: angular.IHttpService;
		public mainApiUrl: string;

		constructor($http: angular.IHttpService, $q: angular.IQService) {
			this.$q = $q;
			this.$http = $http;
		}

		/////////////////////
		// GET ONE ITEM    //
		/////////////////////
		protected getUniqItemAsync(types: any & any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any> {
			return this.getItemByFilterAsync("", types, apiUrl, fieldTypes);
		}
		protected getItemByIdAsync(id: number | string, types: any & any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any> {
			return this.getItemByFilterAsync("/" + id, types, apiUrl, fieldTypes);
		}
		protected getItemByIdSafeAsync(id: number | string, types: any & any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any> {
			return this.getCollectionByFilterAsync("id=" + id, types, apiUrl, fieldTypes)
				.then((data) => {
					if (!data || data.length === 0) {
						return undefined;
					}
					return _.first(data);
				});
		}
		protected getItemByFilterAsync(filter: string, types: any & any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any> {
			let method = HttpMethod.GET;
			if (!!filter && filter.substring(0, 1) !== "/") {
				filter = "?" + filter;
			}
			let url = this.getUrlToCall(apiUrl, filter, fieldTypes || types);
			return this.callAndTransformItem(method, url, types);
		}

		//////////////////////
		// GET A COLLECTION //
		//////////////////////
		protected getCollectionAsync(types: any & any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any[]> {
			return this.getCollectionByFilterAsync("", types, apiUrl, fieldTypes);
		}
		protected getCollectionByFilterAsync(filter: string, types: any & any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any[]> {
			let method = HttpMethod.GET;
			if (!!filter) {
				filter = "?" + filter;
			}
			let url = this.getUrlToCall(apiUrl, filter, fieldTypes || types);
			return this.callAndTransformCollection(method, url, types);
		}

		/////////////////////
		// POST ITEM       //
		/////////////////////
		protected postItemAsync(types: any & any[], data: any, apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any> {
			let method = HttpMethod.POST;
			let url = this.getUrlToCall(apiUrl, "", fieldTypes || types);
			let postableData = Api.V3.toApiData(types, data);
			return this.callAndTransformItem(method, url, types, postableData);
		}
		protected postItemsAsync(types: any & any[], datas: any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any> {
			let method = HttpMethod.POST;
			let url = this.getUrlToCall(apiUrl, "", fieldTypes || types);
			let postableData = _.map(datas, (data) => {
				return Api.V3.toApiData(types, data);
			});
			return this.callAndTransformItem(method, url, types, postableData);
		}

		/////////////////////
		// PUT ITEM        //
		/////////////////////
		protected putItemAsync(id: number | string, types: any & any[], data: any, apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any> {
			let method = HttpMethod.PUT;
			let url = this.getUrlToCall(apiUrl, "/" + id, fieldTypes || types);
			let postableData = Api.V3.toApiData(types, data);
			return this.callAndTransformItem(method, url, types, postableData);
		}

		protected putItemsAsync(types: any & any[], datas: any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any> {
			let method = HttpMethod.PUT;
			let url = this.getUrlToCall(apiUrl, "", fieldTypes || types);
			let postableData =  _.map(datas, (data: any) => {
				return Api.V3.toApiData(types, data);
			});
			if (!postableData.length) {
				let dfd = this.$q.defer();
				dfd.resolve();
				return dfd.promise;
			} else if (_.every(postableData, (data: any) => {
				return _.has(data, "id");
			})) {
				return this.callAndTransformCollection(method, url, types, postableData);
			} else {
				let dfd = this.$q.defer();
				dfd.reject(<Api.V3.ResponseError>{ Message: "You have to provide an id for each item." });
				return dfd.promise;
			}
		}

		/////////////////////
		// DELETE ITEM     //
		/////////////////////
		protected deleteItemByIdAsync(id: number, apiUrl?: string): ng.IPromise<any> {
			let method = HttpMethod.DELETE;
			let url = this.getUrlToCall(apiUrl, "/" + id);
			return this.callAndResolve(method, url);
		}
		protected deleteItemsAsync(datas: { id: any }[], apiUrl?: string): ng.IPromise<any> {
			let dfd = this.$q.defer();
			let method = HttpMethod.DELETE;
			let url = this.getUrlToCall(apiUrl, "");
			let postableData = _.map(datas, (item: { id: any }) => {
				if (!!item.id) {
					return { id: item.id };
				}
				return undefined;
			});
			postableData = _.filter(postableData, (item: any) => {
				return item !== undefined;
			});
			if (postableData.length) {
				this.$http({
					method: method,
					url: url,
					data: postableData,
				headers: { "Content-Type": "application/json" }, // Need to specify content-type because it's "text/plain" by default for DELETE
			})
				.then((response: ng.IHttpPromiseCallbackArg<ResponseItem<any>>) => {
					dfd.resolve();
				}, (response: ng.IHttpPromiseCallbackArg<ResponseError>) => {
					dfd.reject(response.data.Message);
				});
			} else {
				dfd.resolve();
			}

			return dfd.promise;
		}
		/////////////////////
		// PRIVATE METHODS //
		/////////////////////
		private getUrlToCall(apiUrl: string, filter: string, types?: any & any[]): string {
			let url = apiUrl;
			if (!apiUrl) {
				url = this.mainApiUrl;
			}
			if (!!filter) {
				url += filter;
			}
			if (!!filter && filter.indexOf("?") > -1) {
				url += "&";
			} else {
				url += "?";
			}
			if (!!types) {
				url += "fields=" + Api.V3.getApiFields(types);
			}
			return url;
		}
		private callAndTransformItem(method: string, url: string, types: any & any[], data?: any): ng.IPromise<any> {
			let dfd = this.$q.defer();
			this.$http({
				method: method,
				url: url,
				data: data,
			})
			.then((response: ng.IHttpPromiseCallbackArg<ResponseItem<any>>) => {
				dfd.resolve(Api.V3.fromApiData(types, response.data.data));
			}, (response: ng.IHttpPromiseCallbackArg<ResponseError>) => {
				dfd.reject(response.data.Message);
			});
			return dfd.promise;
		}
		private callAndTransformCollection(method: string, url: string, types: any & any[], data?: any): ng.IPromise<any[]> {
			let dfd = this.$q.defer();
			this.$http({
				method: method,
				url: url,
				data: data,
			})
			.then((response: ng.IHttpPromiseCallbackArg<ResponseCollection<any>>) => {
				dfd.resolve(
					_.map(response.data.data.items, (item: any) => {
						return Api.V3.fromApiData(types, item);
					})
				);
			}, (response: ng.IHttpPromiseCallbackArg<ResponseError>) => {
				dfd.reject(response.data.Message);
			});
			return dfd.promise;
		}
		private callAndResolve(method: string, url: string, data?: any): ng.IPromise<any> {
			let dfd = this.$q.defer();
			this.$http({
				method: method,
				url: url,
				data: data,
			})
			.then((response: ng.IHttpPromiseCallbackArg<ResponseItem<any>>) => {
				dfd.resolve();
			}, (response: ng.IHttpPromiseCallbackArg<ResponseError>) => {
				dfd.reject(response.data.Message);
			});
			return dfd.promise;
		}
	}
}
