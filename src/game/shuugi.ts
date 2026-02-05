/**
 * 三人麻雀 - 祝儀計算
 */

import type { TileInstance, AgariContext } from './types'

// ===========================================
// 祝儀結果型
// ===========================================

/** 祝儀計算結果 */
export interface ShuugiResult {
    /** 祝儀枚数（ツモ: オール / ロン: 放銃者から） */
    chips: number
    /** 内訳 */
    breakdown: ShuugiBreakdown
}

/** 祝儀内訳 */
export interface ShuugiBreakdown {
    ippatsu: boolean           // 一発
    uraDora: boolean           // 裏ドラ（1枚以上）
    kanUra: boolean            // カン裏（1枚以上）
    goldTiles: number          // 金牌の枚数
    whitePochi: boolean        // 白ポッチ
    yakuman: number            // 役満祝儀
    kazoeyakuman: number       // 数え役満の追加枚数
    goldAllstar: boolean       // 金オールスター
    hanaShi: boolean           // 花四
}

// ===========================================
// 祝儀計算
// ===========================================

/**
 * 和了時の祝儀を計算
 */
export function calculateShuugi(
    context: AgariContext,
    winnerHand: TileInstance[],
    winTile: TileInstance,
    uraDoraCount: number,
    kanUraCount: number,
    isYakuman: boolean,
    yakumanCount: number,
    han: number,
): ShuugiResult {
    const breakdown: ShuugiBreakdown = {
        ippatsu: context.isIppatsu,
        uraDora: uraDoraCount > 0,
        kanUra: kanUraCount > 0,
        goldTiles: 0,
        whitePochi: false,
        yakuman: 0,
        kazoeyakuman: 0,
        goldAllstar: false,
        hanaShi: false,
    }

    let chips = 0
    const allTiles = [...winnerHand, winTile]

    // 一発
    if (breakdown.ippatsu) chips += 1

    // 裏ドラ（1枚以上で1枚）
    if (breakdown.uraDora) chips += 1

    // カン裏（1枚以上で1枚）
    if (breakdown.kanUra) chips += 1

    // 金牌（1枚につき1枚）
    const goldCount = allTiles.filter(t => t.isGold).length
    breakdown.goldTiles = goldCount
    chips += goldCount

    // 白ポッチ
    const hasWhitePochi = allTiles.some(t => t.isWhitePochi)
    breakdown.whitePochi = hasWhitePochi
    if (hasWhitePochi) chips += 1

    // 金オールスター（3つの金牌すべて）
    if (goldCount >= 3) {
        breakdown.goldAllstar = true
        // 金オールスター祝儀は通常の金牌祝儀と複合しない
        // ツモ: 5枚オール / ロン: 5枚 → 別途計算される
    }

    // 本役満
    if (isYakuman) {
        breakdown.yakuman = yakumanCount
        // ツモ: 5枚オール / ロン: 10枚 → 別途計算される
    }

    // 数え役満（13翻超過分）
    if (!isYakuman && han > 13) {
        breakdown.kazoeyakuman = han - 13
        chips += breakdown.kazoeyakuman
    }

    return { chips, breakdown }
}

/**
 * 役満祝儀を計算（ツモ/ロン別）
 */
export function getYakumanShuugi(
    yakumanCount: number,
    isTsumo: boolean
): number {
    if (yakumanCount === 0) return 0
    // ツモ: 5枚オール (計10枚) / ロン: 10枚
    return isTsumo ? 5 * yakumanCount : 10 * yakumanCount
}

/**
 * 金オールスター祝儀を計算
 */
export function getGoldAllstarShuugi(
    hasGoldAllstar: boolean,
    isTsumo: boolean
): number {
    if (!hasGoldAllstar) return 0
    // ツモ: 5枚オール (計10枚) / ロン: 5枚
    return isTsumo ? 5 : 5
}

// ===========================================
// トビ祝儀
// ===========================================

/**
 * トビ祝儀を計算
 */
export function getTobiShuugi(): number {
    return 2
}

// ===========================================
// 花四祝儀
// ===========================================

/**
 * 花四祝儀を計算（4枚の華牌を抜いての和了）
 */
export function getHanaShiShuugi(
    flowerCount: number,
    isTsumo: boolean
): number {
    if (flowerCount < 4) return 0
    // 花四は本役満祝儀と同じ: ツモ5枚オール / ロン10枚
    return isTsumo ? 5 : 10
}
