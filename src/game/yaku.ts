/**
 * 三人麻雀 - 役判定
 */

import type { AgariContext, AgariPattern, Yaku, TileId, TileInstance, Wind } from './types'
import { getSuit, getNumber, isHonorTile, isTerminalOrHonor, isSimple, isTerminal } from './tiles'
import { DRAGON_TILES, WIND_TILES, GREEN_TILES, WIND_TO_TILE } from './constants'

// ===========================================
// 役判定メイン
// ===========================================

/**
 * 役を判定して全ての成立役を返す
 */
export function detectYaku(context: AgariContext): Yaku[] {
    const yaku: Yaku[] = []
    const { pattern, isMenzen } = context

    // 役満をまずチェック
    const yakuman = detectYakuman(context)
    if (yakuman.length > 0) {
        return yakuman
    }

    // 通常役
    // 1翻役
    if (isMenzen && pattern.isTsumo) {
        yaku.push({ name: 'tsumo', nameJp: '門前清自摸和', han: 1, isYakuman: false, yakumanCount: 0 })
    }

    if (context.isRiichi && !context.isDoubleRiichi && !context.isOpenRiichi) {
        yaku.push({ name: 'riichi', nameJp: '立直', han: 1, isYakuman: false, yakumanCount: 0 })
    }

    if (context.isIppatsu) {
        yaku.push({ name: 'ippatsu', nameJp: '一発', han: 1, isYakuman: false, yakumanCount: 0 })
    }

    // 役牌
    const yakuhaiCount = countYakuhai(pattern, context.roundWind, context.seatWind)
    for (let i = 0; i < yakuhaiCount; i++) {
        yaku.push({ name: 'yakuhai', nameJp: '役牌', han: 1, isYakuman: false, yakumanCount: 0 })
    }

    // 連風牌（2翻）
    if (hasRenpuuhai(pattern, context.roundWind, context.seatWind)) {
        yaku.push({ name: 'renpuuhai', nameJp: '連風牌', han: 2, isYakuman: false, yakumanCount: 0 })
    }

    if (isPinfu(pattern, context)) {
        yaku.push({ name: 'pinfu', nameJp: '平和', han: 1, isYakuman: false, yakumanCount: 0 })
    }

    if (isTanyao(pattern)) {
        yaku.push({ name: 'tanyao', nameJp: '断幺九', han: 1, isYakuman: false, yakumanCount: 0 })
    }

    if (isMenzen && isIipeikou(pattern)) {
        yaku.push({ name: 'iipeikou', nameJp: '一盃口', han: 1, isYakuman: false, yakumanCount: 0 })
    }

    if (context.isHaitei && pattern.isTsumo) {
        yaku.push({ name: 'haitei', nameJp: '海底撈月', han: 1, isYakuman: false, yakumanCount: 0 })
    }

    if (context.isHoutei && !pattern.isTsumo) {
        yaku.push({ name: 'houtei', nameJp: '河底撈魚', han: 1, isYakuman: false, yakumanCount: 0 })
    }

    if (context.isRinshan) {
        yaku.push({ name: 'rinshan', nameJp: '嶺上開花', han: 1, isYakuman: false, yakumanCount: 0 })
    }

    if (context.isChankan) {
        yaku.push({ name: 'chankan', nameJp: '槍槓', han: 1, isYakuman: false, yakumanCount: 0 })
    }

    // 2翻役
    if (context.isDoubleRiichi) {
        yaku.push({ name: 'double_riichi', nameJp: 'ダブル立直', han: 2, isYakuman: false, yakumanCount: 0 })
    }

    if (context.isOpenRiichi) {
        yaku.push({ name: 'open_riichi', nameJp: 'オープン立直', han: 2, isYakuman: false, yakumanCount: 0 })
    }

    if (isToitoi(pattern)) {
        yaku.push({ name: 'toitoi', nameJp: '対々和', han: 2, isYakuman: false, yakumanCount: 0 })
    }

    if (isSanankou(pattern)) {
        yaku.push({ name: 'sanankou', nameJp: '三暗刻', han: 2, isYakuman: false, yakumanCount: 0 })
    }

    if (isSanrenkou(pattern)) {
        yaku.push({ name: 'sanrenkou', nameJp: '三連刻', han: 2, isYakuman: false, yakumanCount: 0 })
    }

    if (isSankantsu(pattern)) {
        yaku.push({ name: 'sankantsu', nameJp: '三槓子', han: 2, isYakuman: false, yakumanCount: 0 })
    }

    if (isShousangen(pattern)) {
        yaku.push({ name: 'shousangen', nameJp: '小三元', han: 2, isYakuman: false, yakumanCount: 0 })
    }

    if (isHonroutou(pattern)) {
        yaku.push({ name: 'honroutou', nameJp: '混老頭', han: 2, isYakuman: false, yakumanCount: 0 })
    }

    if (isSanpuukou(pattern)) {
        yaku.push({ name: 'sanpuukou', nameJp: '三風刻', han: 2, isYakuman: false, yakumanCount: 0 })
    }

    const ikkitsuuHan = isIkkitsuuhan(pattern, isMenzen)
    if (ikkitsuuHan > 0) {
        yaku.push({ name: 'ikkitsuuhan', nameJp: '一気通貫', han: ikkitsuuHan, isYakuman: false, yakumanCount: 0 })
    }

    const chantaHan = isChanta(pattern, isMenzen)
    if (chantaHan > 0) {
        yaku.push({ name: 'chanta', nameJp: '全帯幺九', han: chantaHan, isYakuman: false, yakumanCount: 0 })
    }

    if (isChitoitsuYaku(pattern)) {
        yaku.push({ name: 'chitoitsu', nameJp: '七対子', han: 2, isYakuman: false, yakumanCount: 0 })
    }

    // 3翻役
    if (isMenzen && isRyanpeikou(pattern)) {
        // 二盃口がある場合は一盃口を削除
        const iipeikouIdx = yaku.findIndex(y => y.name === 'iipeikou')
        if (iipeikouIdx !== -1) {
            yaku.splice(iipeikouIdx, 1)
        }
        yaku.push({ name: 'ryanpeikou', nameJp: '二盃口', han: 3, isYakuman: false, yakumanCount: 0 })
    }

    const honitsuHan = isHonitsu(pattern, isMenzen)
    if (honitsuHan > 0) {
        yaku.push({ name: 'honitsu', nameJp: '混一色', han: honitsuHan, isYakuman: false, yakumanCount: 0 })
    }

    const junchanHan = isJunchan(pattern, isMenzen)
    if (junchanHan > 0) {
        yaku.push({ name: 'junchan', nameJp: '純全帯幺九', han: junchanHan, isYakuman: false, yakumanCount: 0 })
    }

    // 6翻役
    const chinitsuHan = isChinitsu(pattern, isMenzen)
    if (chinitsuHan > 0) {
        // 清一色がある場合は混一色を削除
        const honitsuIdx = yaku.findIndex(y => y.name === 'honitsu')
        if (honitsuIdx !== -1) {
            yaku.splice(honitsuIdx, 1)
        }
        yaku.push({ name: 'chinitsu', nameJp: '清一色', han: chinitsuHan, isYakuman: false, yakumanCount: 0 })
    }

    // 小車輪（6翻）: 混一色七対子
    if (isKosharyu(pattern, isMenzen)) {
        // 七対子と混一色の複合を削除して小車輪として計算
        const chitoitsuIdx = yaku.findIndex(y => y.name === 'chitoitsu')
        const honitsuIdx = yaku.findIndex(y => y.name === 'honitsu')
        if (chitoitsuIdx !== -1) yaku.splice(chitoitsuIdx, 1)
        if (honitsuIdx !== -1) {
            const newHonitsuIdx = yaku.findIndex(y => y.name === 'honitsu')
            if (newHonitsuIdx !== -1) yaku.splice(newHonitsuIdx, 1)
        }
        yaku.push({ name: 'kosharyu', nameJp: '小車輪', han: 6, isYakuman: false, yakumanCount: 0 })
    }

    // 4枚使い七対子（+4翻/組）
    const fourTileBonus = countFourTileChitoitsu(pattern)
    if (fourTileBonus > 0) {
        yaku.push({ name: 'chitoitsu_4tiles', nameJp: '4枚使い', han: fourTileBonus * 4, isYakuman: false, yakumanCount: 0 })
    }

    return yaku
}

