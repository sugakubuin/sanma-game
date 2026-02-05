/**
 * 麻雀牌の定義とユーティリティ
 * 三人麻雀用（萬子・筒子・索子・字牌）
 */

// 牌のID定義
export type SuitType = 'm' | 'p' | 's' | 'z' // 萬子, 筒子, 索子, 字牌
export type TileId =
    // 萬子 1-9
    | 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'm6' | 'm7' | 'm8' | 'm9'
    // 筒子 1-9
    | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8' | 'p9'
    // 索子 1-9
    | 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8' | 's9'
    // 字牌 (東南西北白發中)
    | 'z1' | 'z2' | 'z3' | 'z4' | 'z5' | 'z6' | 'z7'

// 全ての牌ID一覧
export const TILE_IDS: TileId[] = [
    'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9',
    'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9',
    's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9',
    'z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7',
]

// 牌の表示情報
interface TileDisplay {
    char: string
    label: string
    color: 'red' | 'green' | 'blue' | 'black'
}

const TILE_DISPLAYS: Record<TileId, TileDisplay> = {
    // 萬子 (赤)
    m1: { char: '一', label: '一萬', color: 'red' },
    m2: { char: '二', label: '二萬', color: 'red' },
    m3: { char: '三', label: '三萬', color: 'red' },
    m4: { char: '四', label: '四萬', color: 'red' },
    m5: { char: '五', label: '五萬', color: 'red' },
    m6: { char: '六', label: '六萬', color: 'red' },
    m7: { char: '七', label: '七萬', color: 'red' },
    m8: { char: '八', label: '八萬', color: 'red' },
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
    // 字牌 (黒)
    z1: { char: '東', label: '東', color: 'black' },
    z2: { char: '南', label: '南', color: 'black' },
    z3: { char: '西', label: '西', color: 'black' },
    z4: { char: '北', label: '北', color: 'black' },
    z5: { char: '白', label: '白', color: 'black' },
    z6: { char: '發', label: '發', color: 'green' },
    z7: { char: '中', label: '中', color: 'red' },
}

/**
 * 牌IDから表示情報を取得
 */
export function getTileDisplay(id: TileId): TileDisplay {
    return TILE_DISPLAYS[id]
}

/**
 * 牌IDからスート（種類）を取得
 */
export function getSuit(id: TileId): SuitType {
    return id[0] as SuitType
}

/**
 * 牌IDから数字を取得（1-9）
 */
export function getNumber(id: TileId): number {
    return parseInt(id[1])
}

/**
 * ランダムな手牌を生成（デモ用）
 */
export function generateRandomHand(count: number): TileId[] {
    const hand: TileId[] = []
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * TILE_IDS.length)
        hand.push(TILE_IDS[randomIndex])
    }
    return hand.sort()
}

/**
 * 牌をソート
 */
export function sortTiles(tiles: TileId[]): TileId[] {
    const suitOrder: Record<SuitType, number> = { m: 0, p: 1, s: 2, z: 3 }
    return [...tiles].sort((a, b) => {
        const suitA = getSuit(a)
        const suitB = getSuit(b)
        if (suitA !== suitB) {
            return suitOrder[suitA] - suitOrder[suitB]
        }
        return getNumber(a) - getNumber(b)
    })
}
