/**
 * 三人麻雀 - 牌ユーティリティ
 */

import type { TileId, TileInstance, SuitType } from './types'

// ===========================================
// 全牌ID一覧
// ===========================================

/** 通常牌ID一覧（華牌除く） */
export const TILE_IDS: TileId[] = [
    'm1', 'm9',  // 萬子は1,9のみ（三人麻雀）
    'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9',
    's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9',
    'z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7',
]

// ===========================================
// 牌の表示情報
// ===========================================

interface TileDisplay {
    char: string
    label: string
    color: 'red' | 'green' | 'blue' | 'black'
}

const TILE_DISPLAYS: Record<TileId, TileDisplay> = {
    // 萬子 (赤) - 三人麻雀では1,9のみ
    m1: { char: '一', label: '一萬', color: 'red' },
    m9: { char: '九', label: '九萬', color: 'red' },
    // 筒子 (青)
    p1: { char: '①', label: '一筒', color: 'blue' },
    p2: { char: '②', label: '二筒', color: 'blue' },
    p3: { char: '③', label: '三筒', color: 'blue' },
    p4: { char: '④', label: '四筒', color: 'blue' },
    p5: { char: '⑤', label: '五筒', color: 'blue' },
    p6: { char: '⑥', label: '六筒', color: 'blue' },
    p7: { char: '⑦', label: '七筒', color: 'blue' },
    p8: { char: '⑧', label: '八筒', color: 'blue' },
    p9: { char: '⑨', label: '九筒', color: 'blue' },
    // 索子 (緑)
    s1: { char: '１', label: '一索', color: 'green' },
    s2: { char: '２', label: '二索', color: 'green' },
    s3: { char: '３', label: '三索', color: 'green' },
    s4: { char: '４', label: '四索', color: 'green' },
    s5: { char: '５', label: '五索', color: 'green' },
    s6: { char: '６', label: '六索', color: 'green' },
    s7: { char: '７', label: '七索', color: 'green' },
    s8: { char: '８', label: '八索', color: 'green' },
    s9: { char: '９', label: '九索', color: 'green' },
    // 字牌
    z1: { char: '東', label: '東', color: 'black' },
    z2: { char: '南', label: '南', color: 'black' },
    z3: { char: '西', label: '西', color: 'black' },
    z4: { char: '北', label: '北', color: 'black' },
    z5: { char: '白', label: '白', color: 'black' },
    z6: { char: '發', label: '發', color: 'green' },
    z7: { char: '中', label: '中', color: 'red' },
    // 華牌
    flower: { char: '花', label: '華', color: 'red' },
}

// ===========================================
// 基本関数
// ===========================================

/**
 * 牌IDから表示情報を取得
 */
export function getTileDisplay(id: TileId): TileDisplay {
    return TILE_DISPLAYS[id]
}

/**
 * 牌インスタンスから表示名を取得（花牌の区別対応）
 */
export function getTileName(tile: TileInstance): string {
    if (tile.id === 'flower' && tile.flowerType) {
        const names: Record<string, string> = {
            spring: '春華',
            summer: '夏華',
            autumn: '秋華',
            winter: '冬華'
        }
        return names[tile.flowerType] || '花牌'
    }
    return getTileDisplay(tile.id).label
}

/**
 * 牌IDからスート（種類）を取得
 */
export function getSuit(id: TileId): SuitType | 'flower' {
    if (id === 'flower') return 'flower'
    return id[0] as SuitType
}

/**
 * 牌IDから数字を取得（1-9, 字牌は1-7）
 */
export function getNumber(id: TileId): number {
    if (id === 'flower') return 0
    return parseInt(id[1])
}

/**
 * 数牌かどうか
 */
export function isNumberTile(id: TileId): boolean {
    const suit = getSuit(id)
    return suit === 'm' || suit === 'p' || suit === 's'
}

/**
 * 字牌かどうか
 */
export function isHonorTile(id: TileId): boolean {
    return getSuit(id) === 'z'
}

/**
 * 幺九牌かどうか
 */
export function isTerminalOrHonor(id: TileId): boolean {
    if (isHonorTile(id)) return true
    const num = getNumber(id)
    return num === 1 || num === 9
}

/**
 * 老頭牌かどうか
 */
export function isTerminal(id: TileId): boolean {
    if (!isNumberTile(id)) return false
    const num = getNumber(id)
    return num === 1 || num === 9
}

/**
 * 中張牌かどうか
 */
export function isSimple(id: TileId): boolean {
    if (!isNumberTile(id)) return false
    const num = getNumber(id)
    return num >= 2 && num <= 8
}

// ===========================================
// ドラ関連
// ===========================================

/**
 * ドラ表示牌から実際のドラ牌を取得（次順牌）
 */
export function getDoraFromIndicator(indicatorId: TileId): TileId {
    if (indicatorId === 'flower') return 'flower'

    const suit = getSuit(indicatorId)
    const num = getNumber(indicatorId)

    if (suit === 'z') {
        // 字牌の場合
        if (num <= 4) {
            // 風牌: 東→南→西→北→東
            return `z${(num % 4) + 1}` as TileId
        } else {
            // 三元牌: 白(5)→發(6)→中(7)→白(5)
            return `z${((num - 5 + 1) % 3) + 5}` as TileId
        }
    }

    // 数牌の場合: 1→2→...→9→1
    const nextNum = (num % 9) + 1
    return `${suit}${nextNum}` as TileId
}

