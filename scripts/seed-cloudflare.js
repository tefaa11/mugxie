import { writeFileSync } from 'node:fs'
import { defaultProducts, defaultCategories } from '../src/data/initialProducts.js'
import { defaultStoreConfig } from '../src/data/storeConfig.js'
const quote = value => "'" + JSON.stringify(value).replaceAll("'", "''") + "'"
const seed = { products:defaultProducts, categories:defaultCategories, testimonials:[], config:defaultStoreConfig }
writeFileSync('cloudflare/migrations/0002_seed.sql', '-- Datos iniciales; no sobrescribe el catálogo existente.\n'+Object.entries(seed).map(([name,value])=>`INSERT OR IGNORE INTO resources(name,value) VALUES ('${name}',${quote(value)});`).join('\n')+'\n')