// ===========================================
// 役満判定
// ===========================================

function detectYakuman(context: AgariContext): Yaku[] {
    const yaku: Yaku[] = []
    const { pattern } = context

    if (context.isTenhou) {
        yaku.push({ name: 'tenhou', nameJp: '天和', han: 13, isYakuman: true, yakumanCount: 1 })
    }

    if (context.isChiihou) {
        yaku.push({ name: 'chiihou', nameJp: '地和', han: 13, isYakuman: true, yakumanCount: 1 })
    }

    if (context.isRenhou) {
        yaku.push({ name: 'renhou', nameJp: '人和', han: 13, isYakuman: true, yakumanCount: 1 })
    }

    if (isKokushiMusou(pattern)) {
        yaku.push({ name: 'kokushi', nameJp: '国士無双', han: 13, isYakuman: true, yakumanCount: 1 })
    }

    if (isSuuankou(pattern)) {
        yaku.push({ name: 'suuankou', nameJp: '四暗刻', han: 13, isYakuman: true, yakumanCount: 1 })
    }

    if (isDaisangen(pattern)) {
        yaku.push({ name: 'daisangen', nameJp: '大三元', han: 13, isYakuman: true, yakumanCount: 1 })
    }

    if (isRyuuiisou(pattern)) {
        yaku.push({ name: 'ryuuiisou', nameJp: '緑一色', han: 13, isYakuman: true, yakumanCount: 1 })
    }

    if (isTsuuiisou(pattern)) {
        yaku.push({ name: 'tsuuiisou', nameJp: '字一色', han: 13, isYakuman: true, yakumanCount: 1 })
    }

    if (isShousuushii(pattern)) {
        yaku.push({ name: 'shousuushii', nameJp: '小四喜', han: 13, isYakuman: true, yakumanCount: 1 })
    }

    if (isDaisuushii(pattern)) {
        yaku.push({ name: 'daisuushii', nameJp: '大四喜', han: 13, isYakuman: true, yakumanCount: 2 })
    }

    if (isChinroutou(pattern)) {
        yaku.push({ name: 'chinroutou', nameJp: '清老頭', han: 13, isYakuman: true, yakumanCount: 1 })
    }

    if (isSuukantsu(pattern)) {
        yaku.push({ name: 'suukantsu', nameJp: '四槓子', han: 13, isYakuman: true, yakumanCount: 1 })
    }

    if (isChuuren(pattern)) {
        yaku.push({ name: 'chuuren', nameJp: '九蓮宝燈', han: 13, isYakuman: true, yakumanCount: 1 })
    }

    // 大車輪: 清一色七対子
    if (isDaisharyu(pattern)) {
        yaku.push({ name: 'daisharyu', nameJp: '大車輪', han: 13, isYakuman: true, yakumanCount: 1 })
    }

    // 四連刻: 連続した同種の数牌4面子が刻子
    if (isSuurenkou(pattern)) {
        yaku.push({ name: 'suurenkou', nameJp: '四連刻', han: 13, isYakuman: true, yakumanCount: 1 })
    }

    // 萬子混一色: 萬子1,9+字牌のみ（三人麻雀特殊役満）
    if (isManzuHonitsu(pattern)) {
        yaku.push({ name: 'manzu_honitsu', nameJp: '萬子混一色', han: 13, isYakuman: true, yakumanCount: 1 })
    }

    return yaku
}

