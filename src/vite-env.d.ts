/// <reference types="vite/client" />

declare module '*.css' {
    const content: { [className: string]: string }
    export default content
}

declare module '*.svg' {
    import * as React from 'react'
    export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
    const src: string
    export default src
}

// Screen Orientation API 型定義
interface ScreenOrientation {
    lock(orientation: 'landscape' | 'portrait' | 'landscape-primary' | 'landscape-secondary' | 'portrait-primary' | 'portrait-secondary'): Promise<void>;
    unlock(): void;
    type: string;
    angle: number;
}
