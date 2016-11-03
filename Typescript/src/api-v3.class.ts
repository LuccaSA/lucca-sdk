module Api.V3 {
	"use strict";
	export interface IResponseCollection<T> {
		data?: {
			count?: number;
			items?: T[]
		};
	}

	export interface IResponseItem<T> {
		data?: T;
	}
	export interface IResponseError {
		/* tslint:disable */
		Status?: number;
		Message?: string;
		/* tslint:enable */
	}

	export class EnumValue {
		public key: any;
		public label: string;
		constructor(key: any, label?: string) {
			this.key = key;
			this.label = label || "UNKNOWN_KEY";
		}
	}
}
