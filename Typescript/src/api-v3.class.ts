module Api.V3 {
	"use strict";
	export class ResponseCollection<T> {
		public data: {
			items: T[]
		};
		/* tslint:disable */
		private header: Header;
		/* tslint:enable */
	}

	export class ResponseItem<T> {
		public data: T;
		/* tslint:disable */
		private header: Header;
		/* tslint:enable */
	}
	export class ResponseError {
		/* tslint:disable */
		public Status: number;
		public Message: string;
		/* tslint:enable */
	}

	class Header {
		public generated: string;
		public serverTime: number;
		public queryTime: number;
		public principal: string;
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
