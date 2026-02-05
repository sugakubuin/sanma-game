/**
 * 三人麻雀 - 山牌・王牌管理
 */

import type { TileInstance, Wall } from './types'
import { createAllTiles, shuffleTiles, sortTiles } from './tiles'
import { DEAD_WALL_COUNT, DEAD_WALL_MIN, INITIAL_HAND_PARENT, INITIAL_HAND_CHILD } from './constants'

// ===========================================
// 山牌生成
// ===========================================

/**
 * 新しい山牌を生成（シャッフル済み）
 */
export function createWall(): Wall {
    const allTiles = shuffleTiles(createAllTiles())

    // 王牌（末尾10枚）
    const deadWallTiles = allTiles.splice(-DEAD_WALL_COUNT)

    // ドラ表示牌（王牌末尾5幢目上段 = インデックス8）
    const doraIndicators: TileInstance[] = [deadWallTiles[8]]

    // 裏ドラ表示牌（ドラ表示牌の下段 = インデックス9）
    const uraDoraIndicators: TileInstance[] = [deadWallTiles[9]]

    // 嶺上牌（王牌最尾幢上段から順に取る = インデックス0, 2, 4, 6）
    // 実際には槓時に1枚ずつ取る
    const rinshanTiles: TileInstance[] = [
        deadWallTiles[0],
        deadWallTiles[2],
        deadWallTiles[4],
        deadWallTiles[6],
    ]

    return {
        tiles: allTiles,
        deadWall: deadWallTiles,
        doraIndicators,
        uraDoraIndicators,
        rinshanTiles,
        deadWallCount: DEAD_WALL_COUNT,
        kanDoraCount: 0,
    }
}

// ===========================================
// ツモ
// ===========================================

/**
 * 山牌から1枚ツモる
 * @returns ツモった牌、または山がない場合はnull
 */
export function drawTile(wall: Wall): TileInstance | null {
    if (wall.tiles.length === 0) {
        return null
    }
    return wall.tiles.shift()!
}

/**
 * 嶺上牌から1枚ツモる（槓後）
 */
export function drawRinshanTile(wall: Wall): TileInstance | null {
    if (wall.rinshanTiles.length === 0) {
        return null
    }
    return wall.rinshanTiles.shift()!
}

/**
 * 残りツモ数を取得
 */
export function getRemainingDraws(wall: Wall): number {
    return wall.tiles.length
}

/**
 * 海底牌かどうか
 */
export function isLastDraw(wall: Wall): boolean {
    return wall.tiles.length === 1
}

/**
 * 海底牌の1つ前かどうか
 */
export function isSecondToLastDraw(wall: Wall): boolean {
    return wall.tiles.length === 2
}

// ===========================================
// 槓ドラ
// ===========================================

/**
 * 槓ドラを追加（即めくり）
 * @param kanNumber 何回目の槓か (0-3)
 */
export function revealKanDora(wall: Wall, kanNumber: number): void {
    // 槓ドラは1つ目がインデックス6、2つ目が4、3つ目が2、4つ目が0
    const doraIndex = 8 - (kanNumber + 1) * 2
    if (doraIndex >= 0 && doraIndex < wall.deadWall.length) {
        wall.doraIndicators.push(wall.deadWall[doraIndex])
        // 裏ドラも追加
        const uraIndex = doraIndex + 1
        if (uraIndex < wall.deadWall.length) {
            wall.uraDoraIndicators.push(wall.deadWall[uraIndex])
        }
        // 槓ドラカウントを更新
        wall.kanDoraCount = kanNumber + 1
    }
}

// ===========================================
// 華牌抜き
// ===========================================

/**
 * 華牌を抜いた時の処理（王牌-1）
 */
export function extractFlower(wall: Wall): void {
    if (wall.deadWallCount > DEAD_WALL_MIN) {
        wall.deadWallCount--
    }
}

/**
 * 手牌から華牌を自動で抜き、嶺上牌から補充する
 * @returns 抜いた華牌の配列
 */
export function processFlowerExtraction(
    hand: TileInstance[],
    wall: Wall
): TileInstance[] {
    const extractedFlowers: TileInstance[] = []

    // 華牌がなくなるまで繰り返す
    let flowerIndex = hand.findIndex(t => t.id === 'flower')
    while (flowerIndex !== -1 && wall.rinshanTiles.length > 0) {
        // 華牌を抜く
        const flower = hand.splice(flowerIndex, 1)[0]
        extractedFlowers.push(flower)

        // 王牌枚数を減らす
        extractFlower(wall)

        // 嶺上牌から補充（華牌抜きでは嶺上開花なし）
        const replacement = wall.rinshanTiles.shift()
        if (replacement) {
            hand.push(replacement)
        }

        // 次の華牌を探す（補充した牌が華牌の可能性もある）
        flowerIndex = hand.findIndex(t => t.id === 'flower')
    }

    return extractedFlowers
}

/**
 * ツモ牌が華牌かどうかをチェックし、華牌なら処理する
 * @returns [補充後の牌, 抜いた華牌配列] または [null, []] (嶺上牌が尽きた場合)
 */
export function processDrawnFlower(
    drawnTile: TileInstance,
    wall: Wall
): { newTile: TileInstance | null; extractedFlowers: TileInstance[] } {
    const extractedFlowers: TileInstance[] = []
    let currentTile = drawnTile

    // ツモ牌が華牌である限り処理を続ける
    while (currentTile.id === 'flower') {
        extractedFlowers.push(currentTile)
        extractFlower(wall)

        // 嶺上牌から補充
        const replacement = wall.rinshanTiles.shift()
        if (!replacement) {
            return { newTile: null, extractedFlowers }
        }
        currentTile = replacement
    }

    return { newTile: currentTile, extractedFlowers }
}


// ===========================================
// 配牌
// ===========================================

interface DealResult {
    parentHand: TileInstance[]
    childHands: [TileInstance[], TileInstance[]]
    wall: Wall
}

/**
 * 配牌を行う
 * @returns 親の手牌(14枚)、子の手牌(各13枚)、残りの山牌
 */
export function dealInitialHands(wall: Wall): DealResult {
    const parentHand: TileInstance[] = []
    const child1Hand: TileInstance[] = []
    const child2Hand: TileInstance[] = []

    // 子に13枚ずつ配る
    for (let i = 0; i < INITIAL_HAND_CHILD; i++) {
        const tile1 = drawTile(wall)
        const tile2 = drawTile(wall)
        if (tile1) child1Hand.push(tile1)
        if (tile2) child2Hand.push(tile2)
    }

    // 親に14枚配る
    for (let i = 0; i < INITIAL_HAND_PARENT; i++) {
        const tile = drawTile(wall)
        if (tile) parentHand.push(tile)
    }

    return {
        parentHand: sortTiles(parentHand),
        childHands: [sortTiles(child1Hand), sortTiles(child2Hand)],
        wall,
    }
}

// ===========================================
// ドラ計算
// ===========================================

import { getDoraFromIndicator } from './tiles'
import type { TileId } from './types'

/**
 * 現在のドラ牌を取得
 */
export function getDoraTiles(wall: Wall): TileId[] {
    return wall.doraIndicators.map(t => getDoraFromIndicator(t.id))
}

/**
 * 裏ドラ牌を取得
 */
export function getUraDoraTiles(wall: Wall): TileId[] {
    return wall.uraDoraIndicators.map(t => getDoraFromIndicator(t.id))
}