// ===========================================
// 個別役判定関数
// ===========================================

function countYakuhai(pattern: AgariPattern, roundWind: Wind, seatWind: Wind): number {
    let count = 0

    for (const mentsu of pattern.mentsu) {
        if (mentsu.type === 'koutsu' || mentsu.type === 'kantsu') {
            const id = mentsu.tiles[0].id
            // 三元牌
            if (DRAGON_TILES.includes(id)) count++
            // 場風
            if (id === WIND_TO_TILE[roundWind]) count++
            // 自風
            if (id === WIND_TO_TILE[seatWind]) count++
            // 北（三人麻雀では常に役牌）
            if (id === 'z4') count++
        }
    }

    return count
}

function hasRenpuuhai(pattern: AgariPattern, roundWind: Wind, seatWind: Wind): boolean {
    if (roundWind !== seatWind) return false

    const windTile = WIND_TO_TILE[roundWind]
    for (const mentsu of pattern.mentsu) {
        if ((mentsu.type === 'koutsu' || mentsu.type === 'kantsu') && mentsu.tiles[0].id === windTile) {
            return true
        }
    }
    return false
}

function isPinfu(pattern: AgariPattern, context: AgariContext): boolean {
    if (!context.isMenzen) return false
    if (pattern.mentsu.length !== 4) return false

    // 全て順子
    for (const mentsu of pattern.mentsu) {
        if (mentsu.type !== 'shuntsu') return false
    }

    // 雀頭が役牌でない
    if (pattern.head.length !== 2) return false
    const headId = pattern.head[0].id
    if (DRAGON_TILES.includes(headId)) return false
    if (headId === WIND_TO_TILE[context.roundWind]) return false
    if (headId === WIND_TO_TILE[context.seatWind]) return false
    if (headId === 'z4') return false // 北

    // 両面待ち（簡易判定）
    // TODO: 待ちの形を厳密に判定

    return true
}

