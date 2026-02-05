/**
 * 三人麻雀 - 最終精算（pt計算）
 */

import { INITIAL_SCORE } from './constants'

// ===========================================
// 精算結果型
// ===========================================

/** 精算結果 */
export interface SettlementResult {
    /** 順位 (1, 2, 3) */
    ranks: [number, number, number]
    /** 最終点数 */
    finalScores: [number, number, number]
    /** 素点 (点数 - 配給原点) / 1000 */
    rawPoints: [number, number, number]
    /** ウマ */
    uma: [number, number, number]
    /** 祝儀pt */
    shuugiPoints: [number, number, number]
    /** 最終pt */
    finalPoints: [number, number, number]
}

// ===========================================
// pt計算
// ===========================================

/**
 * 最終精算を計算
 * 
 * pt = (最終点数 - 配給原点) / 1000 + ウマ + 祝儀枚数 × 5
 */
export function calculateSettlement(
    finalScores: [number, number, number],
    shuugiChips: [number, number, number],
    dealerIndex: number  // 起家（同点時の順位判定用）
): SettlementResult {
    // 順位決定（同点は起家に近い方が上位）
    const ranks = calculateRanks(finalScores, dealerIndex)

    // 素点計算
    const rawPoints: [number, number, number] = [
        (finalScores[0] - INITIAL_SCORE) / 1000,
        (finalScores[1] - INITIAL_SCORE) / 1000,
        (finalScores[2] - INITIAL_SCORE) / 1000,
    ]

    // ウマ計算
    const uma = calculateUma(finalScores, ranks)

    // 祝儀pt
    const shuugiPoints: [number, number, number] = [
        shuugiChips[0] * 5,
        shuugiChips[1] * 5,
        shuugiChips[2] * 5,
    ]

    // 最終pt
    const finalPoints: [number, number, number] = [
        rawPoints[0] + uma[0] + shuugiPoints[0],
        rawPoints[1] + uma[1] + shuugiPoints[1],
        rawPoints[2] + uma[2] + shuugiPoints[2],
    ]

    return {
        ranks,
        finalScores,
        rawPoints,
        uma,
        shuugiPoints,
        finalPoints,
    }
}

/**
 * 順位を計算（同点は起家に近い方が上位）
 */
function calculateRanks(
    scores: [number, number, number],
    dealerIndex: number
): [number, number, number] {
    // プレイヤーインデックスとスコアのペア
    const players = scores.map((score, idx) => ({
        index: idx,
        score,
        // 起家からの距離（起家=0, 起家の下家=1, ...）
        distanceFromDealer: (idx - dealerIndex + 3) % 3,
    }))

    // ソート: スコア降順、同点なら起家に近い順
    players.sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score
        return a.distanceFromDealer - b.distanceFromDealer
    })

    // 順位を割り当て
    const ranks: [number, number, number] = [0, 0, 0]
    players.forEach((player, rankIdx) => {
        ranks[player.index] = rankIdx + 1
    })

    return ranks
}

/**
 * ウマを計算
 * 
 * 2着が浮き（50,000点超過）の場合:
 *   1着: +30pt, 2着: +10pt, 3着: -40pt
 * 2着が沈み（50,000点未満）の場合:
 *   1着: +40pt, 2着: -10pt, 3着: -30pt
 */
function calculateUma(
    scores: [number, number, number],
    ranks: [number, number, number]
): [number, number, number] {
    // 2着のスコアを取得
    const secondPlaceIdx = ranks.indexOf(2)
    const secondPlaceScore = scores[secondPlaceIdx]

    // 2着が浮きか沈みか
    const isSecondFloating = secondPlaceScore > INITIAL_SCORE

    const uma: [number, number, number] = [0, 0, 0]

    for (let i = 0; i < 3; i++) {
        switch (ranks[i]) {
            case 1:
                uma[i] = isSecondFloating ? 30 : 40
                break
            case 2:
                uma[i] = isSecondFloating ? 10 : -10
                break
            case 3:
                uma[i] = isSecondFloating ? -40 : -30
                break
        }
    }

    return uma
}

/**
 * 結果をフォーマット（表示用）
 */
export function formatSettlementResult(result: SettlementResult): string[] {
    const lines: string[] = []

    for (let i = 0; i < 3; i++) {
        const rank = result.ranks[i]
        const raw = result.rawPoints[i] >= 0 ? `+${result.rawPoints[i]}` : `${result.rawPoints[i]}`
        const uma = result.uma[i] >= 0 ? `+${result.uma[i]}` : `${result.uma[i]}`
        const shuugi = result.shuugiPoints[i] >= 0 ? `+${result.shuugiPoints[i]}` : `${result.shuugiPoints[i]}`
        const total = result.finalPoints[i] >= 0 ? `+${result.finalPoints[i]}` : `${result.finalPoints[i]}`

        lines.push(`${rank}着: ${result.finalScores[i]}点 → ${raw} ${uma} ${shuugi} = ${total}pt`)
    }

    return lines
}
