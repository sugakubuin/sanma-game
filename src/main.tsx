import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// モバイルで横画面をロック（Screen Orientation API）
// フルスクリーンモード時にのみ動作
if ('orientation' in screen && 'lock' in (screen.orientation as ScreenOrientation)) {
    // ユーザーインタラクション後にフルスクリーン＋横画面ロックを試行
    document.addEventListener('click', async () => {
        try {
            if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
                await (screen.orientation as ScreenOrientation).lock('landscape');
            }
        } catch (e) {
            // ブラウザがサポートしていない場合は無視
            console.log('Orientation lock not supported:', e);
        }
    }, { once: true });
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