function isTanyao(pattern: AgariPattern): boolean {
    const allTiles = getAllTilesFromPattern(pattern)
    return allTiles.every(t => isSimple(t.id))
}

function isIipeikou(pattern: AgariPattern): boolean {
    const shuntsu = pattern.mentsu.filter(m => m.type === 'shuntsu')
    if (shuntsu.length < 2) return false

    for (let i = 0; i < shuntsu.length; i++) {
        for (let j = i + 1; j < shuntsu.length; j++) {
            if (shuntsu[i].tiles[0].id === shuntsu[j].tiles[0].id) {
                return true
            }
        }
    }
    return false
}

function isRyanpeikou(pattern: AgariPattern): boolean {
    const shuntsu = pattern.mentsu.filter(m => m.type === 'shuntsu')
    if (shuntsu.length !== 4) return false

    const ids = shuntsu.map(s => s.tiles[0].id).sort()
    return ids[0] === ids[1] && ids[2] === ids[3]
}

function isToitoi(pattern: AgariPattern): boolean {
    return pattern.mentsu.every(m => m.type === 'koutsu' || m.type === 'kantsu')
}

function isSanankou(pattern: AgariPattern): boolean {
    const ankou = pattern.mentsu.filter(m => (m.type === 'koutsu' || m.type === 'kantsu') && !m.isOpen)
    return ankou.length >= 3
}

function isSuuankou(pattern: AgariPattern): boolean {
    const ankou = pattern.mentsu.filter(m => (m.type === 'koutsu' || m.type === 'kantsu') && !m.isOpen)
    return ankou.length === 4 && pattern.isTsumo
}

function isSanrenkou(pattern: AgariPattern): boolean {
    const koutsu = pattern.mentsu.filter(m => m.type === 'koutsu' || m.type === 'kantsu')
    if (koutsu.length < 3) return false

    const numberKoutsu = koutsu.filter(k => !isHonorTile(k.tiles[0].id))
    if (numberKoutsu.length < 3) return false

    // 同じスートで連番かチェック
    for (let i = 0; i < numberKoutsu.length; i++) {
        for (let j = i + 1; j < numberKoutsu.length; j++) {
            for (let k = j + 1; k < numberKoutsu.length; k++) {
                const tiles = [numberKoutsu[i], numberKoutsu[j], numberKoutsu[k]]
                const suits = tiles.map(t => getSuit(t.tiles[0].id))
                if (suits[0] === suits[1] && suits[1] === suits[2]) {
                    const nums = tiles.map(t => getNumber(t.tiles[0].id)).sort((a, b) => a - b)
                    if (nums[1] - nums[0] === 1 && nums[2] - nums[1] === 1) {
                        return true
                    }
                }
            }
        }
    }
    return false
}

