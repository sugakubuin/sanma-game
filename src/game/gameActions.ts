/**
 * 三人麻雀 - ゲームアクション
 */

import type { GameState, GameAction, TileInstance, Meld, TileId, WinInfo, RoundEndResult, ScoreResult, AgariContext } from './types'
import {
    processDraw,
    processDiscard,
    advanceToNextPlayer,
} from './gameState'
import { countTileId } from './tiles'
import { isAgari, getWaitingTiles, isFuriten, decomposeToMentsu } from './hand'
import { calculateScore } from './score'
import { calculateShuugi, getHanaShiShuugi } from './shuugi'
import { getPaoPlayer, calculatePaoPayment } from './pao'
import { getDoraTiles, getUraDoraTiles, drawRinshanTile, revealKanDora } from './wall'

// ===========================================
// アクション取得
// ===========================================

/**
 * 現在のプレイヤーが実行可能なアクションを取得
 */
export function getAvailableActions(state: GameState): GameAction[] {
    const actions: GameAction[] = []
    const currentPlayer = state.players[state.currentPlayer]

    if (state.turnPhase === 'draw') {
        // ツモ前
        actions.push({ type: 'DRAW' })
    }

    if (state.turnPhase === 'action') {
        // ツモ後

        // ツモ和了チェック
        if (currentPlayer.drawnTile) {
            const allTiles = [...currentPlayer.hand, currentPlayer.drawnTile].map(t => t.id)
            if (isAgari(allTiles)) {
                actions.push({ type: 'TSUMO' })
            }
        }

        // リーチ（門前で聴牌なら）
        if (currentPlayer.isMenzen && !currentPlayer.isRiichi) {
            // ツモ牌を含めて13枚で聴牌かチェック
            for (const tile of [...currentPlayer.hand, currentPlayer.drawnTile].filter(Boolean) as TileInstance[]) {
                const testHand = [...currentPlayer.hand, currentPlayer.drawnTile]
                    .filter((t): t is TileInstance => t !== null && t.instanceId !== tile.instanceId)
                    .map(t => t.id)

                if (testHand.length === 13 && getWaitingTiles(testHand).length > 0) {
                    // フリテンでなければ通常リーチ、フリテンならオープンリーチのみ
                    const discardIds = currentPlayer.discards.map(d => d.tile.id)
                    if (!isFuriten(testHand, discardIds)) {
                        actions.push({ type: 'RIICHI', tile })
                    } else {
                        actions.push({ type: 'OPEN_RIICHI', tile })
                    }
                }
            }
        }

        // 暗槓
        if (!currentPlayer.isRiichi && state.kanCount < 4) {
            const allTiles = [...currentPlayer.hand, currentPlayer.drawnTile].filter(Boolean) as TileInstance[]
            const counts = new Map<TileId, TileInstance[]>()
            for (const tile of allTiles) {
                if (!counts.has(tile.id)) counts.set(tile.id, [])
                counts.get(tile.id)!.push(tile)
            }
            for (const [, tiles] of counts) {
                if (tiles.length === 4) {
                    actions.push({ type: 'ANKAN', tiles })
                }
            }
        }

        // 加槓
        if (!currentPlayer.isRiichi && state.kanCount < 4) {
            const drawnTile = currentPlayer.drawnTile
            if (drawnTile) {
                for (const meld of currentPlayer.melds) {
                    if (meld.type === 'pon' && meld.tiles[0].id === drawnTile.id) {
                        actions.push({ type: 'KAKAN', tile: drawnTile })
                    }
                }
                // 手牌からの加槓
                for (const tile of currentPlayer.hand) {
                    for (const meld of currentPlayer.melds) {
                        if (meld.type === 'pon' && meld.tiles[0].id === tile.id) {
                            actions.push({ type: 'KAKAN', tile })
                        }
                    }
                }
            }
        }

        // 打牌（必須アクション）
        const tilesToDiscard = [...currentPlayer.hand]
        if (currentPlayer.drawnTile) {
            tilesToDiscard.push(currentPlayer.drawnTile)
        }
        for (const tile of tilesToDiscard) {
            actions.push({ type: 'DISCARD', tile })
        }
    }

    if (state.turnPhase === 'discard') {
        // 打牌後、他プレイヤーのアクション
        // これは別のプレイヤーが実行するため、ここでは空
    }

    return actions
}

