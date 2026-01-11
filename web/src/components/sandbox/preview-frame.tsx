'use client';

import { useEffect, useRef, useState } from 'react';

interface PreviewFrameProps {
  code: string;
  width?: number;
  height?: number;
}

export function PreviewFrame({ code, width, height }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Transform raw code to executable script (very simplified for demo)
  // In production, this would use a proper bundler like esbuild-wasm
  const generatePreview = (rawCode: string) => {
    // This is a naive implementation simulating component rendering
    // It assumes the code exports a default component function
    
    // We strip imports for this demo since we can't bundle in browser easily without heavy deps
    const cleanCode = rawCode.replace(/import .*/g, '');
    const componentNameMatch = rawCode.match(/export default function ([a-zA-Z0-9]+)/);
    const componentName = componentNameMatch ? componentNameMatch[1] : 'App';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            const { useState, useEffect } = React;
            
            // Injected Code
            ${cleanCode}

            // Render
            const root = ReactDOM.createRoot(document.getElementById('root'));
            try {
              // Handle default export vs named export simulation
              const App = ${componentName};
              if (App) {
                root.render(<App />);
              } else {
                document.getElementById('root').innerHTML = '<div style="color:red;padding:20px">Error: No component found</div>';
              }
            } catch (err) {
              document.getElementById('root').innerHTML = '<div style="color:red;padding:20px">Runtime Error: ' + err.message + '</div>';
            }
          </script>
        </body>
      </html>
    `;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-border overflow-hidden transition-all duration-300"
      style={{ width: width || '100%', height: height || '100%' }}
    >
      <iframe
        ref={iframeRef}
        srcDoc={generatePreview(code)}
        className="w-full h-full border-0"
        title="Preview"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