function isSankantsu(pattern: AgariPattern): boolean {
    return pattern.mentsu.filter(m => m.type === 'kantsu').length === 3
}

function isSuukantsu(pattern: AgariPattern): boolean {
    return pattern.mentsu.filter(m => m.type === 'kantsu').length === 4
}

function isShousangen(pattern: AgariPattern): boolean {
    const dragonKoutsu = pattern.mentsu.filter(m =>
        (m.type === 'koutsu' || m.type === 'kantsu') && DRAGON_TILES.includes(m.tiles[0].id)
    )
    const dragonHead = pattern.head.length === 2 && DRAGON_TILES.includes(pattern.head[0].id)

    return dragonKoutsu.length === 2 && dragonHead
}

function isDaisangen(pattern: AgariPattern): boolean {
    const dragonKoutsu = pattern.mentsu.filter(m =>
        (m.type === 'koutsu' || m.type === 'kantsu') && DRAGON_TILES.includes(m.tiles[0].id)
    )
    return dragonKoutsu.length === 3
}

function isHonroutou(pattern: AgariPattern): boolean {
    const allTiles = getAllTilesFromPattern(pattern)
    return allTiles.every(t => isTerminalOrHonor(t.id))
}

function isChinroutou(pattern: AgariPattern): boolean {
    const allTiles = getAllTilesFromPattern(pattern)
    return allTiles.every(t => isTerminal(t.id))
}

function isSanpuukou(pattern: AgariPattern): boolean {
    const windKoutsu = pattern.mentsu.filter(m =>
        (m.type === 'koutsu' || m.type === 'kantsu') && WIND_TILES.includes(m.tiles[0].id)
    )
    return windKoutsu.length === 3
}

function isShousuushii(pattern: AgariPattern): boolean {
    const windKoutsu = pattern.mentsu.filter(m =>
        (m.type === 'koutsu' || m.type === 'kantsu') && WIND_TILES.includes(m.tiles[0].id)
    )
    const windHead = pattern.head.length === 2 && WIND_TILES.includes(pattern.head[0].id)

    return windKoutsu.length === 3 && windHead
}

function isDaisuushii(pattern: AgariPattern): boolean {
    const windKoutsu = pattern.mentsu.filter(m =>
        (m.type === 'koutsu' || m.type === 'kantsu') && WIND_TILES.includes(m.tiles[0].id)
    )
    return windKoutsu.length === 4
}

function isIkkitsuuhan(pattern: AgariPattern, isMenzen: boolean): number {
    const shuntsu = pattern.mentsu.filter(m => m.type === 'shuntsu')
    if (shuntsu.length < 3) return 0

    for (const suit of ['m', 'p', 's'] as const) {
        const suitShuntsu = shuntsu.filter(s => getSuit(s.tiles[0].id) === suit)
        const startNums = suitShuntsu.map(s => getNumber(s.tiles[0].id))

        if (startNums.includes(1) && startNums.includes(4) && startNums.includes(7)) {
            return isMenzen ? 2 : 1
        }
    }
    return 0
}

function isChanta(pattern: AgariPattern, isMenzen: boolean): number {
    // 全ての面子と雀頭に幺九牌を含む、最低1組の順子と字牌
    const hasShuntsu = pattern.mentsu.some(m => m.type === 'shuntsu')
    const hasHonor = pattern.mentsu.some(m => isHonorTile(m.tiles[0].id)) ||
        (pattern.head.length > 0 && isHonorTile(pattern.head[0].id))

    if (!hasShuntsu || !hasHonor) return 0

    for (const mentsu of pattern.mentsu) {
        if (!mentsu.tiles.some(t => isTerminalOrHonor(t.id))) return 0
    }
    if (pattern.head.length > 0 && !isTerminalOrHonor(pattern.head[0].id)) return 0

    return isMenzen ? 2 : 1
}

