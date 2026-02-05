/**
 * 三人麻雀 - ゲームモジュールエクスポート
 */

// 型定義
export type {
    SuitType,
    TileId,
    TileInstance,
    Wind,
    RoundWind,
    Round,
    MeldType,
    Meld,
    PlayerState,
    DiscardedTile,
    Wall,
    GamePhase,
    TurnPhase,
    GameState,
    GameAction,
    MentsuType,
    Mentsu,
    AgariPattern,
    AgariContext,
    Yaku,
    ScoreResult,
    RoundEndType,
    RoundEndResult,
} from './types'

// 定数
export {
    PLAYER_COUNT,
    INITIAL_SCORE,
    RIICHI_COST,
    PARENT_RON_SCORES,
    PARENT_TSUMO_ALL_SCORES,
    CHILD_RON_SCORES,
    CHILD_TSUMO_SCORES,
    TERMINAL_TILES,
    ROUTOUHAI,
    HONOR_TILES,
    DRAGON_TILES,
    WIND_TILES,
    GREEN_TILES,
    SIMPLE_TILES,
} from './constants'

// 牌ユーティリティ
export {
    TILE_IDS,
    getTileDisplay,
    getSuit,
    getNumber,
    isNumberTile,
    isHonorTile,
    isTerminalOrHonor,
    isTerminal,
    isSimple,
    getDoraFromIndicator,
    isRedDora,
    sortTiles,
    sortTileIds,
    createAllTiles,
    shuffleTiles,
    isSameTileId,
    isSameInstance,
    findTileByIds,
    countTileId,
    createTileCountMap,
} from './tiles'

// 山牌管理
export {
    createWall,
    drawTile,
    drawRinshanTile,
    getRemainingDraws,
    isLastDraw,
    isSecondToLastDraw,
    revealKanDora,
    extractFlower,
    processFlowerExtraction,
    processDrawnFlower,
    dealInitialHands,
    getDoraTiles,
    getUraDoraTiles,
} from './wall'

// 手牌・和了判定
export {
    removeTileFromHand,
    addTileToHand,
    removeTileById,
    isAgari,
    isTenpai,
    getWaitingTiles,
    getAgariPatterns,
    isFuriten,
    isWhitePochi,
    getWhitePochiAgariOptions,
    canTreatAsRedDora,
} from './hand'

// 役判定
export {
    detectYaku,
    countDora,
} from './yaku'

// 点数計算
export {
    calculateScore,
    calculateNotenBappu,
    getScoreName,
} from './score'

// ゲーム状態
export {
    initializeGame,
    startRound,
    advanceToNextRound,
    processDraw,
    processDiscard,
    advanceToNextPlayer,
    processRyuukyoku,
    processTsumo,
    processRon,
    checkTobi,
    checkGameEnd,
} from './gameState'

// ゲームアクション
export {
    getAvailableActions,
    getReactionActions,
    executeAction,
    hasOpenRiichiPlayer,
    getOpenRiichiWaitingTiles,
    isOshidashi,
    checkOpenRiichiHoujuu,
} from './gameActions'

// CPU AI
export {
    cpuSelectAction,
    isCpuThinking,
    CPU_THINK_DELAY,
    CPU_REACTION_DELAY,
} from './cpu'

// 祝儀
export {
    calculateShuugi,
    getYakumanShuugi,
    getGoldAllstarShuugi,
    getTobiShuugi,
    getHanaShiShuugi,
} from './shuugi'
export type { ShuugiResult, ShuugiBreakdown } from './shuugi'

// 精算
export {
    calculateSettlement,
    formatSettlementResult,
} from './settlement'
export type { SettlementResult } from './settlement'

// パオ（責任払い）
export {
    getPaoPlayer,
    calculatePaoPayment,
} from './pao'
