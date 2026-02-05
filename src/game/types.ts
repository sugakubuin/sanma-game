/**
 * 三人麻雀 - 型定義
 */

// ===========================================
// 基本型
// ===========================================

/** 牌の種類 */
export type SuitType = 'm' | 'p' | 's' | 'z' // 萬子, 筒子, 索子, 字牌

/** 牌ID（三人麻雀用：萬子は1,9のみ） */
export type TileId =
    // 萬子（1,9のみ・三人麻雀）
    | 'm1' | 'm9'
    // 筒子 1-9
    | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8' | 'p9'
    // 索子 1-9
    | 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8' | 's9'
    // 字牌 (東南西北白發中)
    | 'z1' | 'z2' | 'z3' | 'z4' | 'z5' | 'z6' | 'z7'
    // 華牌
    | 'flower'

/** 牌インスタンス（各牌の個別識別） */
export interface TileInstance {
    id: TileId
    instanceId: number      // 同じ牌を区別するためのID (0-3)
    isRed: boolean          // 赤牌か（5p, 5sは全て赤）
    isGold: boolean         // 金牌か（5p, 5s, flowerに各1枚）
    isWhitePochi: boolean   // 白ポッチか
    flowerType?: 'spring' | 'summer' | 'autumn' | 'winter' // 華牌の種類（春=金）
}

/** 風 */
export type Wind = 'east' | 'south' | 'west' | 'north'

/** 場風 */
export type RoundWind = 'east' | 'south'

/** 局 */
export interface Round {
    wind: RoundWind
    number: 1 | 2 | 3       // 何局目
}

// ===========================================
// 副露（メルド）
// ===========================================

/** 副露の種類 */
export type MeldType = 'pon' | 'minkan' | 'ankan' | 'kakan'

/** 副露 */
export interface Meld {
    type: MeldType
    tiles: TileInstance[]
    fromPlayer?: number     // 誰から鳴いたか（暗槓はundefined）
    calledTile?: TileInstance // 鳴いた牌
}

// ===========================================
// プレイヤー状態
// ===========================================

/** プレイヤー状態 */
export interface PlayerState {
    /** 座席インデックス (0: 東家, 1: 南家, 2: 西家) */
    seatIndex: number
    /** 名前 */
    name: string
    /** 自風 */
    wind: Wind
    /** 持ち点 */
    score: number
    /** 手牌 */
    hand: TileInstance[]
    /** ツモ牌（ある場合） */
    drawnTile: TileInstance | null
    /** 捨て牌 */
    discards: DiscardedTile[]
    /** 副露 */
    melds: Meld[]
    /** 抜いた華牌 */
    flowers: TileInstance[]
    /** 抜き待ちの華牌（1枚ずつアニメーションで抜くための待機列） */
    pendingFlowers: TileInstance[]
    /** リーチ状態 */
    isRiichi: boolean
    /** オープンリーチ状態 */
    isOpenRiichi: boolean
    /** ダブルリーチ状態 */
    isDoubleRiichi: boolean
    /** 一発有効フラグ */
    isIppatsu: boolean
    /** 門前清フラグ */
    isMenzen: boolean
    /** 流し役満継続フラグ */
    isNagashiValid: boolean
    /** 第一巡フラグ（天和・地和・人和判定用） */
    isFirstTurn: boolean
}

/** 捨て牌 */
export interface DiscardedTile {
    tile: TileInstance
    isRiichi: boolean       // リーチ宣言牌か
    isTsumogiri: boolean    // ツモ切りか
    calledBy?: number       // 誰に鳴かれたか
}

// ===========================================
// 山牌・王牌
// ===========================================

/** 山牌 */
export interface Wall {
    /** 残りツモ牌 */
    tiles: TileInstance[]
    /** 王牌（死牌） */
    deadWall: TileInstance[]
    /** ドラ表示牌 */
    doraIndicators: TileInstance[]
    /** 裏ドラ表示牌 */
    uraDoraIndicators: TileInstance[]
    /** 嶺上牌 */
    rinshanTiles: TileInstance[]
    /** 王牌の残り枚数（華牌抜きで減る） */
    deadWallCount: number
    /** 槓ドラの枚数 */
    kanDoraCount: number
}

// ===========================================
// ゲームフェーズ
// ===========================================

/** ゲームフェーズ */
export type GamePhase =
    | 'waiting'             // ゲーム開始待ち
    | 'dealing'             // 配牌中
    | 'playing'             // プレイ中
    | 'waiting_action'      // アクション待ち（ポンなど）
    | 'round_end'           // 局終了
    | 'game_end'            // ゲーム終了

/** ターンフェーズ */
export type TurnPhase =
    | 'draw'                // ツモ前
    | 'action'              // ツモ後・打牌前
    | 'discard'             // 打牌後・次ターン前

// ===========================================
// ゲーム状態
// ===========================================

