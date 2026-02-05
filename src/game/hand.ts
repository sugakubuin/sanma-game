/**
 * 三人麻雀 - 手牌操作・和了判定
 */

import type { TileInstance, TileId, Meld, Mentsu, AgariPattern, MentsuType } from './types'
import { getSuit, getNumber, isHonorTile, sortTiles } from './tiles'

// ===========================================
// 手牌操作
// ===========================================

/**
 * 手牌から牌を取り除く
 */
export function removeTileFromHand(hand: TileInstance[], tile: TileInstance): TileInstance[] {
    const idx = hand.findIndex(t => t.instanceId === tile.instanceId)
    if (idx !== -1) {
        return [...hand.slice(0, idx), ...hand.slice(idx + 1)]
    }
    return hand
}

/**
 * 手牌に牌を追加
 */
export function addTileToHand(hand: TileInstance[], tile: TileInstance): TileInstance[] {
    return sortTiles([...hand, tile])
}

/**
 * 手牌から指定のIDを持つ牌を1枚取り除く
 */
export function removeTileById(hand: TileInstance[], id: TileId): { hand: TileInstance[], removed: TileInstance | null } {
    const idx = hand.findIndex(t => t.id === id)
    if (idx !== -1) {
        const removed = hand[idx]
        return {
            hand: [...hand.slice(0, idx), ...hand.slice(idx + 1)],
            removed,
        }
    }
    return { hand, removed: null }
}

// ===========================================
// 和了判定
// ===========================================

/**
 * 和了形かどうかを判定
 */
export function isAgari(handIds: TileId[]): boolean {
    if (handIds.length !== 14) return false

    // 通常形（4面子1雀頭）
    if (canDecomposeToMentsu(handIds)) return true

    // 七対子
    if (isChitoitsu(handIds)) return true

    // 国士無双
    if (isKokushi(handIds)) return true

    return false
}

/**
 * 4面子1雀頭に分解可能か
 */
function canDecomposeToMentsu(handIds: TileId[]): boolean {
    const countMap = createCountMapFromIds(handIds)

    // 雀頭候補を試す
    for (const [id, count] of countMap.entries()) {
        if (count >= 2) {
            const remaining = new Map(countMap)
            remaining.set(id, count - 2)
            if (canFormMentsu(remaining, 4)) {
                return true
            }
        }
    }

    return false
}

/**
 * 指定数の面子を作れるか
 */
function canFormMentsu(countMap: Map<TileId, number>, mentsuCount: number): boolean {
    if (mentsuCount === 0) {
        // 残りが全て0かチェック
        for (const count of countMap.values()) {
            if (count > 0) return false
        }
        return true
    }

    // 最初の牌を見つける
    let firstTile: TileId | null = null
    for (const [id, count] of countMap.entries()) {
        if (count > 0) {
            firstTile = id
            break
        }
    }

    if (!firstTile) return mentsuCount === 0

    const count = countMap.get(firstTile)!

    // 刻子で取る
    if (count >= 3) {
        const remaining = new Map(countMap)
        remaining.set(firstTile, count - 3)
        if (canFormMentsu(remaining, mentsuCount - 1)) return true
    }

    // 順子で取る（数牌のみ）
    if (!isHonorTile(firstTile)) {
        const suit = getSuit(firstTile)
        const num = getNumber(firstTile)
        if (num <= 7) {
            const next1 = `${suit}${num + 1}` as TileId
            const next2 = `${suit}${num + 2}` as TileId
            if ((countMap.get(next1) || 0) >= 1 && (countMap.get(next2) || 0) >= 1) {
                const remaining = new Map(countMap)
                remaining.set(firstTile, count - 1)
                remaining.set(next1, (remaining.get(next1) || 0) - 1)
                remaining.set(next2, (remaining.get(next2) || 0) - 1)
                if (canFormMentsu(remaining, mentsuCount - 1)) return true
            }
        }
    }

    return false
}

/**
 * 七対子かどうか
 */