/**
 * 他プレイヤーが捨て牌に対して実行可能なアクションを取得
 */
export function getReactionActions(state: GameState, playerIndex: number): GameAction[] {
    if (state.turnPhase !== 'discard' || !state.lastDiscard) return []
    if (playerIndex === state.currentPlayer) return []

    const actions: GameAction[] = []
    const player = state.players[playerIndex]
    const discardTile = state.lastDiscard.tile

    // ロン
    const allTiles = [...player.hand, discardTile].map(t => t.id)
    if (isAgari(allTiles)) {
        // フリテンチェック
        const handIds = player.hand.map(t => t.id)
        const discardIds = player.discards.map(d => d.tile.id)
        if (!isFuriten(handIds, discardIds)) {
            actions.push({ type: 'RON' })
        }
    }

    // ポン
    const sameCount = countTileId(player.hand, discardTile.id)
    if (sameCount >= 2) {
        const ponTiles = player.hand.filter(t => t.id === discardTile.id).slice(0, 2)
        actions.push({ type: 'PON', tiles: ponTiles })
    }

    // 明槓
    if (sameCount >= 3 && state.kanCount < 4) {
        const kanTiles = player.hand.filter(t => t.id === discardTile.id).slice(0, 3)
        actions.push({ type: 'MINKAN', tiles: kanTiles })
    }

    // スキップ
    actions.push({ type: 'SKIP' })

    return actions
}

// ===========================================
// アクション実行
// ===========================================

/**
 * アクションを実行
 */
export function executeAction(state: GameState, action: GameAction, playerIndex?: number): GameState {
    const player = playerIndex ?? state.currentPlayer

    switch (action.type) {
        case 'DRAW':
            return processDraw(state)

        case 'DISCARD':
            return processDiscard(state, action.tile)

        case 'RIICHI':
            return executeRiichi(state, action.tile, false)

        case 'OPEN_RIICHI':
            return executeRiichi(state, action.tile, true)

        case 'TSUMO':
            // ツモ和了処理（局終了）
            return processTsumo(state, action.whitePochiTarget)

        case 'RON':
            // ロン和了処理（局終了）
            return processRon(state, playerIndex!)

        case 'PON':
            return executePon(state, action.tiles, player)

        case 'ANKAN':
            return executeAnkan(state, action.tiles)

        case 'MINKAN':
            return executeMinkan(state, action.tiles, player)

        case 'KAKAN':
            return executeKakan(state, action.tile)

        case 'SKIP':
            return advanceToNextPlayer(state)

        default:
            return state
    }
}

// ===========================================
// 個別アクション実装
// ===========================================

function executeRiichi(state: GameState, tile: TileInstance, isOpen: boolean): GameState {
    const currentPlayer = state.players[state.currentPlayer]

    const updatedPlayer = {
        ...currentPlayer,
        isRiichi: true,
        isOpenRiichi: isOpen,
        isDoubleRiichi: currentPlayer.isFirstTurn,
        isIppatsu: true,
        score: currentPlayer.score - 1000,
    }

    const players = [...state.players] as [typeof state.players[0], typeof state.players[1], typeof state.players[2]]
    players[state.currentPlayer] = updatedPlayer

    // 打牌処理
    return processDiscard({ ...state, players, kyotaku: state.kyotaku + 1 }, tile, true)
}

function executePon(state: GameState, tiles: TileInstance[], playerIndex: number): GameState {
    const player = state.players[playerIndex]
    const discardTile = state.lastDiscard!.tile

    // 手牌から取り除く
    const newHand = player.hand.filter(t => !tiles.some(pt => pt.instanceId === t.instanceId))

    // 副露を追加
    const meld: Meld = {
        type: 'pon',
        tiles: [...tiles, discardTile],
        fromPlayer: state.currentPlayer,
        calledTile: discardTile,
    }

    const updatedPlayer = {
        ...player,
        hand: newHand,
        melds: [...player.melds, meld],
        isMenzen: false,
        isNagashiValid: false,
    }

    const players = [...state.players] as [typeof state.players[0], typeof state.players[1], typeof state.players[2]]
    players[playerIndex] = updatedPlayer

    // 捨て牌をマーク
    const currentPlayerDiscards = [...state.players[state.currentPlayer].discards]
    if (currentPlayerDiscards.length > 0) {
        currentPlayerDiscards[currentPlayerDiscards.length - 1] = {
            ...currentPlayerDiscards[currentPlayerDiscards.length - 1],
            calledBy: playerIndex,
        }
    }
    players[state.currentPlayer] = {
        ...state.players[state.currentPlayer],
        discards: currentPlayerDiscards,
    }

    // 鳴いた人のターンにして打牌待ち
    return {
        ...state,
        players,
        currentPlayer: playerIndex,
        turnPhase: 'action',
        lastDiscard: null,
    }
}

