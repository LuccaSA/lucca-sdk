module Api.V3.Test {
	@Api.V3.resource("TestServiceBogusClass")
	class TestServiceBogusClass {

	}
	@Api.V3.resource("TestServiceFooClass")
	class TestServiceFooClass {

	}

	class TestService extends Api.V3.Service {
		public static $inject: Array<string> = ["$http", "$q"];

		constructor($http: angular.IHttpService, $q: angular.IQService) {
			super($http, $q);
			this.mainApiUrl = "/api/v3/mainapi";
		}
		public getUniqItemAsync(types: any & any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any> {
			return super.getUniqItemAsync(types, apiUrl, fieldTypes);
		}
		public getItemByIdAsync(id: number, types: any & any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any> {
			return super.getItemByIdAsync(id, types, apiUrl, fieldTypes);
		}
		public getItemByFilterAsync(filter: string, types: any & any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any> {
			return super.getItemByFilterAsync(filter, types, apiUrl, fieldTypes);
		}
		public getCollectionAsync(types: any & any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any[]> {
			return super.getCollectionAsync(types, apiUrl, fieldTypes);
		}
		public getCollectionByFilterAsync(filter: string, types: any & any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any[]> {
			return super.getCollectionByFilterAsync(filter, types, apiUrl, fieldTypes);
		}
		public postItemAsync(types: any & any[], data: any, apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any> {
			return super.postItemAsync(types, data, apiUrl, fieldTypes);
		}
		public postItemsAsync(types: any & any[], data: any[], apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any> {
			return super.postItemsAsync(types, data, apiUrl, fieldTypes);
		}
		public putItemAsync(id: number, types: any & any[], data: any, apiUrl?: string, fieldTypes?: any & any[]): ng.IPromise<any> {
			return super.putItemAsync(id, types, data, apiUrl, fieldTypes);
		}
		public deleteItemByIdAsync(id: number, apiUrl?: string): ng.IPromise<any> {
			return super.deleteItemByIdAsync(id, apiUrl);
		}
		public deleteItemsAsync(data: any, apiUrl?: string): ng.IPromise<any> {
			return super.deleteItemsAsync(data, apiUrl);
		}
	}
	angular.module("apiV3Test", []).service("testService", TestService);

	let bogus = {
		hasResolved: () => { },
		hasRejected: () => { },
		hasPosted: () => { },
		hasDeleted: () => { },
	};
	let responseError: Api.V3.ResponseError;
	let responseItemEmpty: Api.V3.ResponseItem<any>;
	let responseCollection: Api.V3.ResponseCollection<any>;
	let responseCollectionEmpty: Api.V3.ResponseCollection<any>;
	describe("api.v3.service", () => {
		let $httpBackend: angular.IHttpBackendService;
		let service: TestService;
		beforeEach(angular.mock.module("apiV3Test"));
		beforeEach(() => {
			inject((testService: TestService, _$httpBackend_: angular.IHttpBackendService) => {
				$httpBackend = _$httpBackend_;
				service = testService;
			});
			spyOn(bogus, "hasResolved");
			spyOn(bogus, "hasRejected");
			spyOn(bogus, "hasPosted");
			spyOn(bogus, "hasDeleted");
			responseError = new Api.V3.ResponseError();
			responseError.Message = "bogus";
			responseItemEmpty = new Api.V3.ResponseItem();
			responseCollection = new Api.V3.ResponseCollection();
			responseCollection.data = { items: [{}] };
			responseCollectionEmpty = new Api.V3.ResponseCollection();
			responseCollectionEmpty.data = { items: [] };
		});
		describe("GET", () => {
			// GET ITEM
			describe("getItemByFilterAsync", () => {
				it("should call getApiFields() before doing the http bit", () => {
					spyOn(Api.V3, "getApiFields");
					service.getItemByFilterAsync("", TestServiceBogusClass);
					expect(Api.V3.getApiFields).toHaveBeenCalledWith(TestServiceBogusClass);
				});
				it("should call getApiFields on the right types", () => {
					spyOn(Api.V3, "getApiFields");
					service.getItemByFilterAsync("", TestServiceBogusClass, undefined, TestServiceFooClass);
					expect(Api.V3.getApiFields).toHaveBeenCalledWith(TestServiceFooClass);
				});
				it("should call fromApiData() after the http bit", () => {
					spyOn(Api.V3, "fromApiData");
					service.getItemByFilterAsync("", TestServiceBogusClass);
					$httpBackend.expectGET(/api\/v3\/mainapi/i).respond(200, responseItemEmpty);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).toHaveBeenCalledWith(TestServiceBogusClass, undefined);
				});
				it("should call fromApiData() with the right types after the http bit", () => {
					spyOn(Api.V3, "fromApiData");
					service.getItemByFilterAsync("", TestServiceBogusClass, undefined, TestServiceFooClass);
					$httpBackend.expectGET(/api\/v3\/mainapi/i).respond(200, responseItemEmpty);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).toHaveBeenCalledWith(TestServiceBogusClass, undefined);
				});
				it("should callfromApiData with the response data", () => {
					spyOn(Api.V3, "fromApiData")
					let data = { id: 1, name: "bogus" };
					let responseItem = new Api.V3.ResponseItem<any>();
					responseItem.data = data;
					$httpBackend.expectGET(/api\/v3\/mainapi/i).respond(200, responseItem);
					service.getItemByFilterAsync("", TestServiceBogusClass);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).toHaveBeenCalledWith(TestServiceBogusClass, data);
				});
				it("should resolve when everything goes right", () => {
					spyOn(Api.V3, "fromApiData");
					service.getItemByFilterAsync("", TestServiceBogusClass)
					.then(bogus.hasResolved, bogus.hasRejected);
					$httpBackend.expectGET(/api\/v3\/mainapi/i).respond(200, responseItemEmpty);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).toHaveBeenCalled();
					expect(bogus.hasResolved).toHaveBeenCalled();
					expect(bogus.hasRejected).not.toHaveBeenCalled();
				});
				it("should reject if the http fails, and not call fromApiData", () => {
					spyOn(Api.V3, "fromApiData");
					service.getItemByFilterAsync("", TestServiceBogusClass)
					.then(bogus.hasResolved, (message: string) => {
						bogus.hasRejected();
						expect(message).toBe(responseError.Message);
					})
					$httpBackend.expectGET(/api\/v3\/mainapi/i).respond(500, responseError);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).not.toHaveBeenCalled();
					expect(bogus.hasResolved).not.toHaveBeenCalled();
					expect(bogus.hasRejected).toHaveBeenCalled();
				});
				it("should call the apiUrl specified if any", () => {
					service.getItemByFilterAsync("", TestServiceBogusClass, "/api/v3/bogus");
					$httpBackend.expectGET(/api\/v3\/bogus/i).respond(500, responseError);
					expect($httpBackend.flush).not.toThrow;
				});
				it("should use the right filters", () => {
					let filtersCalled = [];
					$httpBackend.whenGET((url: string) => {
						let splitUrl = url.substring(1).split("fields=");
						filtersCalled.push(splitUrl[0].substring(0, splitUrl[0].length - 1));
						return true;
					}).respond(500, responseError);
					service.getItemByFilterAsync("", TestServiceBogusClass, "a");
					service.getItemByFilterAsync("/12", TestServiceBogusClass, "a");
					service.getItemByFilterAsync("a=b", TestServiceBogusClass, "a");
					$httpBackend.flush();
					expect(filtersCalled[0]).toBe("");
					expect(filtersCalled[1]).toBe("/12");
					expect(filtersCalled[2]).toBe("?a=b");
				});
				it("should use the right fields", () => {
					spyOn(Api.V3, "getApiFields").and.callFake((types: any & any[]) => {
						if (types === TestServiceBogusClass) {
							return "bogus,fields";
						}
						if (types === TestServiceFooClass) {
							return "foo,fields";
						}
						return "";
					});
					let fieldsCalled = [];
					$httpBackend.whenGET((url: string) => {
						let splitUrl = url.substring(1).split("fields=");
						fieldsCalled.push(splitUrl[1]);
						return true;
					}).respond(500, responseError);
					service.getItemByFilterAsync("", []);
					service.getItemByFilterAsync("", TestServiceBogusClass);
					service.getItemByFilterAsync("", TestServiceFooClass);
					$httpBackend.flush();
					expect(fieldsCalled[0]).toBe("");
					expect(fieldsCalled[1]).toBe("bogus,fields");
					expect(fieldsCalled[2]).toBe("foo,fields");
				});
			});
			describe("getUniqItemAsync", () => {
				it("should call getItemByFilterAsync", () => {
					spyOn(service, "getItemByFilterAsync");
					service.getUniqItemAsync(TestServiceBogusClass);
					expect(service.getItemByFilterAsync).toHaveBeenCalledWith("", TestServiceBogusClass, undefined, undefined);
				});
				it("should call getItemByFilterAsync with the right apiUrl", () => {
					spyOn(service, "getItemByFilterAsync");
					let bogusApi = "/api/v3/bogus";
					service.getUniqItemAsync(TestServiceBogusClass, bogusApi);
					expect(service.getItemByFilterAsync).toHaveBeenCalledWith("", TestServiceBogusClass, bogusApi, undefined);
				});
				it("should call getItemByFilterAsync with the right fieldTypes", () => {
					spyOn(service, "getItemByFilterAsync");
					service.getUniqItemAsync(TestServiceBogusClass, undefined, TestServiceFooClass);
					expect(service.getItemByFilterAsync).toHaveBeenCalledWith("", TestServiceBogusClass, undefined, TestServiceFooClass);
				});
			});
			describe("getItemByIdAsync", () => {
				it("should call getItemByFilterAsync", () => {
					spyOn(service, "getItemByFilterAsync");
					service.getItemByIdAsync(12, TestServiceBogusClass);
					expect(service.getItemByFilterAsync).toHaveBeenCalledWith("/12", TestServiceBogusClass, undefined, undefined);
				});
				it("should call getItemByFilterAsync with the right apiUrl", () => {
					spyOn(service, "getItemByFilterAsync");
					let bogusApi = "/api/v3/bogus";
					service.getItemByIdAsync(12, TestServiceBogusClass, bogusApi);
					expect(service.getItemByFilterAsync).toHaveBeenCalledWith("/12", TestServiceBogusClass, bogusApi, undefined);
				});
				it("should call getItemByFilterAsync with the right fieldTypes", () => {
					spyOn(service, "getItemByFilterAsync");
					service.getItemByIdAsync(12, TestServiceBogusClass, undefined, TestServiceFooClass);
					expect(service.getItemByFilterAsync).toHaveBeenCalledWith("/12", TestServiceBogusClass, undefined, TestServiceFooClass);
				});
			});

			// GET COLLECTION
			describe("getCollectionByFilterAsync", () => {
				it("should call getApiFields() before doing the http bit", () => {
					spyOn(Api.V3, "getApiFields");
					service.getCollectionByFilterAsync("", TestServiceBogusClass);
					expect(Api.V3.getApiFields).toHaveBeenCalledWith(TestServiceBogusClass);
				});
				it("should call getApiFields on the right types", () => {
					spyOn(Api.V3, "getApiFields");
					service.getCollectionByFilterAsync("", TestServiceBogusClass, undefined, TestServiceFooClass);
					expect(Api.V3.getApiFields).toHaveBeenCalledWith(TestServiceFooClass);
				});
				it("should not call fromApiData() after the http bit if the returned collection is empty", () => {
					spyOn(Api.V3, "fromApiData");
					service.getCollectionByFilterAsync("", TestServiceBogusClass);
					$httpBackend.expectGET(/api\/v3\/mainapi/i).respond(200, responseCollectionEmpty);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).not.toHaveBeenCalled();
				});
				it("should call fromApiData() after the http bit if the returned collection isnt empty", () => {
					spyOn(Api.V3, "fromApiData");
					service.getCollectionByFilterAsync("", TestServiceBogusClass);
					$httpBackend.expectGET(/api\/v3\/mainapi/i).respond(200, responseCollection);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).toHaveBeenCalledWith(TestServiceBogusClass, {});
				});
				it("should call fromApiData() with the right types after the http bit", () => {
					spyOn(Api.V3, "fromApiData");
					service.getCollectionByFilterAsync("", TestServiceBogusClass, undefined, TestServiceFooClass);
					$httpBackend.expectGET(/api\/v3\/mainapi/i).respond(200, responseCollection);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).toHaveBeenCalledWith(TestServiceBogusClass, {});
				});
				it("should callfromApiData with the response data", () => {
					spyOn(Api.V3, "fromApiData")
					let item = { id: 1, name: "bogus" };
					let myResponseCollection = new Api.V3.ResponseCollection<any>();
					myResponseCollection.data = { items: [item] };
					$httpBackend.expectGET(/api\/v3\/mainapi/i).respond(200, myResponseCollection);
					service.getCollectionByFilterAsync("", TestServiceBogusClass);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).toHaveBeenCalledWith(TestServiceBogusClass, item);
				});
				it("should resolve when everything goes right", () => {
					spyOn(Api.V3, "fromApiData");
					service.getCollectionByFilterAsync("", TestServiceBogusClass)
					.then(bogus.hasResolved, bogus.hasRejected);
					$httpBackend.expectGET(/api\/v3\/mainapi/i).respond(200, responseCollectionEmpty);
					$httpBackend.flush();
					expect(bogus.hasResolved).toHaveBeenCalled();
					expect(bogus.hasRejected).not.toHaveBeenCalled();
				});
				it("should reject if the http fails, and not call fromApiData", () => {
					spyOn(Api.V3, "fromApiData");
					service.getCollectionByFilterAsync("", TestServiceBogusClass)
					.then(bogus.hasResolved, (message: string) => {
						bogus.hasRejected();
						expect(message).toBe(responseError.Message);
					})
					$httpBackend.expectGET(/api\/v3\/mainapi/i).respond(500, responseError);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).not.toHaveBeenCalled();
					expect(bogus.hasResolved).not.toHaveBeenCalled();
					expect(bogus.hasRejected).toHaveBeenCalled();
				});
				it("should call the apiUrl specified if any", () => {
					service.getCollectionByFilterAsync("", TestServiceBogusClass, "/api/v3/bogus");
					$httpBackend.expectGET(/api\/v3\/bogus/i).respond(500, responseError);
					expect($httpBackend.flush).not.toThrow;
				});
				it("should use the right filters", () => {
					let filtersCalled = [];
					$httpBackend.whenGET((url: string) => {
						let splitUrl = url.substring(1).split("fields=");
						filtersCalled.push(splitUrl[0].substring(0, splitUrl[0].length - 1));
						return true;
					}).respond(500, responseError);
					service.getCollectionByFilterAsync("", TestServiceBogusClass, "a");
					service.getCollectionByFilterAsync("a=b", TestServiceBogusClass, "a");
					$httpBackend.flush();
					expect(filtersCalled[0]).toBe("");
					expect(filtersCalled[1]).toBe("?a=b");
				});
				it("should use the right fields", () => {
					spyOn(Api.V3, "getApiFields").and.callFake((types: any & any[]) => {
						if (types === TestServiceBogusClass) {
							return "bogus,fields";
						}
						if (types === TestServiceFooClass) {
							return "foo,fields";
						}
						return "";
					});
					let fieldsCalled = [];
					$httpBackend.whenGET((url: string) => {
						let splitUrl = url.substring(1).split("fields=");
						fieldsCalled.push(splitUrl[1]);
						return true;
					}).respond(500, responseError);
					service.getCollectionByFilterAsync("", []);
					service.getCollectionByFilterAsync("", TestServiceBogusClass);
					service.getCollectionByFilterAsync("", TestServiceFooClass);
					$httpBackend.flush();
					expect(fieldsCalled[0]).toBe("");
					expect(fieldsCalled[1]).toBe("bogus,fields");
					expect(fieldsCalled[2]).toBe("foo,fields");
				});
			});
			describe("getCollectionAsync", () => {
				it("should call getCollectionByFilterAsync", () => {
					spyOn(service, "getCollectionByFilterAsync");
					service.getCollectionAsync(TestServiceBogusClass);
					expect(service.getCollectionByFilterAsync).toHaveBeenCalledWith("", TestServiceBogusClass, undefined, undefined);
				});
				it("should call getCollectionByFilterAsync with the right apiUrl", () => {
					spyOn(service, "getCollectionByFilterAsync");
					let bogusApi = "/api/v3/bogus";
					service.getCollectionAsync(TestServiceBogusClass, bogusApi);
					expect(service.getCollectionByFilterAsync).toHaveBeenCalledWith("", TestServiceBogusClass, bogusApi, undefined);
				});
				it("should call getCollectionByFilterAsync with the right fieldTypes", () => {
					spyOn(service, "getCollectionByFilterAsync");
					service.getCollectionAsync(TestServiceBogusClass, undefined, TestServiceFooClass);
					expect(service.getCollectionByFilterAsync).toHaveBeenCalledWith("", TestServiceBogusClass, undefined, TestServiceFooClass);
				});
			});
		});
		describe("POST", () => {
			describe("postItemAsync", () => {
				let data: any;
				beforeEach(() => {
					data = {};
				});
				it("should call postItemSAsync", () => {
					let api = "/excellent";
					spyOn(service, "postItemsAsync");
					service.postItemAsync(TestServiceBogusClass, data, api, TestServiceFooClass);
					expect(service.postItemsAsync).toHaveBeenCalledWith(TestServiceBogusClass, [data], api, TestServiceFooClass);
				});
			});
			describe("postItemsAsync", () => {
				let data: any[];
				beforeEach(() => {
					data = [{}];
				});
				it("should call getApiFields() before doing the http bit", () => {
					spyOn(Api.V3, "getApiFields");
					service.postItemsAsync(TestServiceBogusClass, data);
					expect(Api.V3.getApiFields).toHaveBeenCalledWith(TestServiceBogusClass);
				});
				it("should call getApiFields on the right types", () => {
					spyOn(Api.V3, "getApiFields");
					service.postItemsAsync(TestServiceBogusClass, data, undefined, TestServiceFooClass);
					expect(Api.V3.getApiFields).toHaveBeenCalledWith(TestServiceFooClass);
				});
				it("should call toApiData() before doing the http bit", () => {
					spyOn(Api.V3, "toApiData");
					service.postItemsAsync(TestServiceBogusClass, data);
					expect(Api.V3.toApiData).toHaveBeenCalled();
					expect((<jasmine.Spy>Api.V3.toApiData).calls.count()).toBe(data.length);
					expect(Api.V3.toApiData).toHaveBeenCalledWith(TestServiceBogusClass, data[0]);
				});
				it("should call toApiData on the right types", () => {
					spyOn(Api.V3, "toApiData");
					service.postItemsAsync(TestServiceBogusClass, data, undefined, TestServiceFooClass);
					expect(Api.V3.toApiData).toHaveBeenCalledWith(TestServiceBogusClass, data[0]);
				});
				it("should call fromApiData() after the http bit", () => {
					spyOn(Api.V3, "fromApiData");
					service.postItemsAsync(TestServiceBogusClass, data);
					$httpBackend.expectPOST(/api\/v3\/mainapi/i).respond(200, responseItemEmpty);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).toHaveBeenCalledWith(TestServiceBogusClass, undefined);
				});
				it("should call fromApiData() with the right types after the http bit", () => {
					spyOn(Api.V3, "fromApiData");
					service.postItemsAsync(TestServiceBogusClass, data, undefined, TestServiceFooClass);
					$httpBackend.expectPOST(/api\/v3\/mainapi/i).respond(200, responseItemEmpty);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).toHaveBeenCalledWith(TestServiceBogusClass, undefined);
				});
				it("should callfromApiData with the response data", () => {
					spyOn(Api.V3, "fromApiData")
					let responseData = { id: 1, name: "bogus" };
					let responseItem = new Api.V3.ResponseItem<any>();
					responseItem.data = responseData;
					$httpBackend.expectPOST(/api\/v3\/mainapi/i).respond(200, responseItem);
					service.postItemsAsync(TestServiceBogusClass, data);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).toHaveBeenCalledWith(TestServiceBogusClass, responseData);
				});
				it("should resolve when everything goes right", () => {
					spyOn(Api.V3, "fromApiData");
					service.postItemsAsync(TestServiceBogusClass, data)
					.then(bogus.hasResolved, bogus.hasRejected);
					$httpBackend.expectPOST(/api\/v3\/mainapi/i).respond(200, responseItemEmpty);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).toHaveBeenCalled();
					expect(bogus.hasResolved).toHaveBeenCalled();
					expect(bogus.hasRejected).not.toHaveBeenCalled();
				});
				it("should reject if the http fails, and not call fromApiData", () => {
					spyOn(Api.V3, "fromApiData");
					service.postItemsAsync(TestServiceBogusClass, data)
					.then(bogus.hasResolved, (message: string) => {
						bogus.hasRejected();
						expect(message).toBe(responseError.Message);
					})
					$httpBackend.expectPOST(/api\/v3\/mainapi/i).respond(500, responseError);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).not.toHaveBeenCalled();
					expect(bogus.hasResolved).not.toHaveBeenCalled();
					expect(bogus.hasRejected).toHaveBeenCalled();
				});
				it("should post the right data", () => {
					spyOn(Api.V3, "toApiData").and.returnValue("bogus");
					service.postItemsAsync(TestServiceBogusClass, data);
					$httpBackend.expectPOST(/api\/v3\/mainapi/i).respond((method: string, url: string, postedJSON: string) => {
						bogus.hasPosted();
						let postedData = angular.fromJson(postedJSON);
						expect(postedData).toEqual(["bogus"]);
						return [500, responseError];
					});
					$httpBackend.flush();
					expect(bogus.hasPosted).toHaveBeenCalled();
				});
				it("should call the apiUrl specified if any", () => {
					service.postItemsAsync(TestServiceBogusClass, data, "/api/v3/bogus");
					$httpBackend.expectPOST(/api\/v3\/bogus/i).respond(500, responseError);
					expect($httpBackend.flush).not.toThrow;
				});
				it("should use the right fields", () => {
					spyOn(Api.V3, "getApiFields").and.callFake((types: any & any[]) => {
						if (types === TestServiceBogusClass) {
							return "bogus,fields";
						}
						if (types === TestServiceFooClass) {
							return "foo,fields";
						}
						return "";
					});
					let fieldsCalled = [];
					$httpBackend.whenPOST((url: string) => {
						let splitUrl = url.substring(1).split("fields=");
						fieldsCalled.push(splitUrl[1]);
						return true;
					}).respond(500, responseError);
					service.postItemsAsync(() => { }, data);
					service.postItemsAsync(TestServiceBogusClass, data);
					service.postItemsAsync(TestServiceFooClass, data);
					$httpBackend.flush();
					expect(fieldsCalled[0]).toBe("");
					expect(fieldsCalled[1]).toBe("bogus,fields");
					expect(fieldsCalled[2]).toBe("foo,fields");
				});
			});
		});
		describe("PUT", () => {
			describe("putItemAsync", () => {
				let data;
				beforeEach(() => {
					data = {};
				});
				it("should call getApiFields() before doing the http bit", () => {
					spyOn(Api.V3, "getApiFields");
					service.putItemAsync(12, TestServiceBogusClass, data);
					expect(Api.V3.getApiFields).toHaveBeenCalledWith(TestServiceBogusClass);
				});
				it("should call getApiFields on the right types", () => {
					spyOn(Api.V3, "getApiFields");
					service.putItemAsync(12, TestServiceBogusClass, data, undefined, TestServiceFooClass);
					expect(Api.V3.getApiFields).toHaveBeenCalledWith(TestServiceFooClass);
				});
				it("should call toApiData() before doing the http bit", () => {
					spyOn(Api.V3, "toApiData");
					service.putItemAsync(12, TestServiceBogusClass, data);
					expect(Api.V3.toApiData).toHaveBeenCalledWith(TestServiceBogusClass, data);
				});
				it("should call toApiData on the right types", () => {
					spyOn(Api.V3, "toApiData");
					service.putItemAsync(12, TestServiceBogusClass, data, undefined, TestServiceFooClass);
					expect(Api.V3.toApiData).toHaveBeenCalledWith(TestServiceBogusClass, data);
				});
				it("should call fromApiData() after the http bit", () => {
					spyOn(Api.V3, "fromApiData");
					service.putItemAsync(12, TestServiceBogusClass, data);
					$httpBackend.expectPUT(/api\/v3\/mainapi/i).respond(200, responseItemEmpty);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).toHaveBeenCalledWith(TestServiceBogusClass, undefined);
				});
				it("should call fromApiData() with the right types after the http bit", () => {
					spyOn(Api.V3, "fromApiData");
					service.putItemAsync(12, TestServiceBogusClass, data, undefined, TestServiceFooClass);
					$httpBackend.expectPUT(/api\/v3\/mainapi/i).respond(200, responseItemEmpty);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).toHaveBeenCalledWith(TestServiceBogusClass, undefined);
				});
				it("should callfromApiData with the response data", () => {
					spyOn(Api.V3, "fromApiData")
					let responseData = { id: 1, name: "bogus" };
					let responseItem = new Api.V3.ResponseItem<any>();
					responseItem.data = responseData;
					$httpBackend.expectPUT(/api\/v3\/mainapi/i).respond(200, responseItem);
					service.putItemAsync(12, TestServiceBogusClass, data);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).toHaveBeenCalledWith(TestServiceBogusClass, responseData);
				});
				it("should resolve when everything goes right", () => {
					spyOn(Api.V3, "fromApiData");
					service.putItemAsync(12, TestServiceBogusClass, data)
					.then(bogus.hasResolved, bogus.hasRejected);
					$httpBackend.expectPUT(/api\/v3\/mainapi/i).respond(200, responseItemEmpty);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).toHaveBeenCalled();
					expect(bogus.hasResolved).toHaveBeenCalled();
					expect(bogus.hasRejected).not.toHaveBeenCalled();
				});
				it("should reject if the http fails, and not call fromApiData", () => {
					spyOn(Api.V3, "fromApiData");
					service.putItemAsync(12, TestServiceBogusClass, data)
					.then(bogus.hasResolved, (message: string) => {
						bogus.hasRejected();
						expect(message).toBe(responseError.Message);
					})
					$httpBackend.expectPUT(/api\/v3\/mainapi/i).respond(500, responseError);
					$httpBackend.flush();
					expect(Api.V3.fromApiData).not.toHaveBeenCalled();
					expect(bogus.hasResolved).not.toHaveBeenCalled();
					expect(bogus.hasRejected).toHaveBeenCalled();
				});
				it("should put the right data", () => {
					spyOn(Api.V3, "toApiData").and.returnValue("bogus");
					service.putItemAsync(12, TestServiceBogusClass, data);
					$httpBackend.expectPUT(/api\/v3\/mainapi/i).respond((method: string, url: string, postedData: string) => {
						bogus.hasPosted();
						expect(postedData).toBe("bogus");
						return [500, responseError];
					});
					$httpBackend.flush();
					expect(bogus.hasPosted).toHaveBeenCalled();
				});
				it("should put the right id", () => {
					$httpBackend.expectPUT(/api\/v3\/mainapi\/12/i).respond(500, responseError);
					$httpBackend.expectPUT(/api\/v3\/mainapi\/21/i).respond(500, responseError);

					service.putItemAsync(12, TestServiceBogusClass, data);
					service.putItemAsync(21, TestServiceBogusClass, data);

					expect($httpBackend.flush).not.toThrow();
				});
				it("should call the apiUrl specified if any", () => {
					service.putItemAsync(12, TestServiceBogusClass, data, "/api/v3/bogus");
					$httpBackend.expectPUT(/api\/v3\/bogus/i).respond(500, responseError);
					expect($httpBackend.flush).not.toThrow;
				});
				it("should use the right fields", () => {
					spyOn(Api.V3, "getApiFields").and.callFake((types: any & any[]) => {
						if (types === TestServiceBogusClass) {
							return "bogus,fields";
						}
						if (types === TestServiceFooClass) {
							return "foo,fields";
						}
						return "";
					});
					let fieldsCalled = [];
					$httpBackend.whenPUT((url: string) => {
						let splitUrl = url.substring(1).split("fields=");
						fieldsCalled.push(splitUrl[1]);
						return true;
					}).respond(500, responseError);
					service.putItemAsync(12, () => { }, data);
					service.putItemAsync(12, TestServiceBogusClass, data);
					service.putItemAsync(12, TestServiceFooClass, data);
					$httpBackend.flush();
					expect(fieldsCalled[0]).toBe("");
					expect(fieldsCalled[1]).toBe("bogus,fields");
					expect(fieldsCalled[2]).toBe("foo,fields");
				});
			});
		});
		describe("DELETE", () => {
			describe("deleteItemByIdAsync", () => {
				it("should delete the right id", () => {
					$httpBackend.expectDELETE(/api\/v3\/mainapi\/12/i).respond(500, responseError);
					$httpBackend.expectDELETE(/api\/v3\/mainapi\/21/i).respond(500, responseError);

					service.deleteItemByIdAsync(12);
					service.deleteItemByIdAsync(21);

					expect($httpBackend.flush).not.toThrow();
				});
				it("should call the right api", () => {
					$httpBackend.expectDELETE(/api\/v3\/mainapi/i).respond(200, responseItemEmpty);
					$httpBackend.expectDELETE(/api\/v3\/bogus/i).respond(200, responseItemEmpty);

					service.deleteItemByIdAsync(12);
					service.deleteItemByIdAsync(12, "/api/v3/bogus");

					expect($httpBackend.flush).not.toThrow();
				});
				it("should resolve if the http call resolves", () => {
					$httpBackend.expectDELETE(/api\/v3\/mainapi/i).respond(200, responseItemEmpty);

					service.deleteItemByIdAsync(12)
					.then(bogus.hasResolved, bogus.hasRejected);
					$httpBackend.flush();

					expect(bogus.hasResolved).toHaveBeenCalled();
					expect(bogus.hasRejected).not.toHaveBeenCalled();
				});
				it("should reject if the http call rejects", () => {
					$httpBackend.expectDELETE(/api\/v3\/mainapi/i).respond(500, responseError);

					service.deleteItemByIdAsync(12)
					.then(bogus.hasResolved, (message: string) => {
						bogus.hasRejected();
						expect(message).toBe(responseError.Message);
					});
					$httpBackend.flush();

					expect(bogus.hasResolved).not.toHaveBeenCalled();
					expect(bogus.hasRejected).toHaveBeenCalled();
				});
			});
			describe("deleteItemsAsync", () => {
				let items;
				beforeEach(() => {
					items = [{ id: 1, name: "one" }, { name: "two" }, { id: 3, name: "three" }];
				});
				it("should call the right api", () => {
					$httpBackend.expectDELETE(/api\/v3\/mainapi/i).respond(200, responseItemEmpty);
					$httpBackend.expectDELETE(/api\/v3\/bogus/i).respond(200, responseItemEmpty);

					service.deleteItemsAsync(items);
					service.deleteItemsAsync(items, "/api/v3/bogus");

					expect($httpBackend.flush).not.toThrow();
				});
				it("should not call any api if no items are provided", () => {
					service.deleteItemsAsync([])
					.then(bogus.hasResolved, bogus.hasRejected);

					expect($httpBackend.flush).toThrowError("No pending request to flush !");
					expect(bogus.hasResolved).toHaveBeenCalled();
					expect(bogus.hasRejected).not.toHaveBeenCalled();
				});
				it("should not call any api if no items have an id", () => {
					service.deleteItemsAsync([{ name: "bogus" }])
					.then(bogus.hasResolved, bogus.hasRejected);

					expect($httpBackend.flush).toThrowError("No pending request to flush !");
					expect(bogus.hasResolved).toHaveBeenCalled();
					expect(bogus.hasRejected).not.toHaveBeenCalled();
				});
				it("should delete the right items", () => {
					$httpBackend.expect("DELETE", /api\/v3\/mainapi/i, [{ id: 1 }, { id: 3 }]).respond(200, responseItemEmpty);

					service.deleteItemsAsync(items);

					expect($httpBackend.flush).not.toThrow();
				});
				it("should resolve if the http call resolves", () => {
					$httpBackend.expectDELETE(/api\/v3\/mainapi/i).respond(200, responseItemEmpty);

					service.deleteItemsAsync(items)
					.then(bogus.hasResolved, bogus.hasRejected);
					$httpBackend.flush();

					expect(bogus.hasResolved).toHaveBeenCalled();
					expect(bogus.hasRejected).not.toHaveBeenCalled();
				});
				it("should reject if the http call rejects", () => {
					$httpBackend.expectDELETE(/api\/v3\/mainapi/i).respond(500, responseError);

					service.deleteItemsAsync(items)
					.then(bogus.hasResolved, (message: string) => {
						bogus.hasRejected();
						expect(message).toBe(responseError.Message);
					});
					$httpBackend.flush();

					expect(bogus.hasResolved).not.toHaveBeenCalled();
					expect(bogus.hasRejected).toHaveBeenCalled();
				});
			});
		});
	});
}