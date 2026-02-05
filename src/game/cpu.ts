/**
 * 三人麻雀 - CPU AI（ランダム打牌）
 */

import type { GameState, GameAction, TileInstance } from './types'
import { getAvailableActions, getReactionActions } from './gameActions'

// ===========================================
// CPU AI
// ===========================================

/**
 * CPUのアクションを選択（ランダム）
 */
export function cpuSelectAction(
    state: GameState,
    playerIndex: number
): GameAction | null {
    let actions: GameAction[]

    if (state.currentPlayer === playerIndex) {
        actions = getAvailableActions(state)
    } else {
        actions = getReactionActions(state, playerIndex)
    }

    if (actions.length === 0) return null

    // 優先順位に基づいて選択
    // 1. ツモ和了・ロン和了があれば必ず実行
    const tsumo = actions.find(a => a.type === 'TSUMO')
    if (tsumo) return tsumo

    const ron = actions.find(a => a.type === 'RON')
    if (ron) return ron

    // 2. ポン（副露UI確認のため常にポン）
    const pon = actions.find(a => a.type === 'PON')
    if (pon) return pon

    // 3. ツモ
    const draw = actions.find(a => a.type === 'DRAW')
    if (draw) return draw

    // 4. スキップ
    const skip = actions.find(a => a.type === 'SKIP')
    if (skip) return skip

    // 5. 打牌はランダム選択
    const discards = actions.filter(a => a.type === 'DISCARD')
    if (discards.length > 0) {
        return selectRandomDiscard(discards, state, playerIndex)
    }

    // 6. その他のアクション
    return actions[0]
}

/**
 * ランダムに打牌を選択
 * ただし、完全ランダムではなく最低限の判断を行う
 */
function selectRandomDiscard(
    discards: GameAction[],
    _state: GameState,
    _playerIndex: number
): GameAction {
    // 字牌優先、端牌優先などの簡易ロジック
    const tiles = discards
        .filter((a): a is { type: 'DISCARD'; tile: TileInstance } => a.type === 'DISCARD')
        .map(a => a.tile)

    // 優先度スコアを計算
    const scored = tiles.map(tile => {
        let score = Math.random() * 10 // ベースはランダム

        // 字牌は少し優先
        if (tile.id.startsWith('z')) {
            score += 3
        }

        // 端牌は少し優先
        const num = parseInt(tile.id[1])
        if (num === 1 || num === 9) {
            score += 2
        }

        return { tile, score }
    })

    // スコアが高い牌を選択
    scored.sort((a, b) => b.score - a.score)

    return { type: 'DISCARD', tile: scored[0].tile }
}

/**
 * CPUが思考中かどうか（UI表示用）
 */
export function isCpuThinking(state: GameState, humanPlayerIndex: number): boolean {
    return state.currentPlayer !== humanPlayerIndex && state.phase === 'playing'
}

/**
 * CPU思考の遅延時間（ミリ秒）
 */
export const CPU_THINK_DELAY = 800

/**
 * CPU思考の遅延時間（打牌後、ミリ秒）
 */
export const CPU_REACTION_DELAY = 500