function executeAnkan(state: GameState, tiles: TileInstance[]): GameState {
    const currentPlayer = state.players[state.currentPlayer]

    // 手牌から取り除く
    const newHand = currentPlayer.hand.filter(t => !tiles.some(kt => kt.instanceId === t.instanceId))

    const meld: Meld = {
        type: 'ankan',
        tiles,
    }

    // 嶺上牌をツモ
    const rinshanTile = drawRinshanTile(state.wall)

    // 華牌の場合はpendingFlowersに追加
    let newDrawnTile: TileInstance | null = rinshanTile
    if (rinshanTile && rinshanTile.id === 'flower') {
        currentPlayer.pendingFlowers.push(rinshanTile)
        newDrawnTile = null
    }

    const updatedPlayer = {
        ...currentPlayer,
        hand: newHand,
        drawnTile: newDrawnTile,
        melds: [...currentPlayer.melds, meld],
    }

    const players = [...state.players] as [typeof state.players[0], typeof state.players[1], typeof state.players[2]]
    players[state.currentPlayer] = updatedPlayer

    // 槓ドラを即めくり
    revealKanDora(state.wall, state.kanCount)

    return {
        ...state,
        players,
        kanCount: state.kanCount + 1,
        turnPhase: 'action', // 嶺上牌ツモ後、打牌待ち
    }
}

function executeMinkan(state: GameState, tiles: TileInstance[], playerIndex: number): GameState {
    const player = state.players[playerIndex]
    const discardTile = state.lastDiscard!.tile

    const newHand = player.hand.filter(t => !tiles.some(kt => kt.instanceId === t.instanceId))

    const meld: Meld = {
        type: 'minkan',
        tiles: [...tiles, discardTile],
        fromPlayer: state.currentPlayer,
        calledTile: discardTile,
    }

    // 嶺上牌をツモ
    const rinshanTile = drawRinshanTile(state.wall)

    // 華牌の場合はpendingFlowersに追加
    let newDrawnTile: TileInstance | null = rinshanTile
    if (rinshanTile && rinshanTile.id === 'flower') {
        player.pendingFlowers.push(rinshanTile)
        newDrawnTile = null
    }

    const updatedPlayer = {
        ...player,
        hand: newHand,
        drawnTile: newDrawnTile,
        melds: [...player.melds, meld],
        isMenzen: false,
        isNagashiValid: false,
    }

    const players = [...state.players] as [typeof state.players[0], typeof state.players[1], typeof state.players[2]]
    players[playerIndex] = updatedPlayer

    // 捨て牌をマーク
    const currentPlayerDiscards = [...state.players[state.currentPlayer].discards]
    if (currentPlayerDiscards.length > 0) {
        currentPlayerDiscards[currentPlayerDiscards.length - 1] = {
            ...currentPlayerDiscards[currentPlayerDiscards.length - 1],
            calledBy: playerIndex,
        }
    }
    players[state.currentPlayer] = {
        ...state.players[state.currentPlayer],
        discards: currentPlayerDiscards,
    }

    // 槓ドラを即めくり
    revealKanDora(state.wall, state.kanCount)

    return {
        ...state,
        players,
        currentPlayer: playerIndex,
        kanCount: state.kanCount + 1,
        turnPhase: 'action',
        lastDiscard: null,
    }
}

