// Type declaration to fix React Router DOM compatibility with React 18
declare module 'react-router-dom' {
  import * as React from 'react';
  export const Routes: React.ComponentType<any>;
  export const Route: React.ComponentType<any>;
  export const Link: React.ComponentType<any>;
  export const BrowserRouter: React.ComponentType<any>;
  export const useParams: () => Record<string, string>;
  export const useNavigate: () => (path: string) => void;
}




