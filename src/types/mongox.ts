import type { ObjectId } from "bson";
import type { FilterQuery } from "mongodb";

export module MongoX {
  // export type MongoDocument = Document;
  // export type MongoId = Id;
  // export type ReferenceId = ReferenceId;
  export type Id = ObjectId | string;
  // MARK: Query
  export interface QueryList<T> {
    skip?: number;
    limit?: number;
    page?: number;
    // pageSize?: number;
    sortBy?: string | string[] | { [field: string]: 1 | -1 };
    search?: string;
    query?: FilterQuery<T> | T; // FilterQuery<T> | T;
  }
  export interface QueryListResult<T> extends QueryList<T> {
    error?: string;
    count: number;
    items: T[];
    pages: number[];
  }
  export interface QueryDocument<T> {
    id?: Id;
    query?: FilterQuery<T>;
  }
  export interface QueryDocumentResult<T> extends QueryDocument<T> {
    error?: string;
    type: string;
    item?: T;
  }
  export interface SaveDocumentResult<T> {
    error?: string;
    type: string;
    id?: Id;
    item?: T;
  }
  export interface SaveListResult<T> {
    error?: string;
    type: string;
    ids: Id[];
    items: T[];
  }
  // MARK: Document
  export interface Document {
    // [key: string]: any;
    // _id?: Id;
    _id?: any;
    _meta?: DocumentMeta;
  }
  export interface DocumentMeta {

  }
  export interface ReferenceId {
    _id: Id;
    collectionName: string;
  }
  export type ImageExtension = "jpg" | "png" | "svg" | "gif" | "bmp" | "jpeg" | "webp";
  export type Coordinates = { lat: number, lng: number };
  // Language
  export type ISOLang = "en" | "fr" | "es" | "pt" | "it" | "zh" | "hi" | "ar" | "de" | "ja" | "zh" | "ko" | "vi";
  export type StringLang = {
    [lang in ISOLang | string]: string;
  };
  // SEO
  export module Seo {
    export interface Meta {
      meta_title: StringLang;
      meta_description: StringLang;
      meta_keywords: StringLang;
      meta_robots: string; // index, follow
      meta_copyright: string; // dan2dev is a registered trademark.
    }

    export interface Geo {
      geo_placename: string; // placename
      geo_region: string; // region
      geo_position: string; // position: 20.593684;78.96288
      geo_icbm: string; // ICBM 20.593684, 78.96288
    }

    export interface Ogp {
      ogp_title: StringLang; // fb
      ogp_site_name: string; // sitename
      ogp_description: StringLang; // fb
      ogp_type: string; // type: article
      ogp_image: string; // main image for the seo // fb
      ogp_url: string; //  link permanent the entity. Needs to be absolute. for this (ex.: /something-something/ or /{language}/something-something/ // fb
    }

    export interface Twitter {
      twitter_title: StringLang; // TITLE OF POST OR PAGE
      twitter_description: StringLang; // description
      twitter_image: string; // link to the image
      twitter_image_alt: StringLang; // lat of the image
      twitter_card: StringLang; // summary of the large image
      twitter_site: string; // @USERNAME
      twitter_creator: string; // @USERNAME
    }
  }
}

