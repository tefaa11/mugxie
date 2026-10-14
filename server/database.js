import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { defaultProducts, defaultCategories } from '../src/data/initialProducts.js'
import { defaultStoreConfig } from '../src/data/storeConfig.js'
export function openStore(path = resolve('server/data/mugxie.sqlite')) {
  mkdirSync(dirname(path), { recursive: true })
  const db = new DatabaseSync(path)
  db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS resources (name TEXT PRIMARY KEY, value TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0); CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, type TEXT NOT NULL, content BLOB NOT NULL);`)
  const { adminPin, ...config } = defaultStoreConfig
  for (const [name,value] of Object.entries({ products:defaultProducts, categories:defaultCategories, testimonials:[], config })) db.prepare('INSERT OR IGNORE INTO resources(name,value) VALUES (?,?)').run(name,JSON.stringify(value))
  return db
}
export function readResource(db,name) { const row=db.prepare('SELECT * FROM resources WHERE name=?').get(name); return row && {value:JSON.parse(row.value),revision:row.revision} }
export function writeResource(db,name,value,revision) {
  const result=db.prepare('UPDATE resources SET value=?,revision=revision+1 WHERE name=? AND revision=?').run(JSON.stringify(value),name,revision)
  return result.changes ? readResource(db,name) : null
}
