export declare module Setup {
    interface MongoSetupForCollection {
        uri: string;
        database: string;
    }
    interface MongoSetup {
        [collection: string]: MongoSetupForCollection;
        default: MongoSetupForCollection;
    }
}
export default Setup;
