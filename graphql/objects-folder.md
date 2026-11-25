# Folder



A virtual folder used to organize workspace resources.


```graphql
type Folder implements Node {
  id: ID!
  name: String!
  parent: String
  createdAt: DateTime!
}
```


### Fields

#### `Folder.id` · [`ID!`](./scalars-id.md) **non-null** **scalar** 
The unique identifier of the folder.


#### `Folder.name` · [`String!`](./scalars-string.md) **non-null** **scalar** 
The human-readable folder name.


#### `Folder.parent` · [`String`](./scalars-string.md) **scalar** 
The identifier of the parent folder, when nested.


#### `Folder.createdAt` · [`DateTime!`](./scalars-date-time.md) **non-null** **scalar** 
When the folder was created.




### Interfaces

#### [`Node`](./interfaces-node.md) **interface** 
A globally unique entity identifier.




### Example


```graphql
{
  "id": "folder_01",
  "name": "Product Planning",
  "parent": "folder_root",
  "createdAt": "2026-09-05T09:30:00Z"
}
```




### Returned By

[`createFolder`](./mutations-create-folder.md)  **mutation** · [`folder`](./queries-folder.md)  **query** · [`folderCreated`](./subscriptions-folder-created.md)  **subscription** · [`folders`](./queries-folders.md)  **query**

### Member Of

[`Project`](./objects-project.md)  **object**

### Implemented By

[`SearchResult`](./unions-search-result.md)  **union**