/** ゲーム状態 */
export interface GameState {
    /** ゲームフェーズ */
    phase: GamePhase
    /** ターンフェーズ */
    turnPhase: TurnPhase
    /** 現在の局 */
    round: Round
    /** 本場 */
    honba: number
    /** 供託（リーチ棒） */
    kyotaku: number
    /** プレイヤー状態 [東家, 南家, 西家] */
    players: [PlayerState, PlayerState, PlayerState]
    /** 山牌 */
    wall: Wall
    /** 現在のターンプレイヤー (0-2) */
    currentPlayer: number
    /** 親のインデックス */
    dealerIndex: number
    /** 最後に捨てられた牌 */
    lastDiscard: DiscardedTile | null
    /** 1局中の槓回数 */
    kanCount: number
    /** 海底牌まであと何枚か */
    remainingDraws: number
    /** 局終了結果 */
    result?: RoundEndResult
    /** 現在のアクション表示（1秒間表示） */
    currentAction?: {
        type: 'PON' | 'KAN' | 'FLOWER' | 'RIICHI' | 'TSUMO' | 'RON'
        playerIndex: number
        timestamp: number
    }
}

// ===========================================
// アクション
// ===========================================

/** ゲームアクション */
export type GameAction =
    | { type: 'DISCARD'; tile: TileInstance }
    | { type: 'DRAW' }
    | { type: 'PON'; tiles: TileInstance[] }
    | { type: 'ANKAN'; tiles: TileInstance[] }
    | { type: 'MINKAN'; tiles: TileInstance[] }
    | { type: 'KAKAN'; tile: TileInstance }
    | { type: 'RIICHI'; tile: TileInstance }
    | { type: 'OPEN_RIICHI'; tile: TileInstance }
    | { type: 'TSUMO'; whitePochiTarget?: TileId }
    | { type: 'RON' }
    | { type: 'SKIP' }
    | { type: 'EXTRACT_FLOWER'; tile: TileInstance }

// ===========================================
// 和了関連
// ===========================================

/** 面子の種類 */
export type MentsuType = 'shuntsu' | 'koutsu' | 'kantsu'

/** 面子 */
export interface Mentsu {
    type: MentsuType
    tiles: TileInstance[]
    isOpen: boolean         // 副露かどうか
}

/** 和了形 */
export interface AgariPattern {
    /** 雀頭 */
    head: TileInstance[]
    /** 面子 */
    mentsu: Mentsu[]
    /** 和了牌 */
    winTile: TileInstance
    /** ツモ和了か */
    isTsumo: boolean
}

/** 和了コンテキスト（役判定に必要な情報） */
export interface AgariContext {
    /** 和了形 */
    pattern: AgariPattern
    /** 場風 */
    roundWind: Wind
    /** 自風 */
    seatWind: Wind
    /** 門前か */
    isMenzen: boolean
    /** リーチか */
    isRiichi: boolean
    /** ダブルリーチか */
    isDoubleRiichi: boolean
    /** オープンリーチか */
    isOpenRiichi: boolean
    /** 一発か */
    isIppatsu: boolean
    /** 海底か */
    isHaitei: boolean
    /** 河底か */
    isHoutei: boolean
    /** 嶺上開花か */
    isRinshan: boolean
    /** 槍槓か */
    isChankan: boolean
    /** 天和か */
    isTenhou: boolean
    /** 地和か */
    isChiihou: boolean
    /** 人和か */
    isRenhou: boolean
    /** ドラ牌 */
    doraTiles: TileId[]
    /** 裏ドラ牌 */
    uraDoraTiles: TileId[]
    /** 副露 */
    melds: Meld[]
    /** 本場 */
    honba: number
}

/** 役 */
export interface Yaku {
    name: string
    nameJp: string
    han: number
    isYakuman: boolean
    yakumanCount: number    // 役満の場合の倍率（ダブル役満=2）
}

/** 点数計算結果 */
export interface ScoreResult {
    /** 合計点 */
    total: number
    /** 親ロン時の点数 */
    parentRon?: number
    /** 親ツモ時のオール点数 */
    parentTsumoAll?: number
    /** 子ロン時の点数 */
    childRon?: number
    /** 子ツモ時の親払い */
    childTsumoParent?: number
    /** 子ツモ時の子払い */
    childTsumoChild?: number
    /** 翻数 */
    han: number
    /** 役リスト */
    yaku: Yaku[]
    /** 役満かどうか */
    isYakuman: boolean
}

/** 和了詳細情報 */
export interface WinInfo {
    playerIndex: number
    hand: TileInstance[]
    winTile: TileInstance
    scoreResult: ScoreResult
    paoPayments?: Map<number, number> // パオによる支払い情報
    yakumanCount?: number
}

// ===========================================
// 局終了
// ===========================================

/** 局終了の種類 */
export type RoundEndType =
    | 'tsumo'               // ツモ和了
    | 'ron'                 // ロン和了
    | 'double_ron'          // ダブロン
    | 'ryuukyoku'           // 流局
    | 'nagashi'             // 流し役満

/** 局終了結果 */
export interface RoundEndResult {
    type: RoundEndType
    /** 和了者 (ダブロンの場合は複数) */
    winners?: number[]
    /** 和了詳細情報（ダブロン対応） */
    winInfos?: WinInfo[]
    /** 放銃者 */
    loser?: number
    /** 点数移動 */
    scoreChanges: [number, number, number]
    /** 連荘するか */
    isDealerContinue: boolean
    /** ノーテンプレイヤー */
    notenPlayers?: number[]
}
