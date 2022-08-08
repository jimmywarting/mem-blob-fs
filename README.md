mem-blob-fs
=============

Simple in-memory blob file store (similar to `mem-fs` but uses standard web
File's instead of vinyl)

Usage
-------------

`mem-blob-fs` depends on
- 1 thing: the `File` constructor.
- 2 things if you want to be able to fallback to filesystem.

It generally depends on `fetch-blob/from.js` on the NodeJS side
but it's an optional dependency and also works without it in the browser

```js
import Store from 'mem-blob-fs'
import * as fs from 'fetch-blob/from.js'

Store.fs = fs

const store = new Store()
```

The store extends both `Map` and `EventTarget` and has the same functionality

### Loading a file

You access a file using `store#get()` method. If the file is in memory, it will
be used. Otherwise, the overwritten get fn will load the file from the `node:fs`

```js
import Store from 'mem-blob-fs'
import * as fs from 'fetch-blob/from.js'

Store.fs = fs // required to fallback to files on the disc.

const store = new Store()
const file = store.get('test/file.txt')
await file.text()
```

When trying to load a file we cannot read from disk, an empty File will be
instead be returned. The contents of this file will be set to an empty string.

Trying to get a directory or any invalid files will also return an empty File.

### Adding/updating a file

You update file references by using `store#set(path, file)` method.
This method take a regular file or blob object as 2nd parameter.

```js
import Store from 'mem-blob-fs'

const store = new Store()
const file = new File(['test = 123'], 'file.coffee')
store.set('test/file.coffee', coffeeFile)
```

Using `store#set` will trigger a change event every time
```js
// evt is a ChangeEvent class that extends normal Event \w two new props
function fn (evt) {
  evt.path
  evt.file
}

store.addEventListener('change', fn, { signal, once })`
```

### Iterating over the file system

Using `store#forEach(cb(file, path))`, you can iterate over every file stored in
the file system.

Map also has Symbol.iterator, `.values()`, and `.keys()` that returns an iterator
so you can use `for..of` loops

### Get all files

Using `store#values()`, (provided provided by Map) will give you can an iterator
of all files stored in the memory.

### Check existence in the file system

Using `store#has(path)`, you can check if the file already exists in the file
system without loading it from disk.

### Stream every file stored in the file system


Using `store#values()`, you can create a iterator that will all yield blobs
use it to construct a new file to concatenate it into one single large file
```js
// one large concatenated file (nothing is read until you actually start reading)
const file = new File(store#values(), '')

await file.text()
await file.arrayBuffer()
file.stream() // whatwg ReadableStream
