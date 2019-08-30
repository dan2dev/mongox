// reference here : https://www.advancedwebranking.com/blog/meta-tags-important-in-seo/

declare module DataX.Seo {
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
