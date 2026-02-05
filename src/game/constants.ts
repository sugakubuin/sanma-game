/**
 * 三人麻雀 - 定数
 */

// ===========================================
// ゲーム設定
// ===========================================

/** プレイヤー人数 */
export const PLAYER_COUNT = 3

/** 配給原点 */
export const INITIAL_SCORE = 50000

/** 返し点 */
export const RETURN_SCORE = 50000

/** リーチ供託 */
export const RIICHI_COST = 1000

/** 配牌枚数（親） */
export const INITIAL_HAND_PARENT = 14

/** 配牌枚数（子） */
export const INITIAL_HAND_CHILD = 13

/** 王牌の初期枚数 */
export const DEAD_WALL_COUNT = 10

/** 王牌の最小枚数（華牌抜き後） */
export const DEAD_WALL_MIN = 4

/** 1局中の槓の最大回数 */
export const MAX_KAN_COUNT = 4

// ===========================================
// 点数表（三人麻雀用・30符固定）
// ===========================================

/** 親ロン点数表 */
export const PARENT_RON_SCORES: Record<number, number> = {
    1: 2000,
    2: 3000,
    3: 6000,
    4: 12000,   // 満貫
    5: 18000,   // 満貫
    6: 18000,   // 跳満
    7: 18000,   // 跳満
    8: 24000,   // 倍満
    9: 24000,   // 倍満
    10: 36000,  // 三倍満
    11: 36000,  // 三倍満
    12: 36000,  // 三倍満
    13: 48000,  // 役満
}

/** 親ツモオール点数表 */
export const PARENT_TSUMO_ALL_SCORES: Record<number, number> = {
    1: 1000,
    2: 2000,
    3: 3000,
    4: 6000,    // 満貫
    5: 9000,    // 満貫
    6: 9000,    // 跳満
    7: 9000,    // 跳満
    8: 12000,   // 倍満
    9: 12000,   // 倍満
    10: 18000,  // 三倍満
    11: 18000,  // 三倍満
    12: 18000,  // 三倍満
    13: 24000,  // 役満
}

/** 子ロン点数表 */
export const CHILD_RON_SCORES: Record<number, number> = {
    1: 1000,
    2: 2000,
    3: 4000,
    4: 8000,    // 満貫
    5: 12000,   // 満貫
    6: 12000,   // 跳満
    7: 12000,   // 跳満
    8: 16000,   // 倍満
    9: 16000,   // 倍満
    10: 24000,  // 三倍満
    11: 24000,  // 三倍満
    12: 24000,  // 三倍満
    13: 32000,  // 役満
}

/** 子ツモ点数表 [親払い, 子払い] */
export const CHILD_TSUMO_SCORES: Record<number, [number, number]> = {
    1: [1000, 1000],
    2: [1000, 1000],
    3: [3000, 1000],
    4: [5000, 3000],    // 満貫
    5: [8000, 4000],    // 満貫
    6: [8000, 4000],    // 跳満
    7: [8000, 4000],    // 跳満
    8: [10000, 6000],   // 倍満
    9: [10000, 6000],   // 倍満
    10: [16000, 8000],  // 三倍満
    11: [16000, 8000],  // 三倍満
    12: [16000, 8000],  // 三倍満
    13: [20000, 12000], // 役満
}

/** 積み棒加算（ロン） */
export const HONBA_RON_BONUS = 1000

/** 積み棒加算（ツモ、オール） */
export const HONBA_TSUMO_BONUS = 1000

// ===========================================
// ノーテン罰符
// ===========================================

/** 場に置く点数 */
export const NOTEN_BAPPU_POOL = 2000

/** テンパイ1人時のノーテン者からの支払い */
export const NOTEN_BAPPU_PAY = 1000

// ===========================================
// ウマ
// ===========================================

/** ウマ（場に） */
export const UMA_POOL = 40

/** 1着ウマ */
export const UMA_FIRST = 40

/** 2着ウマ（50000点以上） */
export const UMA_SECOND_ABOVE = 30

/** 2着ウマ（50000点未満） */
export const UMA_SECOND_BELOW = -10

/** 3着ウマ（50000点以上） */
export const UMA_THIRD_ABOVE = -10

/** 3着ウマ（50000点未満） */
export const UMA_THIRD_BELOW = -30

/** ラスウマ */
export const UMA_LAST = -40

// ===========================================
// 牌の枚数
// ===========================================

/** 総牌数 */
export const TOTAL_TILES = 112

/** 各牌の枚数（通常） */
export const TILES_PER_TYPE = 4

// ===========================================
// 風牌マッピング
// ===========================================

import type { Wind, TileId } from './types'

/** 風から字牌IDへのマッピング */
export const WIND_TO_TILE: Record<Wind, TileId> = {
    east: 'z1',
    south: 'z2',
    west: 'z3',
    north: 'z4',
}

/** 字牌IDから風へのマッピング */
export const TILE_TO_WIND: Partial<Record<TileId, Wind>> = {
    z1: 'east',
    z2: 'south',
    z3: 'west',
    z4: 'north',
}

// ===========================================
// 役判定用定数
// ===========================================

/** 幺九牌 */
export const TERMINAL_TILES: TileId[] = [
    'm1', 'm9', 'p1', 'p9', 's1', 's9',
    'z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7'
]

/** 老頭牌 */
export const ROUTOUHAI: TileId[] = ['m1', 'm9', 'p1', 'p9', 's1', 's9']

/** 字牌 */
export const HONOR_TILES: TileId[] = ['z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7']

/** 三元牌 */
export const DRAGON_TILES: TileId[] = ['z5', 'z6', 'z7']

/** 風牌 */
export const WIND_TILES: TileId[] = ['z1', 'z2', 'z3', 'z4']

/** 緑一色に使える牌 */
export const GREEN_TILES: TileId[] = ['s2', 's3', 's4', 's6', 's8', 'z6']

/** 中張牌（三人麻雀：萬子の中張牌なし） */
export const SIMPLE_TILES: TileId[] = [
    'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8',
    's2', 's3', 's4', 's5', 's6', 's7', 's8',
]
