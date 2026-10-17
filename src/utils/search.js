// Convierte el texto a una forma comparable para búsquedas amables en español.
// Así «Pokémon», «pokemon» y «POKEMON» se encuentran de la misma manera.
export function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-CO')
}

export function matchesSearch(value, query) {
  return normalizeSearchText(value).includes(normalizeSearchText(query))
}