function isChitoitsu(handIds: TileId[]): boolean {
    if (handIds.length !== 14) return false

    const countMap = createCountMapFromIds(handIds)

    // 7種類の対子
    let pairCount = 0
    for (const count of countMap.values()) {
        if (count === 2 || count === 4) {
            pairCount += count / 2
        } else if (count !== 0) {
            return false
        }
    }

    return pairCount === 7
}

/**
 * 国士無双かどうか
 */
function isKokushi(handIds: TileId[]): boolean {
    if (handIds.length !== 14) return false

    const terminals: TileId[] = [
        'm1', 'm9', 'p1', 'p9', 's1', 's9',
        'z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7'
    ]

    const countMap = createCountMapFromIds(handIds)

    // 各幺九牌が1枚以上あるか
    let hasPair = false
    for (const terminal of terminals) {
        const count = countMap.get(terminal) || 0
        if (count === 0) return false
        if (count === 2) hasPair = true
    }

    // 1つだけ対子
    return hasPair
}

// ===========================================
// 聴牌判定
// ===========================================

/**
 * 聴牌かどうかを判定
 */
export function isTenpai(handIds: TileId[]): boolean {
    if (handIds.length !== 13) return false
    return getWaitingTiles(handIds).length > 0
}

/**
 * 待ち牌を取得
 */
export function getWaitingTiles(handIds: TileId[]): TileId[] {
    if (handIds.length !== 13) return []

    const waiting: TileId[] = []
    // 三人麻雀：萬子は1,9のみ
    const allIds: TileId[] = [
        'm1', 'm9',
        'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9',
        's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9',
        'z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7',
    ]

    for (const id of allIds) {
        const testHand = [...handIds, id]
        if (isAgari(testHand)) {
            waiting.push(id)
        }
    }

    return waiting
}

// ===========================================
// 和了形解析
// ===========================================

/**
 * 全ての和了形を取得（高点法用）
 */
export function getAgariPatterns(
    hand: TileInstance[],
    melds: Meld[],
    winTile: TileInstance,
    isTsumo: boolean
): AgariPattern[] {
    const allTiles = [...hand, winTile]
    const handIds = allTiles.map(t => t.id)

    const patterns: AgariPattern[] = []

    // 通常形
    const normalPatterns = decomposeToMentsu(allTiles)
    for (const { head, mentsu } of normalPatterns) {
        // 副露を追加
        const allMentsu: Mentsu[] = [
            ...mentsu,
            ...melds.map(meld => ({
                type: meldTypeToMentsuType(meld.type),
                tiles: meld.tiles,
                isOpen: meld.type !== 'ankan',
            })),
        ]

        patterns.push({
            head,
            mentsu: allMentsu,
            winTile,
            isTsumo,
        })
    }

    // 七対子
    if (melds.length === 0 && isChitoitsu(handIds)) {
        patterns.push({
            head: [],
            mentsu: [],
            winTile,
            isTsumo,
        })
    }

    // 国士無双
    if (melds.length === 0 && isKokushi(handIds)) {
        patterns.push({
            head: [],
            mentsu: [],
            winTile,
            isTsumo,
        })
    }

    return patterns
}

/**
 * 面子分解を行う
 */
export function decomposeToMentsu(tiles: TileInstance[]): { head: TileInstance[], mentsu: Mentsu[] }[] {
    const results: { head: TileInstance[], mentsu: Mentsu[] }[] = []

    // 雀頭候補を試す
    const tilesByIdMap = new Map<TileId, TileInstance[]>()
    for (const tile of tiles) {
        if (!tilesByIdMap.has(tile.id)) {
            tilesByIdMap.set(tile.id, [])
        }
        tilesByIdMap.get(tile.id)!.push(tile)
    }

    for (const [, tileList] of tilesByIdMap.entries()) {
        if (tileList.length >= 2) {
            const head = tileList.slice(0, 2)
            const remaining = tiles.filter(t => !head.includes(t))
            const mentsuResults = findMentsuCombinations(remaining)

            for (const mentsu of mentsuResults) {
                if (mentsu.length === 4) {
                    results.push({ head, mentsu })
                }
            }
        }
    }

    return results
}

/**
 * 面子の組み合わせを見つける
 */