function executeKakan(state: GameState, tile: TileInstance): GameState {
    const currentPlayer = state.players[state.currentPlayer]

    // ポンを見つけて加槓に変更
    const meldIndex = currentPlayer.melds.findIndex(
        m => m.type === 'pon' && m.tiles[0].id === tile.id
    )

    if (meldIndex === -1) return state

    const newMelds = [...currentPlayer.melds]
    newMelds[meldIndex] = {
        ...newMelds[meldIndex],
        type: 'kakan',
        tiles: [...newMelds[meldIndex].tiles, tile],
    }

    // 手牌またはツモ牌から取り除く
    let newHand = currentPlayer.hand

    if (currentPlayer.drawnTile?.instanceId === tile.instanceId) {
        // ツモ牌を使う場合は何もしない（後で嶺上牌を設定）
    } else {
        newHand = currentPlayer.hand.filter(t => t.instanceId !== tile.instanceId)
    }

    // 嶺上牌をツモ
    const rinshanTile = drawRinshanTile(state.wall)

    // 華牌の場合はpendingFlowersに追加
    let newDrawnTile: TileInstance | null = rinshanTile
    if (rinshanTile && rinshanTile.id === 'flower') {
        currentPlayer.pendingFlowers.push(rinshanTile)
        newDrawnTile = null
    }

    const updatedPlayer = {
        ...currentPlayer,
        hand: newHand,
        drawnTile: newDrawnTile,
        melds: newMelds,
    }

    const players = [...state.players] as [typeof state.players[0], typeof state.players[1], typeof state.players[2]]
    players[state.currentPlayer] = updatedPlayer

    // 槓ドラを即めくり
    revealKanDora(state.wall, state.kanCount)

    return {
        ...state,
        players,
        kanCount: state.kanCount + 1,
        turnPhase: 'action',
    }
}

// ===========================================
// オープンリーチ判定
// ===========================================

/**
 * オープンリーチ者がいるかどうか
 */
export function hasOpenRiichiPlayer(state: GameState): number | null {
    for (let i = 0; i < 3; i++) {
        if (state.players[i].isOpenRiichi) {
            return i
        }
    }
    return null
}

// ===========================================
// 和了処理
// ===========================================

/**
 * ツモ和了処理
 */
