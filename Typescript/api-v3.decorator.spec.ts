module Api.V3.Test {
	@Api.V3.resource("BasicClass")
	class BasicClass {
		@Api.V3.apiField()
		id: number;
		notApiField: string;
	}
	@Api.V3.resource("BasicDependency")
	class BasicDependency {
		@Api.V3.apiResource("BasicClass")
		basicClass: BasicClass;
	}
	@Api.V3.resource("BasicDependencyWithExtractedId")
	class BasicDependencyWithExtractedId {
		@Api.V3.apiResource("BasicClass", true)
		basicClass: BasicClass;
	}
	@Api.V3.resource("ArrayOfBasicDependencies")
	class ArrayOfBasicDependencies {
		@Api.V3.apiResources("BasicClass")
		arrayDependencies: BasicClass[];
	}
	@Api.V3.resource("TwoLevelDependency")
	class TwoLevelDependency {
		@Api.V3.apiResource("BasicDependency")
		basicDependency: BasicDependency;
	}
	@Api.V3.resource("CircularDependency")
	class CircularDependency {
		@Api.V3.apiField()
		name: string;
		@Api.V3.apiResource("CircularDependency")
		circularDependency: CircularDependency;
	}
	@Api.V3.resource("WithCompositeDependency")
	class WithCompositeDependency {
		@Api.V3.apiResource("BasicClass,BasicDependency")
		compositeDependency: BasicClass & BasicDependency
	}
	@Api.V3.resource("HasAMoment")
	class HasAMoment {
		@Api.V3.apiField("moment")
		start: moment.Moment;
	}
	@Api.V3.resource("HasAnEnum")
	class HasAnEnum {
		private static myEnum: EnumValue[] = [new EnumValue(0, "zero"), new EnumValue(1, "one"), new EnumValue(2, "two")]
		@Api.V3.apiField("enum", HasAnEnum.myEnum)
		myEnum: EnumValue;
	}
	@Api.V3.resource("HasADuration")
	class HasADuration {
		@Api.V3.apiField("duration")
		duration: moment.Duration;
	}
	@Api.V3.resource("HasADate")
	class HasADate {
		@Api.V3.apiField("date")
		date: Date;
	}
	@Api.V3.resource("HasADependencyWithAMoment")
	class HasADependencyWithAMoment {
		@Api.V3.apiResource("HasAMoment")
		hasAMoment: HasAMoment;
	}
	@Api.V3.resource("HasADependencyWithAnEnum")
	class HasADependencyWithAnEnum {
		@Api.V3.apiResource("HasAnEnum")
		hasAnEnum: HasAnEnum;
	}
	@Api.V3.resource("HasADependencyWithADuration")
	class HasADependencyWithADuration {
		@Api.V3.apiResource("HasADuration")
		hasADuration: HasADuration;
	}
	@Api.V3.resource("HasADependencyWithADate")
	class HasADependencyWithADate {
		@Api.V3.apiResource("HasADate")
		hasADate: HasADate;
	}

	describe("getApiFields", () => {
		describe("of a simple class", () => {
			it("should return the class apifields", () => {
				expect(Api.V3.getApiFields(BasicClass)).toBe("id");
			});
		});
		describe("of a class with a dependency", () => {
			it("should return the dependency fields between brackets with the field name before it", () => {
				expect(Api.V3.getApiFields(BasicDependency)).toBe("basicClass[" + Api.V3.getApiFields(BasicClass) + "]");
			});
		});
		describe("of a class with an array of basic dependencies", () => {
			it("should return the dependency fields between brackets with the field name before it", () => {
				expect(Api.V3.getApiFields(ArrayOfBasicDependencies)).toBe("arrayDependencies[" + Api.V3.getApiFields(BasicClass) + "]");
			});
		});
		describe("on a list of classes", () => {
			it("should return the concatenation of each class fields", () => {
				expect(Api.V3.getApiFields([BasicClass, BasicDependency])).toBe([Api.V3.getApiFields(BasicClass), Api.V3.getApiFields(BasicDependency)].toString());
			});
		});
		describe("on a class with nested dependencies", () => {
			it("should return the fields of the dependency", () => {
				expect(Api.V3.getApiFields(TwoLevelDependency)).toBe("basicDependency[" + Api.V3.getApiFields(BasicDependency) + "]");
			});
		});
		describe("on a class with circular dependencies", () => {
			it("should not provoc infinite loop", () => {
				expect(() => { Api.V3.getApiFields(CircularDependency) }).not.toThrow();
			});
		});
		describe("on a class with a class union dependency", () => {
			it("should return the union of both dependency fields", () => {
				expect(Api.V3.getApiFields(WithCompositeDependency)).toBe("compositeDependency[" + [Api.V3.getApiFields(BasicClass), Api.V3.getApiFields(BasicDependency)].toString() + "]");
			});
		});
	});

	describe("fromApiData", () => {
		describe("of a simple class", () => {
			it("should return a copy the apiData", () => {
				let apiData = { id: 1, stuff: "someStuff" };
				expect(Api.V3.fromApiData(BasicClass, apiData)).toEqual(apiData);
			});
		});
		describe("of a class with an apiField of type moment", () => {
			it("should return the field formated to a moment", () => {
				let apiData = { start: '2014-01-01' };
				expect(Api.V3.fromApiData(HasAMoment, apiData).start.year()).toBe(2014);
			});
			it("should handle undefined", () => {
				let apiData = { start: undefined };
				expect(Api.V3.fromApiData(HasAMoment, apiData)).toEqual({ start: undefined });
			});
			it("should handle null", () => {
				let apiData = { start: null };
				expect(Api.V3.fromApiData(HasAMoment, apiData)).toEqual({ start: null });
			});
			it("should handle invalid moments", () => {
				let apiData = { start: "invalid argument" };
				expect(Api.V3.fromApiData(HasAMoment, apiData).start._i).toBe("invalid argument");
			});
		});
		describe("of a class with an apiField of type duration", () => {
			it("should return the field formated to a duration", () => {
				let apiData = { duration: '03:00:00' };
				expect(Api.V3.fromApiData(HasADuration, apiData).duration.hours()).toBe(3);
			});
			it("should handle undefined", () => {
				let apiData = { duration: undefined };
				expect(Api.V3.fromApiData(HasADuration, apiData)).toEqual({ duration: undefined });
			});
			it("should handle null", () => {
				let apiData = { duration: null };
				expect(Api.V3.fromApiData(HasADuration, apiData)).toEqual({ duration: null });
			});
			it("should handle invalid durations", () => {
				let apiData = { duration: "invalid argument" };
				expect(Api.V3.fromApiData(HasADuration, apiData).duration.hours()).toBe(0);
			});
		});
		describe("of a class with an apiField of type date", () => {
			it("should return the field formated to a date", () => {
				let apiData = { date: '2014-01-01' };
				expect(Api.V3.fromApiData(HasADate, apiData).date.getFullYear()).toBe(2014);
			});
			it("should handle undefined", () => {
				let apiData = { date: undefined };
				expect(Api.V3.fromApiData(HasADate, apiData)).toEqual({ date: undefined });
			});
			it("should handle null", () => {
				let apiData = { date: null };
				expect(Api.V3.fromApiData(HasADate, apiData)).toEqual({ date: null });
			});
			it("should handle invalid dates", () => {
				let apiData = { date: "invalid argument" };
				expect(Api.V3.fromApiData(HasADate, apiData).date.toString()).toBe("Invalid Date");
			});
		});
		describe("of a class with an apiField of type enum", () => {
			it("should return the field formated to a moment", () => {
				let apiData = { myEnum: 0 };
				expect(Api.V3.fromApiData(HasAnEnum, apiData).myEnum.key).toBe(0);
				expect(Api.V3.fromApiData(HasAnEnum, apiData).myEnum.label).toBe("zero");
				apiData = { myEnum: 1 };
				expect(Api.V3.fromApiData(HasAnEnum, apiData).myEnum.key).toBe(1);
				expect(Api.V3.fromApiData(HasAnEnum, apiData).myEnum.label).toBe("one");
			});
			it("should handle undefined", () => {
				let apiData = { myEnum: undefined };
				expect(Api.V3.fromApiData(HasAnEnum, apiData)).toEqual({ myEnum: undefined });
			});
			it("should handle null", () => {
				let apiData = { myEnum: null };
				expect(Api.V3.fromApiData(HasAnEnum, apiData)).toEqual({ myEnum: null });
			});
			it("should handle unknown keys", () => {
				let apiData = { myEnum: "invalid key" };
				expect(Api.V3.fromApiData(HasAnEnum, apiData).myEnum.key).toBe("invalid key");
				expect(Api.V3.fromApiData(HasAnEnum, apiData).myEnum.label).toBe("UNKNOWN_KEY");
			});
		});
		describe("on a class with a basic dependency", () => {
			it("should be the result of calling the function on each dependency", () => {
				let apiData = { basicClass: { id: 12 } };
				expect(Api.V3.fromApiData(BasicDependency, apiData)).toEqual({ basicClass: Api.V3.fromApiData(BasicClass, apiData.basicClass) });
			});
		});
		describe("on a class with an array of basic dependencies", () => {
			it("should be the result of calling the function on each dependency", () => {
				let apiData = { arrayDependencies: [{ id: 12 }, { id: 12 }] };
				expect(Api.V3.fromApiData(ArrayOfBasicDependencies, apiData)).toEqual({
					arrayDependencies: _.map(apiData.arrayDependencies, (basicClass: BasicClass) => {
						return Api.V3.fromApiData(BasicClass, basicClass);
					})
				});
			});
		});
		describe("on a class with a dependency having a moment", () => {
			it("should be the result of calling the function on each dependency", () => {
				let apiData = { hasAMoment: { start: '2014-01-01' } };
				expect(Api.V3.fromApiData(HasADependencyWithAMoment, apiData)).toEqual({ hasAMoment: Api.V3.fromApiData(HasAMoment, apiData.hasAMoment) });
			});
		});
		describe("on a class with a dependency having an enum", () => {
			it("should be the result of calling the function on each dependency", () => {
				let apiData = { hasAnEnum: { myEnum: 2 } };
				expect(Api.V3.fromApiData(HasADependencyWithAnEnum, apiData)).toEqual({ hasAnEnum: Api.V3.fromApiData(HasAnEnum, apiData.hasAnEnum) });
			});
		});
		describe("on a class with a dependency having a duration", () => {
			it("should be the result of calling the function on each dependency", () => {
				let apiData = { hasADuration: { duration: "03:00:00" } };
				expect(Api.V3.fromApiData(HasADependencyWithADuration, apiData)).toEqual({ hasADuration: Api.V3.fromApiData(HasADuration, apiData.hasADuration) });
			});
		});
		describe("on a class with a dependency having a date", () => {
			it("should be the result of calling the function on each dependency", () => {
				let apiData = { hasADate: { date: '2014-01-01' } };
				expect(Api.V3.fromApiData(HasADependencyWithADate, apiData)).toEqual({ hasADate: Api.V3.fromApiData(HasADate, apiData.hasADate) });
			});
		});
		describe("on multiple types", () => {
			it("should return the fields of the dependency", () => {
				let apiData = { id: 1, stuff: "someStuff", start: "2012-01-01", basicClass: { id: 2 } };
				let data = <BasicClass & HasAMoment & BasicDependency>Api.V3.fromApiData([BasicClass, HasAMoment, BasicDependency], apiData)
				expect(data.start.year()).toBe(2012);
				expect(data.id).toBe(1);
				expect(data.basicClass.id).toBe(2);
			});
		});
	});
	describe("toApiData", () => {
		let basicClass: BasicClass;
		let basicDependency: BasicDependency;
		let arrayOfBasicDependencies: ArrayOfBasicDependencies;
		let twoLevelDependency: TwoLevelDependency;
		let circularDependency: CircularDependency;
		let withCompositeDependency: WithCompositeDependency;
		let compositeClass: BasicClass & HasAMoment & HasADependencyWithAMoment;
		let basicDependencyWithExtractedId: BasicDependencyWithExtractedId;
		let hasAMoment: HasAMoment;
		let hasAnEnum: HasAnEnum;
		let hasADuration: HasADuration;
		let hasADate: HasADate;
		let hasADependencyWithAMoment: HasADependencyWithAMoment;
		let hasADependencyWithAnEnum: HasADependencyWithAnEnum;
		let hasADependencyWithADuration: HasADependencyWithADuration;
		let hasADependencyWithADate: HasADependencyWithADate;
		beforeEach(() => {
			basicClass = new BasicClass(); basicClass.id = 12; basicClass.notApiField = "stuff";
			basicDependency = new BasicDependency(); basicDependency.basicClass = basicClass;
			arrayOfBasicDependencies = new ArrayOfBasicDependencies(); arrayOfBasicDependencies.arrayDependencies = [basicClass, basicClass];
			twoLevelDependency = new TwoLevelDependency(); twoLevelDependency.basicDependency = basicDependency;
			circularDependency = new CircularDependency(); circularDependency.name = "azazel, bane of infinite loops"; circularDependency.circularDependency = circularDependency;
			withCompositeDependency = new WithCompositeDependency(); withCompositeDependency.compositeDependency = _.extend(basicClass, basicDependency);
			compositeClass = _.extend(basicClass, hasAMoment, hasADependencyWithAMoment);
			basicDependencyWithExtractedId = new BasicDependencyWithExtractedId(); basicDependencyWithExtractedId.basicClass = basicClass;
			hasAMoment = new HasAMoment(); hasAMoment.start = moment('1515-09-13');
			hasAnEnum = new HasAnEnum(); hasAnEnum.myEnum = new EnumValue(2, "two");
			hasADuration = new HasADuration(); hasADuration.duration = moment.duration("03:00:00");
			hasADate = new HasADate(); hasADate.date = new Date("2014-01-01");
			hasADependencyWithAMoment = new HasADependencyWithAMoment(); hasADependencyWithAMoment.hasAMoment = hasAMoment;
			hasADependencyWithAnEnum = new HasADependencyWithAnEnum(); hasADependencyWithAnEnum.hasAnEnum = hasAnEnum;
			hasADependencyWithADuration = new HasADependencyWithADuration(); hasADependencyWithADuration.hasADuration = hasADuration;
			hasADependencyWithADate = new HasADependencyWithADate(); hasADependencyWithADate.hasADate = hasADate;
		});
		describe("of a basic class", () => {
			it("should return the class apifields and their value", () => {
				expect(Api.V3.toApiData(BasicClass, basicClass)).toEqual({ id: basicClass.id });
			});
			it("should remove undefined values", () => {
				basicClass.id = undefined;
				expect(Api.V3.toApiData(BasicClass, basicClass)).toEqual({});
			});
			it("should keep null values", () => {
				basicClass.id = null;
				expect(Api.V3.toApiData(BasicClass, basicClass)).toEqual({ id: basicClass.id });
			});
		});
		describe("of a basic dependency", () => {
			it("should return the class dependencies and the apiData of their value", () => {
				expect(Api.V3.toApiData(BasicDependency, basicDependency)).toEqual({ basicClass: Api.V3.toApiData(BasicClass, basicClass) });
			});
		});
		describe("of an array of basic dependencies", () => {
			it("should return the class dependencies and the apiData of their value", () => {
				expect(Api.V3.toApiData(ArrayOfBasicDependencies, arrayOfBasicDependencies)).toEqual({ arrayDependencies: [Api.V3.toApiData(BasicClass, basicClass), Api.V3.toApiData(BasicClass, basicClass)] });
			});
			it("should ignore the key if the value is undefined", () => {
				arrayOfBasicDependencies.arrayDependencies = undefined;
				expect(Api.V3.toApiData(ArrayOfBasicDependencies, arrayOfBasicDependencies)).toEqual({});
			});
			it("should send an empty array if the value is null", () => {
				arrayOfBasicDependencies.arrayDependencies = null;
				expect(Api.V3.toApiData(ArrayOfBasicDependencies, arrayOfBasicDependencies)).toEqual({ arrayDependencies: [] });
			});
		});
		describe("of a two level dependency", () => {
			it("should return the class dependencies and the apiData of their value", () => {
				expect(Api.V3.toApiData(TwoLevelDependency, twoLevelDependency)).toEqual({ basicDependency: Api.V3.toApiData(BasicDependency, basicDependency) });
			});
		});
		describe("of a circular dependency", () => {
			it("should not throw", () => {
				expect(() => { Api.V3.toApiData(CircularDependency, circularDependency); }).not.toThrow();
			});
		});
		describe("of a composite class", () => {
			it("should return a _.extend of each type", () => {
				let extendedToApiData = _.extend(Api.V3.toApiData(BasicClass, basicClass), Api.V3.toApiData(HasAMoment, hasAMoment), Api.V3.toApiData(HasADependencyWithAMoment, hasADependencyWithAMoment));
				expect(Api.V3.toApiData([BasicClass, HasAMoment, HasADependencyWithAMoment], compositeClass)).toEqual(extendedToApiData);
			});
		});
		describe("of a class with composite dependency", () => {
			it("should call the toApiData on the composite dependency", () => {
				expect(Api.V3.toApiData(WithCompositeDependency, withCompositeDependency)).toEqual({ compositeDependency: Api.V3.toApiData([BasicClass, BasicDependency], withCompositeDependency.compositeDependency) });
			});
		});
		describe("of a class with dependency from which we extract the id", () => {
			it("should have extracted the dependency's id and removed the dependency", () => {
				expect(Api.V3.toApiData(BasicDependencyWithExtractedId, basicDependencyWithExtractedId)).toEqual({ basicClassId: basicDependencyWithExtractedId.basicClass.id });
			});
			it("should keep null", () => {
				basicDependencyWithExtractedId.basicClass = null;
				expect(Api.V3.toApiData(BasicDependencyWithExtractedId, basicDependencyWithExtractedId)).toEqual({ basicClassId: null });
			});
			it("should remove undefined", () => {
				basicDependencyWithExtractedId.basicClass = undefined;
				expect(Api.V3.toApiData(BasicDependencyWithExtractedId, basicDependencyWithExtractedId)).toEqual({});
			});
		});
		describe("of a class with a type===moment", () => {
			it("should format the value", () => {
				expect(Api.V3.toApiData(HasAMoment, hasAMoment)).toEqual({ start: hasAMoment.start.format("YYYY-MM-DD[T]HH:mm:ss") });
			});
			it("should return null", () => {
				hasAMoment.start = null;
				expect(Api.V3.toApiData(HasAMoment, hasAMoment)).toEqual({ start: null });
			});
			it("should remove undefined", () => {
				hasAMoment.start = undefined;
				expect(Api.V3.toApiData(HasAMoment, hasAMoment)).toEqual({});
			});
			it("should return an invalid date initial parameter", () => {
				hasAMoment.start = moment("invalid argument");
				expect(Api.V3.toApiData(HasAMoment, hasAMoment)).toEqual({ start: "invalid argument" });
			});
		});
		describe("of a class with a type===enum", () => {
			it("should extract the key", () => {
				expect(Api.V3.toApiData(HasAnEnum, hasAnEnum)).toEqual({ myEnum: hasAnEnum.myEnum.key });
			});
			it("should return null", () => {
				hasAnEnum.myEnum = null;
				expect(Api.V3.toApiData(HasAnEnum, hasAnEnum)).toEqual({ myEnum: null });
			});
			it("should remove undefined", () => {
				hasAnEnum.myEnum = undefined;
				expect(Api.V3.toApiData(HasAnEnum, hasAnEnum)).toEqual({});
			});
			it("should return an unknown key", () => {
				hasAnEnum.myEnum = new EnumValue(4);
				expect(Api.V3.toApiData(HasAnEnum, hasAnEnum)).toEqual({ myEnum: 4 });
			});
		});
		describe("of a class with a type===duration", () => {
			it("should format the value in hours", () => {
				expect(Api.V3.toApiData(HasADuration, hasADuration)).toEqual({ duration: "03:00:00" });
			});
			it("should format the value in days", () => {
				hasADuration.duration = moment.duration("2.7:17:00");
				expect(Api.V3.toApiData(HasADuration, hasADuration)).toEqual({ duration: "2.07:17:00" });
			});
			it("should handle negative values", () => {
				hasADuration.duration = moment.duration(-2, 'h');
				expect(Api.V3.toApiData(HasADuration, hasADuration)).toEqual({ duration: "-02:00:00" });
			});
			it("should return null", () => {
				hasADuration.duration = null;
				expect(Api.V3.toApiData(HasADuration, hasADuration)).toEqual({ duration: null });
			});
			it("should remove undefined", () => {
				hasADuration.duration = undefined;
				expect(Api.V3.toApiData(HasADuration, hasADuration)).toEqual({});
			});
			it("should return '00:00:00' when an invalid duration initial parameter is given", () => {
				hasADuration.duration = moment.duration("invalid argument");
				expect(Api.V3.toApiData(HasADuration, hasADuration)).toEqual({ duration: "00:00:00" });
			});
		});
		describe("of a class with a type===date", () => {
			it("should format the value", () => {
				expect(Api.V3.toApiData(HasADate, hasADate)).toEqual({ date: moment(hasADate.date).format("YYYY-MM-DD[T]HH:mm:ss") });
			});
			it("should return null", () => {
				hasADate.date = null;
				expect(Api.V3.toApiData(HasADate, hasADate)).toEqual({ date: null });
			});
			it("should remove undefined", () => {
				hasADate.date = undefined;
				expect(Api.V3.toApiData(HasADate, hasADate)).toEqual({});
			});
			it("should return an invalid date initial parameter", () => {
				hasADate.date = new Date("invalid argument");
				expect(Api.V3.toApiData(HasADate, hasADate)).toEqual({ date: "Invalid Date" });
			});
		});
		describe("of a class with dependency having a field type===moment", () => {
			it("should still call toApiField of the dependency", () => {
				expect(Api.V3.toApiData(HasADependencyWithAMoment, hasADependencyWithAMoment)).toEqual({ hasAMoment: Api.V3.toApiData(HasAMoment, hasAMoment) });
			});
		});
		describe("of a class with dependency having a field type===enum", () => {
			it("should still call toApiField of the dependency", () => {
				expect(Api.V3.toApiData(HasADependencyWithAnEnum, hasADependencyWithAnEnum)).toEqual({ hasAnEnum: Api.V3.toApiData(HasAnEnum, hasAnEnum) });
			});
		});
		describe("of a class with dependency having a field type===duration", () => {
			it("should still call toApiField of the dependency", () => {
				expect(Api.V3.toApiData(HasADependencyWithADuration, hasADependencyWithADuration)).toEqual({ hasADuration: Api.V3.toApiData(HasADuration, hasADuration) });
			});
		});
		describe("of a class with dependency having a field type===date", () => {
			it("should still call toApiField of the dependency", () => {
				expect(Api.V3.toApiData(HasADependencyWithADate, hasADependencyWithADate)).toEqual({ hasADate: Api.V3.toApiData(HasADate, hasADate) });
			});
		});
	});
}
module Api.V3.TestBis {
	describe("resource decorator", () => {
		it("should warn when two classes have the same name", () => {
			spyOn(console, "warn");
			@Api.V3.resource("BasicClass")
			class BasicClass { }
			expect(console.warn).toHaveBeenCalled();
		});
		it("should warn no resourcename is provided", () => {
			spyOn(console, "warn");
			@Api.V3.resource()
			class bogus { }
			expect(console.warn).toHaveBeenCalled();
		});
	});
}