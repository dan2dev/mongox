declare module DataX {
    export type StringHyper = StringHyper.Item[];
    export module StringHyper {
        export type Item = {
            type: "text" | "section" | "list" | "image" | "imageCollection";
            value: StringHyper.Text | StringHyper.Section | StringHyper.List | StringHyper.Image | StringHyper.ImageCollection;
        }

        export interface Section {
            count: number;
            template: "row" | "column" | string; // row
            items: StringHyper.Item[];
        }

        export interface Text {
            block: "h1" | "h2" | "h3" | "h4" | "h5" | "p";
            value: DataX.StringLang;
        }

        export interface Code {
            language: "typescript" | "javascript" | "c#" | "c" | "c++" | "sass" | "scss" | "css" | "html";
            value: DataX.StringLang;
        }

        export interface List {
            block: "ul" | "ol";
            items: DataX.StringLang[];
        }

        export interface Image {
            title?: DataX.StringLang;
            description?: DataX.StringLang;
            src: String;
            alt?: DataX.StringLang;
        }

        export interface ImageCollection {
            template: string; // slider, grid, list
            description: string;
            items: Image[];
        }
    }
}
