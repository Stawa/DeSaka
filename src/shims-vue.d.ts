/**
 * Vue component type declaration
 * Provides TypeScript support for .vue files
 */
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<
    Record<string, unknown>, // Props
    Record<string, unknown>, // Public properties
    Record<string, unknown> // Emits
  >
  export default component
}
