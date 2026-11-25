# folders



List folders available in the current workspace.


```graphql
folders(
  limit: Int
  offset: Int
): [Folder!]!
```


### Arguments

#### `folders.limit` · [`Int`](./scalars-int.md) **scalar** 
Maximum number of folders to return.


#### `folders.offset` · [`Int`](./scalars-int.md) **scalar** 
Number of folders to skip before returning results.




### Type

#### [`Folder`](./objects-folder.md) **object** 
A virtual folder used to organize workspace resources.




### Example


```graphql
query ListFolders {
  folders {
    id
    name
    parent
    createdAt
  }
}
```