/**
 * 赤牌かどうかを判定（5p, 5s は全て赤）
 */
export function isRedDora(id: TileId): boolean {
    return id === 'p5' || id === 's5'
}

// ===========================================
// ソート
// ===========================================

const SUIT_ORDER: Record<SuitType | 'flower', number> = { m: 0, p: 1, s: 2, z: 3, flower: 4 }

/**
 * 牌をソート
 */
const FLOWER_ORDER: Record<string, number> = { spring: 0, summer: 1, autumn: 2, winter: 3 }

/**
 * 牌をソート
 */
export function sortTiles(tiles: TileInstance[]): TileInstance[] {
    return [...tiles].sort((a, b) => {
        const suitA = getSuit(a.id)
        const suitB = getSuit(b.id)
        if (suitA !== suitB) {
            return SUIT_ORDER[suitA] - SUIT_ORDER[suitB]
        }

        // 花牌同士のソート
        if (suitA === 'flower') {
            const typeA = a.flowerType || 'spring'
            const typeB = b.flowerType || 'spring'
            return FLOWER_ORDER[typeA] - FLOWER_ORDER[typeB]
        }

        return getNumber(a.id) - getNumber(b.id)
    })
}

/**
 * 牌IDをソート
 */
export function sortTileIds(ids: TileId[]): TileId[] {
    return [...ids].sort((a, b) => {
        const suitA = getSuit(a)
        const suitB = getSuit(b)
        if (suitA !== suitB) {
            return SUIT_ORDER[suitA] - SUIT_ORDER[suitB]
        }
        return getNumber(a) - getNumber(b)
    })
}

// ===========================================
// 牌インスタンス生成
// ===========================================

/**
 * 全ての牌インスタンスを生成（112枚）
 */
export function createAllTiles(): TileInstance[] {
    const tiles: TileInstance[] = []
    let globalId = 0

    // 通常牌（各4枚）
    for (const tileId of TILE_IDS) {
        for (let i = 0; i < 4; i++) {
            const isRed = isRedDora(tileId)
            // 金牌: 5p, 5sの各1枚目、flowerの1枚目
            const isGold = (tileId === 'p5' || tileId === 's5') && i === 0
            // 白ポッチ: 白の1枚目
            const isWhitePochi = tileId === 'z5' && i === 0

            tiles.push({
                id: tileId,
                instanceId: globalId++,
                isRed,
                isGold,
                isWhitePochi,
            })
        }
    }

    // 華牌（4枚）
    for (let i = 0; i < 4; i++) {
        tiles.push({
            id: 'flower',
            instanceId: globalId++,
            isRed: false,
            isGold: i === 0, // 1枚目（春）が金牌
            isWhitePochi: false,
            flowerType: ['spring', 'summer', 'autumn', 'winter'][i] as any
        })
    }

    return tiles
}

/**
 * 牌をシャッフル
 */
export function shuffleTiles(tiles: TileInstance[]): TileInstance[] {
    const shuffled = [...tiles]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// ===========================================
// 牌の比較
// ===========================================

/**
 * 同じ牌ID同士か
 */
export function isSameTileId(a: TileId, b: TileId): boolean {
    return a === b
}

/**
 * 同じ牌インスタンスか
 */
export function isSameInstance(a: TileInstance, b: TileInstance): boolean {
    return a.instanceId === b.instanceId
}

/**
 * 手牌から指定の牌IDを持つインスタンスを取得
 */
export function findTileByIds(tiles: TileInstance[], ids: TileId[]): TileInstance[] {
    const result: TileInstance[] = []
    const remainingIds = [...ids]

    for (const tile of tiles) {
        const idx = remainingIds.indexOf(tile.id)
        if (idx !== -1) {
            result.push(tile)
            remainingIds.splice(idx, 1)
        }
    }

    return result
}

/**
 * 特定の牌IDのカウントを取得
 */
export function countTileId(tiles: TileInstance[], id: TileId): number {
    return tiles.filter(t => t.id === id).length
}

/**
 * 牌IDごとのカウントマップを作成
 */
export function createTileCountMap(tiles: TileInstance[]): Map<TileId, number> {
    const map = new Map<TileId, number>()
    for (const tile of tiles) {
        map.set(tile.id, (map.get(tile.id) || 0) + 1)
    }
    return map
}
/**
 * 牌の画像パスを取得
 */
export function getTileImageSrc(tile: TileInstance): string {
    const { id, isRed, isGold, isWhitePochi, flowerType } = tile

    // 特殊牌の処理
    if (id === 'flower') {
        // 花牌（季節）
        if (flowerType === 'spring') return '/tiles/flower_1_gold.png'
        if (flowerType === 'summer') return '/tiles/flower_2.png'
        if (flowerType === 'autumn') return '/tiles/flower_3.png'
        if (flowerType === 'winter') return '/tiles/flower_4.png'
        // Fallback (春をデフォルトに)
        return '/tiles/flower_1.png'
    }

    if (isGold) {
        if (id === 'p5') return '/tiles/5p_gold.png'
        if (id === 's5') return '/tiles/5s_gold.png'
    }

    if (isRed) {
        if (id === 'p5') return '/tiles/5p_red.png'
        if (id === 's5') return '/tiles/5s_red.png'
    }

    if (isWhitePochi && id === 'z5') {
        return '/tiles/z5_pochi.png'
    }

    // 通常牌
    return `/tiles/${id}.png`
}
