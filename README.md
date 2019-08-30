# MongoX
Typescript framework to build APIs using Mongodb and Expressjs.

## usage

Declare the collection module.
```typescript
declare module Collection.People {
  export interface Person extends DataX.MongoDocument {
    firstName: string;
    lastName: string;
    phone: string;
    groupId: DataX.MongoId;
  }
  export interface Group extends DataX.MongoDocument {
    groupName: string;
  }
}
```

Create the data manager
```typescript
export module People {
  export class PersonManager extends MongoX.Manager<Collection.People.Person> {
    private static collectionName: string = "People.Person";
    public static get sharedInstance(): PersonManager {
      return MongoX.Manager.getManager(this.collectionName, PersonManager);
    }
    public async instantiated() {
    }
  }
}
```

Create simple crud API router fro your expressjs project
```typescript
export const peoplePersonRouter = Router();
MongoX.Api.setBasicBread({ router: peoplePersonRouter, managerType: People.PersonManager })
```