// Allow importing CSS files (used by NativeWind's global.css import in _layout.tsx)
declare module '*.css' {
  const content: string;
  export default content;
}
