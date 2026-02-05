import React from 'react'
import type { Meld } from '../game/types'
import Tile from './Tile'
import './MeldDisplay.css'

interface MeldDisplayProps {
    melds: Meld[]
    position: 'bottom' | 'left' | 'right'
    playerIndex: number // このプレイヤーのインデックス
}

/**
 * 副露牌表示コンポーネント
 * ポン・槓の牌を表示
 */
const MeldDisplay: React.FC<MeldDisplayProps> = ({ melds, position, playerIndex }) => {
    if (melds.length === 0) return null

    return (
        <div className={`meld-display meld-display-${position}`}>
            {melds.map((meld, index) => (
                <div key={index} className={`meld-group meld-${meld.type}`}>
                    {renderMeld(meld, playerIndex)}
                </div>
            ))}
        </div>
    )
}

/**
 * 副露の種類に応じて牌を描画
 */
function renderMeld(meld: Meld, playerIndex: number): React.ReactNode {
    const tiles = meld.tiles

    if (meld.type === 'pon') {
        const rotatedIndex = getRotatedIndexForPon(meld, playerIndex)

        return tiles.map((tile, i) => (
            <div key={i} className={`meld-tile ${i === rotatedIndex ? 'meld-tile-rotated' : ''}`}>
                <Tile
                    id={tile.id}
                    size="small"
                    isRed={tile.isRed}
                    isGold={tile.isGold}
                    isWhitePochi={tile.isWhitePochi}
                    flowerType={tile.flowerType}
                />
            </div>
        ))
    }

    if (meld.type === 'ankan') {
        // 暗槓: 両端が伏せ牌、中央2枚が表向き
        return tiles.map((tile, i) => {
            const isConcealed = i === 0 || i === 3
            return (
                <div key={i} className="meld-tile">
                    {isConcealed ? (
                        <Tile id={'back' as any} size="small" />
                    ) : (
                        <Tile
                            id={tile.id}
                            size="small"
                            isRed={tile.isRed}
                            isGold={tile.isGold}
                            isWhitePochi={tile.isWhitePochi}
                            flowerType={tile.flowerType}
                        />
                    )}
                </div>
            )
        })
    }

    if (meld.type === 'minkan') {
        const rotatedIndex = getRotatedIndexForMinkan(meld, playerIndex)

        return tiles.map((tile, i) => (
            <div key={i} className={`meld-tile ${i === rotatedIndex ? 'meld-tile-rotated' : ''}`}>
                <Tile
                    id={tile.id}
                    size="small"
                    isRed={tile.isRed}
                    isGold={tile.isGold}
                    isWhitePochi={tile.isWhitePochi}
                    flowerType={tile.flowerType}
                />
            </div>
        ))
    }

    if (meld.type === 'kakan') {
        // 加槓: ポンの横向き牌の上に4枚目を重ねて表示
        const ponRotatedIndex = getRotatedIndexForPon(meld, playerIndex)

        return (
            <div className="kakan-container">
                {/* 最初の3枚（ポン部分） */}
                {tiles.slice(0, 3).map((tile, i) => (
                    <div
                        key={i}
                        className={`meld-tile kakan-base ${i === ponRotatedIndex ? 'meld-tile-rotated' : ''}`}
                    >
                        <Tile
                            id={tile.id}
                            size="small"
                            isRed={tile.isRed}
                            isGold={tile.isGold}
                            isWhitePochi={tile.isWhitePochi}
                            flowerType={tile.flowerType}
                        />
                    </div>
                ))}
                {/* 4枚目を横向き牌の上に重ねる */}
                <div
                    className={`meld-tile kakan-overlay meld-tile-rotated kakan-position-${ponRotatedIndex}`}
                >
                    <Tile
                        id={tiles[3].id}
                        size="small"
                        isRed={tiles[3].isRed}
                        isGold={tiles[3].isGold}
                        isWhitePochi={tiles[3].isWhitePochi}
                        flowerType={tiles[3].flowerType}
                    />
                </div>
            </div>
        )
    }

    return null
}

/**
 * プレイヤーの相対位置を計算
 * @param myIndex 自分（表示対象）のプレイヤーインデックス
 * @param fromPlayer 鳴いた相手のプレイヤーインデックス
 * @returns 相対位置 ('left' | 'center' | 'right')
 */
function getRelativePosition(myIndex: number, fromPlayer: number): 'left' | 'center' | 'right' {
    // 三人麻雀なので、相対位置を計算
    // 自分から見て:
    // +1 (% 3) = 右（上家）
    // +2 (% 3) = 左（下家）
    const diff = (fromPlayer - myIndex + 3) % 3

    if (diff === 1) return 'right'  // 右（上家）
    if (diff === 2) return 'left'   // 左（下家）
    return 'center' // 存在しないが、フォールバック
}

/**
 * ポンの横向き牌のインデックスを決定
 */
function getRotatedIndexForPon(meld: Meld, playerIndex: number): number {
    if (meld.fromPlayer === undefined) return 2 // フォールバック

    const relativePos = getRelativePosition(playerIndex, meld.fromPlayer)

    // ポン（3枚）の横向き位置:
    // 左（下家）から → 左端（index 0）
    // 対面から → 真ん中（index 1）
    // 右（上家）から → 右端（index 2）
    if (relativePos === 'left') return 0
    if (relativePos === 'center') return 1
    return 2 // right
}

/**
 * 明槓の横向き牌のインデックスを決定
 */
function getRotatedIndexForMinkan(meld: Meld, playerIndex: number): number {
    if (meld.fromPlayer === undefined) return 1 // フォールバック

    const relativePos = getRelativePosition(playerIndex, meld.fromPlayer)

    // 明槓（4枚）の横向き位置:
    // 左（下家）から → 一番左（index 0）
    // 対面から → 左から2番目（index 1）
    // 右（上家）から → 一番右（index 3）
    if (relativePos === 'left') return 0
    if (relativePos === 'center') return 1
    return 3 // right
}

export default MeldDisplay