function isJunchan(pattern: AgariPattern, isMenzen: boolean): number {
    const hasShuntsu = pattern.mentsu.some(m => m.type === 'shuntsu')
    if (!hasShuntsu) return 0

    for (const mentsu of pattern.mentsu) {
        if (!mentsu.tiles.some(t => isTerminal(t.id))) return 0
    }
    if (pattern.head.length > 0 && !isTerminal(pattern.head[0].id)) return 0

    return isMenzen ? 3 : 2
}

function isHonitsu(pattern: AgariPattern, isMenzen: boolean): number {
    const allTiles = getAllTilesFromPattern(pattern)
    const numberSuits = new Set<string>()
    let hasHonor = false

    for (const tile of allTiles) {
        const suit = getSuit(tile.id)
        if (suit === 'z') {
            hasHonor = true
        } else {
            numberSuits.add(suit)
        }
    }

    if (numberSuits.size === 1 && hasHonor) {
        return isMenzen ? 3 : 2
    }
    return 0
}

function isChinitsu(pattern: AgariPattern, isMenzen: boolean): number {
    const allTiles = getAllTilesFromPattern(pattern)
    const suits = new Set<string>()

    for (const tile of allTiles) {
        suits.add(getSuit(tile.id))
    }

    if (suits.size === 1 && !suits.has('z')) {
        return isMenzen ? 6 : 5
    }
    return 0
}

function isChitoitsuYaku(pattern: AgariPattern): boolean {
    // 七対子は面子分解できない特殊形
    return pattern.mentsu.length === 0 && pattern.head.length === 0
}

function isKokushiMusou(pattern: AgariPattern): boolean {
    // 国士無双も特殊形
    return pattern.mentsu.length === 0 && pattern.head.length === 0
}

function isRyuuiisou(pattern: AgariPattern): boolean {
    const allTiles = getAllTilesFromPattern(pattern)
    return allTiles.every(t => GREEN_TILES.includes(t.id))
}

function isTsuuiisou(pattern: AgariPattern): boolean {
    const allTiles = getAllTilesFromPattern(pattern)
    return allTiles.every(t => isHonorTile(t.id))
}

function isChuuren(pattern: AgariPattern): boolean {
    // 九蓮宝燈: 和了形から特定1枚を除いた形が「1112345678999」の門前清一色
    const allTiles = getAllTilesFromPattern(pattern)
    if (allTiles.some(t => t !== allTiles[0] && getSuit(t.id) !== getSuit(allTiles[0].id))) return false

    const suit = getSuit(allTiles[0].id)
    if (suit === 'z' || suit === 'flower') return false

    const counts = new Map<number, number>()
    for (const t of allTiles) {
        const num = getNumber(t.id)
        counts.set(num, (counts.get(num) || 0) + 1)
    }

    // 1112345678999 + 任意の1枚
    const base = [3, 1, 1, 1, 1, 1, 1, 1, 3] // 1から9の必要枚数
    for (let wait = 1; wait <= 9; wait++) {
        const required = [...base]
        required[wait - 1]++

        let match = true
        for (let num = 1; num <= 9; num++) {
            if ((counts.get(num) || 0) !== required[num - 1]) {
                match = false
                break
            }
        }
        if (match) return true
    }

    return false
}

// ===========================================
// ユーティリティ
// ===========================================

function getAllTilesFromPattern(pattern: AgariPattern): TileInstance[] {
    const tiles: TileInstance[] = [...pattern.head]
    for (const mentsu of pattern.mentsu) {
        tiles.push(...mentsu.tiles)
    }
    tiles.push(pattern.winTile)
    return tiles
}

/**
 * ドラ枚数をカウント
 */
export function countDora(
    pattern: AgariPattern,
    doraTiles: TileId[],
    uraDoraTiles: TileId[],
    isRiichi: boolean
): number {
    const allTiles = getAllTilesFromPattern(pattern)
    let count = 0

    // 通常ドラ
    for (const dora of doraTiles) {
        count += allTiles.filter(t => t.id === dora).length
    }

    // 裏ドラ（リーチ時のみ）
    if (isRiichi) {
        for (const ura of uraDoraTiles) {
            count += allTiles.filter(t => t.id === ura).length
        }
    }

    // 赤ドラ（5p, 5sは全て赤）
    count += allTiles.filter(t => t.isRed).length

    return count
}

