import type { ObjectId } from "bson";
import type { FilterQuery } from "mongodb";
export declare module MongoX {
    type Id = ObjectId | string;
    interface QueryList<T> {
        skip?: number;
        limit?: number;
        page?: number;
        sortBy?: string | string[] | {
            [field: string]: 1 | -1;
        };
        search?: string;
        query?: FilterQuery<T> | T;
    }
    interface QueryListResult<T> extends QueryList<T> {
        error?: string;
        count: number;
        items: T[];
        pages: number[];
    }
    interface QueryDocument<T> {
        id?: Id;
        query?: FilterQuery<T>;
    }
    interface QueryDocumentResult<T> extends QueryDocument<T> {
        error?: string;
        type: string;
        item?: T;
    }
    interface SaveDocumentResult<T> {
        error?: string;
        type: string;
        id?: Id;
        item?: T;
    }
    interface SaveListResult<T> {
        error?: string;
        type: string;
        ids: Id[];
        items: T[];
    }
    interface Document {
        _id?: any;
        _meta?: DocumentMeta;
    }
    interface DocumentMeta {
    }
    interface ReferenceId {
        _id: Id;
        collectionName: string;
    }
    type ImageExtension = "jpg" | "png" | "svg" | "gif" | "bmp" | "jpeg" | "webp";
    type Coordinates = {
        lat: number;
        lng: number;
    };
    type ISOLang = "en" | "fr" | "es" | "pt" | "it" | "zh" | "hi" | "ar" | "de" | "ja" | "zh" | "ko" | "vi";
    type StringLang = {
        [lang in ISOLang | string]: string;
    };
    module Seo {
        interface Meta {
            meta_title: StringLang;
            meta_description: StringLang;
            meta_keywords: StringLang;
            meta_robots: string;
            meta_copyright: string;
        }
        interface Geo {
            geo_placename: string;
            geo_region: string;
            geo_position: string;
            geo_icbm: string;
        }
        interface Ogp {
            ogp_title: StringLang;
            ogp_site_name: string;
            ogp_description: StringLang;
            ogp_type: string;
            ogp_image: string;
            ogp_url: string;
        }
        interface Twitter {
            twitter_title: StringLang;
            twitter_description: StringLang;
            twitter_image: string;
            twitter_image_alt: StringLang;
            twitter_card: StringLang;
            twitter_site: string;
            twitter_creator: string;
        }
    }
}
