import assert from 'assert'
import { File, fileFromSync } from 'fetch-blob/from.js'
import memFs from '../mod.js'

memFs.fs = { File, fileFromSync }

const fixtureA = 'test/fixtures/file-a.txt'
const fixtureB = 'test/fixtures/file-b.txt'
const absentFile = 'fixture/does-not-exist.txt'
const coffeeFile = new File(['test = 123'], 'file.coffee')

const store = new memFs()

console.group('#get() / #add() / #existsInMemory()')
{
  console.info('load file from disk')
  const file = store.get(fixtureA)
  assert.equal(await file.text(), 'foo\n')
  assert.equal(file.name, 'file-a.txt')
  store.clear()
}
{
  console.info('file should not exist in memory')
  const exists = store.has(fixtureA)
  assert.equal(exists, false)
  store.clear()
}
{
  console.info('file should exist in memory after getting it')
  store.get(fixtureA)
  const exists = store.has(fixtureA)
  assert.equal(exists, true)
  store.clear()
}
{
  console.info('get/modify/add a file')
  const file = store.get(fixtureA)
  store.set(fixtureA, new File(['bar'], 'file-a.txt'))
  const file2 = store.get(fixtureA)
  assert.equal(await file2.text(), 'bar')
  store.clear()
}
{
  console.info('retrieve file from memory')
  store.set('test/file.coffee', coffeeFile)
  const file = store.get('test/file.coffee')
  assert.equal(await file.text(), 'test = 123')
  store.clear()
}
{
  console.info('returns empty file reference if file does not exist')
  const file = store.get(absentFile)
  assert.equal(await file.text(), '')
  store.clear()
}

console.groupEnd()

console.group('#set()')
{
  console.info('is chainable')
  assert.equal(store.set(coffeeFile), store)
  store.clear()
}
{
  console.info('change event triggered')
  const fn = evt => {
    assert.equal(evt.type, 'change')
    assert.equal(evt.file.name, 'file.coffee')
    const file = store.get('test/file.coffee')
    assert.equal(file.size, coffeeFile.size)
  }
  store.addEventListener('change', fn)
  store.set('test/file.coffee', coffeeFile)
  store.removeEventListener('change', fn)
  store.clear()
}
console.groupEnd()

console.group('#forEach()')
{
  console.info('iterate over every files')
  store.get(fixtureA)
  store.get(fixtureB)
  const items = []
  store.forEach(file => {
    items.push(file)
  })
  const text = await new File(items, '').text()
  assert.equal(text, 'foo\nfoo\n')
  store.clear()
};

console.groupEnd()

console.log('================')
console.log('all tests passed')
console.log('================')