// ===========================================
// 三人麻雀特殊役判定関数
// ===========================================

/**
 * 大車輪: 清一色七対子
 */
function isDaisharyu(pattern: AgariPattern): boolean {
    // 七対子でなければfalse
    if (!isChitoitsuYaku(pattern)) return false

    // 清一色かどうか
    const allTiles = getAllTilesFromPattern(pattern)
    const suits = new Set(allTiles.map(t => getSuit(t.id)))

    // 数牌1種類のみ
    if (suits.size !== 1) return false
    const suit = [...suits][0]
    return suit === 'p' || suit === 's'  // 萬子は1,9のみで七対子不可
}

/**
 * 小車輪: 混一色七対子（門前のみ）
 */
function isKosharyu(pattern: AgariPattern, isMenzen: boolean): boolean {
    if (!isMenzen) return false
    if (!isChitoitsuYaku(pattern)) return false

    const allTiles = getAllTilesFromPattern(pattern)
    const suits = new Set<string>()
    let hasHonor = false
    let numberSuit: string | null = null

    for (const tile of allTiles) {
        const suit = getSuit(tile.id)
        if (suit === 'z') {
            hasHonor = true
        } else {
            if (numberSuit === null) {
                numberSuit = suit
            } else if (numberSuit !== suit) {
                return false  // 2種類以上の数牌
            }
        }
        suits.add(suit)
    }

    // 数牌1種類 + 字牌のみで、字牌が含まれる（清一色でない）
    return hasHonor && numberSuit !== null && suits.size === 2
}

/**
 * 四連刻: 連続した同種の数牌4面子が刻子
 */
function isSuurenkou(pattern: AgariPattern): boolean {
    if (pattern.mentsu.length !== 4) return false

    // 刻子/槓子のみを抽出
    const koutsu = pattern.mentsu.filter(m => m.type === 'koutsu' || m.type === 'kantsu')
    if (koutsu.length !== 4) return false

    // 同種の数牌かチェック
    const tiles = koutsu.map(m => m.tiles[0])
    const suits = new Set(tiles.map(t => getSuit(t.id)))
    if (suits.size !== 1) return false

    const suit = [...suits][0]
    if (suit === 'z') return false  // 字牌は不可

    // 連続した数字かチェック
    const numbers = tiles.map(t => getNumber(t.id)).sort((a, b) => a - b)
    for (let i = 0; i < 3; i++) {
        if (numbers[i + 1] - numbers[i] !== 1) return false
    }

    return true
}

/**
 * 萬子混一色: 萬子1,9+字牌のみ（三人麻雀特殊役満）
 */
function isManzuHonitsu(pattern: AgariPattern): boolean {
    const allTiles = getAllTilesFromPattern(pattern)
    let hasManzu = false
    let hasHonor = false

    for (const tile of allTiles) {
        const suit = getSuit(tile.id)
        if (suit === 'm') {
            hasManzu = true
            // 萬子は1,9のみなのでチェック不要（型で保証済み）
        } else if (suit === 'z') {
            hasHonor = true
        } else {
            return false  // 筒子・索子が含まれたらfalse
        }
    }

    return hasManzu && hasHonor
}

/**
 * 4枚使い七対子の組数をカウント
 */
function countFourTileChitoitsu(pattern: AgariPattern): number {
    if (!isChitoitsuYaku(pattern)) return 0

    const allTiles = getAllTilesFromPattern(pattern)
    const countMap = new Map<TileId, number>()

    for (const tile of allTiles) {
        countMap.set(tile.id, (countMap.get(tile.id) || 0) + 1)
    }

    // 4枚使いの組数をカウント
    let fourTileCount = 0
    for (const count of countMap.values()) {
        if (count === 4) fourTileCount++
    }

    return fourTileCount
}
