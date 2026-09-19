/** App-wide constants. Domain enums live in ../types; storage keys and limits live here. */
export { PRIORITIES, PRIORITY_LABEL, SORT_LABEL } from '../types'
export { STORAGE_KEY } from '../services/storage'

export const THEME_KEY = 'focuslist.theme'
export const VIEW_KEY = 'focuslist.view'
export const MAX_TITLE_LENGTH = 200
export const MAX_NOTES_LENGTH = 1000
export const TOAST_DURATION_MS = 6000
export const FOCUS_PRESETS_MIN = [15, 25, 45] as const
