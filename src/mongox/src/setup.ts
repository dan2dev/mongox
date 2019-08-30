export module Setup {
  export interface MongoSetupForCollection {
    uri: string;
    database: string;
  }

  export interface MongoSetup {
    [collection: string]: MongoSetupForCollection;

    default: MongoSetupForCollection;
  }
}
export default Setup;
