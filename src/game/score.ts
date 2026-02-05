/**
 * 三人麻雀 - 点数計算
 */

import type { Yaku, ScoreResult, AgariContext } from './types'
import { detectYaku, countDora } from './yaku'
import {
    PARENT_RON_SCORES,
    PARENT_TSUMO_ALL_SCORES,
    CHILD_RON_SCORES,
    CHILD_TSUMO_SCORES,
    HONBA_RON_BONUS,
    HONBA_TSUMO_BONUS,
} from './constants'

// ===========================================
// 点数計算
// ===========================================

/**
 * 和了時の点数を計算
 */
export function calculateScore(context: AgariContext): ScoreResult {
    const yaku = detectYaku(context)

    if (yaku.length === 0) {
        // 役なし
        return {
            total: 0,
            han: 0,
            yaku: [],
            isYakuman: false,
        }
    }

    // 役満判定
    const yakumanYaku = yaku.filter(y => y.isYakuman)
    if (yakumanYaku.length > 0) {
        return calculateYakumanScore(yakumanYaku, context)
    }

    // 通常役の翻数計算
    let han = yaku.reduce((sum, y) => sum + y.han, 0)

    // ドラ加算
    const doraCount = countDora(
        context.pattern,
        context.doraTiles,
        context.uraDoraTiles,
        context.isRiichi || context.isDoubleRiichi || context.isOpenRiichi
    )

    // カラス判定: リーチのみ1翻でドラ0枚 = 役満
    const isRiichiOnly = yaku.length === 1 && yaku[0].name === 'riichi'
    if (isRiichiOnly && doraCount === 0) {
        const karasuYaku: Yaku = {
            name: 'karasu',
            nameJp: 'カラス',
            han: 13,
            isYakuman: true,
            yakumanCount: 1,
        }
        return calculateYakumanScore([karasuYaku], context)
    }

    han += doraCount

    // 点数計算
    const isParent = context.seatWind === 'east'
    const isTsumo = context.pattern.isTsumo
    const cappedHan = Math.min(han, 13) // 13翻以上は役満扱い

    return calculateNormalScore(cappedHan, isParent, isTsumo, context.honba, yaku)
}

/**
 * 通常役の点数計算
 */
function calculateNormalScore(
    han: number,
    isParent: boolean,
    isTsumo: boolean,
    honba: number,
    yaku: Yaku[]
): ScoreResult {
    let total = 0
    let parentRon: number | undefined
    let parentTsumoAll: number | undefined
    let childRon: number | undefined
    let childTsumoParent: number | undefined
    let childTsumoChild: number | undefined

    if (isParent) {
        if (isTsumo) {
            const base = PARENT_TSUMO_ALL_SCORES[han] || PARENT_TSUMO_ALL_SCORES[13]
            const withHonba = base + HONBA_TSUMO_BONUS * honba
            total = withHonba * 2 // 子2人から
            parentTsumoAll = withHonba
        } else {
            const base = PARENT_RON_SCORES[han] || PARENT_RON_SCORES[13]
            total = base + HONBA_RON_BONUS * honba
            parentRon = total
        }
    } else {
        if (isTsumo) {
            const [parentPay, childPay] = CHILD_TSUMO_SCORES[han] || CHILD_TSUMO_SCORES[13]
            const parentWithHonba = parentPay + HONBA_TSUMO_BONUS * honba
            const childWithHonba = childPay + HONBA_TSUMO_BONUS * honba
            total = parentWithHonba + childWithHonba
            childTsumoParent = parentWithHonba
            childTsumoChild = childWithHonba
        } else {
            const base = CHILD_RON_SCORES[han] || CHILD_RON_SCORES[13]
            total = base + HONBA_RON_BONUS * honba
            childRon = total
        }
    }

    return {
        total,
        parentRon,
        parentTsumoAll,
        childRon,
        childTsumoParent,
        childTsumoChild,
        han,
        yaku,
        isYakuman: false,
    }
}

/**
 * 役満の点数計算
 */
function calculateYakumanScore(yakumanYaku: Yaku[], context: AgariContext): ScoreResult {
    // 役満の倍率を計算（ダブル役満など）
    const yakumanCount = yakumanYaku.reduce((sum, y) => sum + y.yakumanCount, 0)

    const isParent = context.seatWind === 'east'
    const isTsumo = context.pattern.isTsumo
    const honba = context.honba

    // 基本役満点数
    const parentRonBase = 48000 * yakumanCount
    const parentTsumoAllBase = 24000 * yakumanCount
    const childRonBase = 32000 * yakumanCount
    const childTsumoParentBase = 20000 * yakumanCount
    const childTsumoChildBase = 12000 * yakumanCount

    let total = 0
    let parentRon: number | undefined
    let parentTsumoAll: number | undefined
    let childRon: number | undefined
    let childTsumoParent: number | undefined
    let childTsumoChild: number | undefined

    if (isParent) {
        if (isTsumo) {
            const withHonba = parentTsumoAllBase + HONBA_TSUMO_BONUS * honba
            total = withHonba * 2
            parentTsumoAll = withHonba
        } else {
            total = parentRonBase + HONBA_RON_BONUS * honba
            parentRon = total
        }
    } else {
        if (isTsumo) {
            const parentWithHonba = childTsumoParentBase + HONBA_TSUMO_BONUS * honba
            const childWithHonba = childTsumoChildBase + HONBA_TSUMO_BONUS * honba
            total = parentWithHonba + childWithHonba
            childTsumoParent = parentWithHonba
            childTsumoChild = childWithHonba
        } else {
            total = childRonBase + HONBA_RON_BONUS * honba
            childRon = total
        }
    }

    return {
        total,
        parentRon,
        parentTsumoAll,
        childRon,
        childTsumoParent,
        childTsumoChild,
        han: 13 * yakumanCount,
        yaku: yakumanYaku,
        isYakuman: true,
    }
}

// ===========================================
// ノーテン罰符
// ===========================================

/**
 * ノーテン罰符の計算
 * @param tenpaiPlayers テンパイしているプレイヤーのインデックス
 * @returns [プレイヤー0の得点変動, プレイヤー1の得点変動, プレイヤー2の得点変動]
 */
export function calculateNotenBappu(tenpaiPlayers: number[]): [number, number, number] {
    const changes: [number, number, number] = [0, 0, 0]
    const tenpaiCount = tenpaiPlayers.length

    if (tenpaiCount === 0 || tenpaiCount === 3) {
        // 全員テンパイまたは全員ノーテン: 点棒移動なし
        return changes
    }

    if (tenpaiCount === 1) {
        // テンパイ1人: ノーテン者2人から各1000点
        const tenpaiIdx = tenpaiPlayers[0]
        for (let i = 0; i < 3; i++) {
            if (i === tenpaiIdx) {
                changes[i] = 2000
            } else {
                changes[i] = -1000
            }
        }
    } else {
        // テンパイ2人: ノーテン者から各1000点ずつ
        for (let i = 0; i < 3; i++) {
            if (tenpaiPlayers.includes(i)) {
                changes[i] = 1000
            } else {
                changes[i] = -2000
            }
        }
    }

    return changes
}

// ===========================================
// 翻数から名称を取得
// ===========================================

/**
 * 翻数から役の名称を取得
 */
export function getScoreName(han: number, isYakuman: boolean): string {
    if (isYakuman) return '役満'
    if (han >= 13) return '役満'
    if (han >= 10) return '三倍満'
    if (han >= 8) return '倍満'
    if (han >= 6) return '跳満'
    if (han >= 4) return '満貫'
    return `${han}翻`
}