function processTsumo(state: GameState, whitePochiTarget?: TileId): GameState {
    const player = state.players[state.currentPlayer]
    if (!player.drawnTile) return state // 通常ありえない

    // 白ポッチ対応
    let drawnTile = player.drawnTile
    let hand = [...player.hand]

    // whitePochiTargetが指定されている場合、手牌またはツモ牌の白ポッチをターゲット牌として扱う
    if (whitePochiTarget) {
        // ツモ牌が白ポッチの場合
        if (drawnTile.isWhitePochi) {
            drawnTile = { ...drawnTile, id: whitePochiTarget }
        }
        // 手牌に白ポッチがある場合（ツモが白ポッチでなければ手牌にあるはず）
        else {
            const pochiIndex = hand.findIndex(t => t.isWhitePochi)
            if (pochiIndex !== -1) {
                hand[pochiIndex] = { ...hand[pochiIndex], id: whitePochiTarget }
            }
        }
    }

    const allTiles = [...hand, drawnTile]

    // 面子分解
    const patterns = decomposeToMentsu(allTiles)
    if (patterns.length === 0) return state // 和了形でない

    // コンテキスト作成（高点法のロジックが必要だが、簡易的に最初のパターンを採用、あるいは最高点を探す）
    // 本来は全てのパターンで点数を計算して最高得点を採用する
    let bestScore: ScoreResult = { total: 0, han: 0, yaku: [], isYakuman: false }
    let bestPattern = patterns[0]
    let maxTotal = -1

    const doraTiles = getDoraTiles(state.wall)
    const uraDoraTiles = getUraDoraTiles(state.wall)

    for (const p of patterns) {
        // 雀頭と面子の形からAgariPatternを構築
        // decomposeToMentsuは { head, mentsu } を返す
        const agariPattern = {
            head: p.head,
            mentsu: p.mentsu,
            winTile: drawnTile,
            isTsumo: true
        }

        const context: AgariContext = {
            pattern: agariPattern,
            roundWind: state.round.wind,
            seatWind: player.wind,
            isMenzen: player.isMenzen,
            isRiichi: player.isRiichi,
            isDoubleRiichi: player.isDoubleRiichi,
            isOpenRiichi: player.isOpenRiichi,
            isIppatsu: player.isIppatsu,
            isHaitei: state.remainingDraws === 0,
            isHoutei: false,
            isRinshan: false, // 暫定
            isChankan: false,
            doraTiles: doraTiles,
            uraDoraTiles: uraDoraTiles,
            isTenhou: player.isFirstTurn && state.currentPlayer === state.dealerIndex, // 天和
            isChiihou: player.isFirstTurn && state.currentPlayer !== state.dealerIndex, // 地和
            isRenhou: false, // ツモなので無し
            melds: player.melds,
            honba: state.honba
        }

        const score = calculateScore(context)
        if (score.total > maxTotal) {
            maxTotal = score.total
            bestScore = score
            bestPattern = p
        }
    }

    // 祝儀計算
    const _shuugi = calculateShuugi(
        {
            pattern: {
                head: bestPattern.head,
                mentsu: bestPattern.mentsu,
                winTile: drawnTile,
                isTsumo: true
            },
            roundWind: state.round.wind,
            seatWind: player.wind,
            isMenzen: player.isMenzen,
            isRiichi: player.isRiichi,
            isDoubleRiichi: player.isDoubleRiichi,
            isOpenRiichi: player.isOpenRiichi,
            isIppatsu: player.isIppatsu,
            isHaitei: state.remainingDraws === 0,
            isHoutei: false,
            isRinshan: false,
            isChankan: false,
            doraTiles,
            uraDoraTiles,
            isTenhou: player.isFirstTurn && state.currentPlayer === state.dealerIndex,
            isChiihou: player.isFirstTurn && state.currentPlayer !== state.dealerIndex,
            isRenhou: false,
            melds: player.melds,
            honba: state.honba
        },
        player.hand,
        drawnTile,
        uraDoraTiles.length, // 裏ドラ枚数
        0, // カン裏（未実装）
        bestScore.isYakuman,
        bestScore.isYakuman ? bestScore.yaku.reduce((acc, y) => acc + (y.yakumanCount || 1), 0) : 0,
        bestScore.han
    )

    // 花四祝儀（本来は祝儀計算に含まれるが、手動追加）
    const _flowerScore = getHanaShiShuugi(player.flowers.length, true)

    // ログ出力（未使用変数の抑制）
    console.log('Shuugi:', _shuugi)
    console.log('FlowerScore:', _flowerScore)

    // パオ判定
    const paoPlayerIndex = getPaoPlayer(player.melds)
    const paoPayments = paoPlayerIndex !== null
        ? calculatePaoPayment(bestScore.total, paoPlayerIndex, null)
        : undefined

    const winInfo: WinInfo = {
        playerIndex: state.currentPlayer,
        hand: hand,
        winTile: drawnTile,
        scoreResult: bestScore,
        paoPayments: paoPayments,
        yakumanCount: bestScore.isYakuman ? 1 : 0 // 簡易
    }

    // 点数移動計算（簡易）
    const scoreChanges: [number, number, number] = [0, 0, 0]
    // ... 点数移動の詳細計算ロジックが必要（親子、パオ考慮）
    // 一旦、scoreResult.totalをベースに分配（score.tsに親・子の支払い情報があるはず）
    // ScoreResultの構造: parentTsumoAll, childTsumoParent, childTsumoChild

    const isDealer = state.currentPlayer === state.dealerIndex

    if (isDealer) {
        // 親のツモ
        const payment = bestScore.parentTsumoAll || 0
        for (let i = 0; i < 3; i++) {
            if (i !== state.currentPlayer) {
                scoreChanges[i] -= payment
                scoreChanges[state.currentPlayer] += payment
            }
        }
    } else {
        // 子のツモ
        const parentPay = bestScore.childTsumoParent || 0
        const childPay = bestScore.childTsumoChild || 0
        scoreChanges[state.dealerIndex] -= parentPay
        scoreChanges[state.currentPlayer] += parentPay

        for (let i = 0; i < 3; i++) {
            if (i !== state.currentPlayer && i !== state.dealerIndex) {
                scoreChanges[i] -= childPay
                scoreChanges[state.currentPlayer] += childPay
            }
        }
    }

    // パオの反映
    if (paoPayments && paoPlayerIndex !== null) {
        // 全額を包者が払う形にする
        scoreChanges[0] = 0; scoreChanges[1] = 0; scoreChanges[2] = 0;
        scoreChanges[paoPlayerIndex] -= bestScore.total
        scoreChanges[state.currentPlayer] += bestScore.total
    }

    const result: RoundEndResult = {
        type: 'tsumo',
        winners: [state.currentPlayer],
        winInfos: [winInfo],
        scoreChanges,
        isDealerContinue: isDealer, // 親が和了れば連荘
    }

    // スコア更新
    const newPlayers = [...state.players] as [typeof state.players[0], typeof state.players[1], typeof state.players[2]]
    for (let i = 0; i < 3; i++) {
        newPlayers[i] = { ...newPlayers[i], score: newPlayers[i].score + scoreChanges[i] }
    }

    return {
        ...state,
        players: newPlayers,
        phase: 'round_end',
        result,
    }
}

