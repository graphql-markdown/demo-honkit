# folderCreated



Receive folders as they are created in the workspace.


```graphql
folderCreated(
  parentId: ID
): Folder!
```


### Arguments

#### `folderCreated.parentId` · [`ID`](./scalars-id.md) **scalar** 
Limit events to folders created under this parent.




### Type

#### [`Folder`](./objects-folder.md) **object** 
A virtual folder used to organize workspace resources.




### Example


```graphql
subscription WatchFolders($parentId: ID) {
  folderCreated(parentId: $parentId) {
    id
    name
    parent
    createdAt
  }
}
```