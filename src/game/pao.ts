/**
 * 三人麻雀 - 包（パオ）判定
 */

import type { Meld } from './types'

// ===========================================
// パオ対象役
// ===========================================

// 大三元: 三元牌すべてが刻子
// 大四喜: 四喜牌すべてが刻子
// 四槓子: 4面子が槓子
// 四連刻: 連続した同種の数牌4面子が刻子

// ===========================================
// パオ判定
// ===========================================

/**
 * プレイヤーのパオ状態を確認
 * @returns 包者のインデックス、または null
 */
export function getPaoPlayer(melds: Meld[]): number | null {
    // 大三元パオ判定
    const dragonMelds = melds.filter(m =>
        (m.type === 'pon' || m.type === 'minkan') &&
        ['z5', 'z6', 'z7'].includes(m.tiles[0].id)
    )
    if (dragonMelds.length >= 3) {
        // 3つ目の三元牌を鳴かせた人が包者
        return dragonMelds[2].fromPlayer ?? null
    }

    // 大四喜パオ判定
    const windMelds = melds.filter(m =>
        (m.type === 'pon' || m.type === 'minkan') &&
        ['z1', 'z2', 'z3', 'z4'].includes(m.tiles[0].id)
    )
    if (windMelds.length >= 4) {
        // 4つ目の風牌を鳴かせた人が包者
        return windMelds[3].fromPlayer ?? null
    }

    // 四槓子パオ判定
    const kanMelds = melds.filter(m =>
        m.type === 'minkan' || m.type === 'kakan'
    )
    if (kanMelds.length >= 4) {
        // 4つ目の槓を鳴かせた人が包者
        const lastKan = kanMelds[3]
        return lastKan.fromPlayer ?? null
    }

    // 四連刻パオ判定
    // 四連刻は4面子すべてが刻子で連続した数牌なので、
    // 明刻4つで連続していればパオ判定
    const openKoutsu = melds.filter(m => m.type === 'pon' || m.type === 'minkan')
        .filter(m => {
            const suit = m.tiles[0].id.charAt(0)
            return suit === 'p' || suit === 's' || suit === 'm'
        })

    if (openKoutsu.length >= 4) {
        // 同種で連番か確認
        const bySuit = new Map<string, Meld[]>()
        for (const m of openKoutsu) {
            const suit = m.tiles[0].id.charAt(0)
            if (!bySuit.has(suit)) bySuit.set(suit, [])
            bySuit.get(suit)!.push(m)
        }

        for (const [, melds] of bySuit) {
            if (melds.length >= 4) {
                const numbers = melds.map(m => parseInt(m.tiles[0].id.charAt(1)))
                    .sort((a, b) => a - b)
                // 連続しているか確認
                let isConsecutive = true
                for (let i = 0; i < 3; i++) {
                    if (numbers[i + 1] - numbers[i] !== 1) {
                        isConsecutive = false
                        break
                    }
                }
                if (isConsecutive) {
                    // 4つ目を鳴かせた人が包者
                    return melds[3].fromPlayer ?? null
                }
            }
        }
    }

    return null
}

/**
 * パオによる点数調整を計算
 * @param baseScore 和了の基本点
 * @param paoPlayer 包者
 * @param houjuuPlayer 放銃者（ツモの場合はnull）
 * @param winnerIsParent 和了者が親か
 */
export function calculatePaoPayment(
    baseScore: number,
    paoPlayer: number,
    houjuuPlayer: number | null
): Map<number, number> {
    const payments = new Map<number, number>()

    if (houjuuPlayer === null) {
        // ツモ和了: 包者が全額責任払い
        payments.set(paoPlayer, -baseScore)
    } else {
        // ロン和了: 放銃者と包者で折半
        const halfScore = Math.ceil(baseScore / 2)
        payments.set(houjuuPlayer, -halfScore)
        payments.set(paoPlayer, -(baseScore - halfScore))
    }

    return payments
}