/**
 * ロン和了処理
 */
function processRon(state: GameState, _playerIndex: number): GameState {
    const _turnPlayerIndex = state.currentPlayer
    // ロンしたプレイヤー（反応したプレイヤー）を特定する必要があるが、
    // executeActionのplayerIndex引数で渡ってくるはず。
    // しかしprocessRonの引数には含まれていないため、executeAction側で適切に呼び出す必要がある。
    // GameStateには、誰がロンしたかという情報はないため（アクション待ち状態）、
    // executeActionに渡されたplayerIndexを使用する。

    // ここでは便宜上、state.currentPlayerがロンしたのではなく、
    // executeAction呼び出し元で処理されることを想定するが、
    // processRon自体を拡張する。
    console.log('Ron by player:', _playerIndex, 'Turn player:', _turnPlayerIndex)
    return { ...state, phase: 'round_end' }
}

// processRonを拡張できないため、executeAction内で処理するか、引数を変える。
// executeActionの下にあるswitch文で直接呼ぶ形にする。


/**
 * オープンリーチ者の待ち牌を取得
 */
export function getOpenRiichiWaitingTiles(state: GameState, openRiichiPlayer: number): TileId[] {
    const player = state.players[openRiichiPlayer]
    const handIds = player.hand.map(t => t.id)
    return getWaitingTiles(handIds)
}

/**
 * 押し出し判定（手牌すべてがオープンリーチ者の待ち牌）
 */
export function isOshidashi(state: GameState, playerIndex: number): boolean {
    const openRiichiPlayer = hasOpenRiichiPlayer(state)
    if (openRiichiPlayer === null || openRiichiPlayer === playerIndex) {
        return false
    }

    const waitingTiles = getOpenRiichiWaitingTiles(state, openRiichiPlayer)
    const player = state.players[playerIndex]
    const allTiles = [...player.hand, player.drawnTile].filter(Boolean) as TileInstance[]

    // 手牌すべてが待ち牌かどうか
    return allTiles.every(t => waitingTiles.includes(t.id))
}

/**
 * オープンリーチへの放銃チェック
 * @returns { valid: true } 放銃有効
 * @returns { valid: false, isInvalid: true } 無効放銃（警告して戻す）
 * @returns { valid: false, isOshidashi: true } 押し出し役満
 */
export function checkOpenRiichiHoujuu(
    state: GameState,
    playerIndex: number,
    discardTileId: TileId
): { valid: boolean; isInvalid?: boolean; isOshidashi?: boolean } {
    const openRiichiPlayer = hasOpenRiichiPlayer(state)
    if (openRiichiPlayer === null || openRiichiPlayer === playerIndex) {
        return { valid: true }
    }

    const waitingTiles = getOpenRiichiWaitingTiles(state, openRiichiPlayer)
    const isWaitingTile = waitingTiles.includes(discardTileId)

    if (!isWaitingTile) {
        return { valid: true }
    }

    const player = state.players[playerIndex]

    // リーチ中なら通常放銃（自動ツモ切りなので）
    if (player.isRiichi || player.isOpenRiichi) {
        return { valid: true }
    }

    // 押し出しチェック
    if (isOshidashi(state, playerIndex)) {
        return { valid: false, isOshidashi: true }
    }

    // 無効放銃（警告して戻す）
    return { valid: false, isInvalid: true }
}