function findMentsuCombinations(tiles: TileInstance[]): Mentsu[][] {
    if (tiles.length === 0) return [[]]
    if (tiles.length % 3 !== 0) return []

    const results: Mentsu[][] = []

    // ソートして最初の牌を取る
    const sorted = sortTiles(tiles)
    const firstTile = sorted[0]

    // 刻子で取る（同じIDの牌が3枚以上あれば）
    const sameIdCount = sorted.filter(t => t.id === firstTile.id).length
    if (sameIdCount >= 3) {
        const koTiles = sorted.filter(t => t.id === firstTile.id).slice(0, 3)
        const remaining = sorted.filter(t => !koTiles.includes(t))
        const subResults = findMentsuCombinations(remaining)

        for (const sub of subResults) {
            results.push([
                { type: 'koutsu', tiles: koTiles, isOpen: false },
                ...sub,
            ])
        }
    }

    // 順子で取る
    if (!isHonorTile(firstTile.id)) {
        const suit = getSuit(firstTile.id)
        const num = getNumber(firstTile.id)
        if (num <= 7) {
            const next1 = `${suit}${num + 1}` as TileId
            const next2 = `${suit}${num + 2}` as TileId

            const t1 = sorted.find(t => t.id === firstTile.id)
            const t2 = sorted.find(t => t.id === next1)
            const t3 = sorted.find(t => t.id === next2)

            if (t1 && t2 && t3) {
                const shunTiles = [t1, t2, t3]
                const remaining = sorted.filter(t => !shunTiles.includes(t))
                const subResults = findMentsuCombinations(remaining)

                for (const sub of subResults) {
                    results.push([
                        { type: 'shuntsu', tiles: shunTiles, isOpen: false },
                        ...sub,
                    ])
                }
            }
        }
    }

    return results
}

/**
 * 副露タイプから面子タイプへ変換
 */
function meldTypeToMentsuType(type: Meld['type']): MentsuType {
    switch (type) {
        case 'pon': return 'koutsu'
        case 'minkan':
        case 'ankan':
        case 'kakan': return 'kantsu'
        default: return 'koutsu'
    }
}

// ===========================================
// ユーティリティ
// ===========================================

function createCountMapFromIds(ids: TileId[]): Map<TileId, number> {
    const map = new Map<TileId, number>()
    for (const id of ids) {
        map.set(id, (map.get(id) || 0) + 1)
    }
    return map
}

// ===========================================
// フリテン判定
// ===========================================

/**
 * フリテン状態かどうか（自分の捨て牌に待ち牌がある）
 */
export function isFuriten(handIds: TileId[], discards: TileId[]): boolean {
    const waiting = getWaitingTiles(handIds)
    return waiting.some(w => discards.includes(w))
}

// ===========================================
// 白ポッチ判定
// ===========================================

/**
 * ツモ牌が白ポッチかどうかを判定
 */
export function isWhitePochi(tile: TileInstance): boolean {
    return tile.isWhitePochi
}

/**
 * リーチ後に白ポッチをツモした場合、自動和了となる
 * 白ポッチは任意の牌として扱えるため、常に和了可能
 * @returns 和了可能な牌のIDリスト（高め取り可能）
 */
export function getWhitePochiAgariOptions(
    handIds: TileId[]
): TileId[] {
    const agariOptions: TileId[] = []

    // 三人麻雀の全牌ID
    const allIds: TileId[] = [
        'm1', 'm9',
        'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9',
        's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9',
        'z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7',
    ]

    // 白ポッチ（z5=白）を除いた手牌で各牌を試す
    const handWithoutPochi = handIds.filter(id => id !== 'z5')

    for (const id of allIds) {
        const testHand = [...handWithoutPochi, id]
        if (isAgari(testHand)) {
            agariOptions.push(id)
        }
    }

    return agariOptions
}

/**
 * 白ポッチで和了する場合、5を含むなら赤ドラとして扱える
 */
export function canTreatAsRedDora(agariTileId: TileId): boolean {
    return agariTileId === 'p5' || agariTileId === 's5'
}
