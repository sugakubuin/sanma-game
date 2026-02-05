import type { TileId } from '../game/types'

import './Tile.css'

interface TileProps {
    id: TileId
    size?: 'small' | 'medium' | 'large'
    isSelected?: boolean
    isFaceDown?: boolean
    isRed?: boolean
    isGold?: boolean
    isWhitePochi?: boolean
    isFlower?: boolean
    isRiichi?: boolean
    flowerType?: 'spring' | 'summer' | 'autumn' | 'winter'
    onClick?: () => void
}

import { getTileImageSrc } from '../game/tiles'
import type { TileInstance } from '../game/types'

function Tile({
    id,
    size = 'medium',
    isSelected = false,
    isFaceDown = false,
    isRed = false,
    isGold = false,
    isWhitePochi = false,
    isFlower = false,
    isRiichi = false,
    flowerType, // Prop added
    onClick
}: TileProps) {
    // Construct a temporary TileInstance-like object for the helper
    const tileInstance: TileInstance = {
        id,
        instanceId: -1, // Dummy
        isRed: !!isRed,
        isGold: !!isGold,
        isWhitePochi: !!isWhitePochi,
        flowerType
    }

    const imgSrc = getTileImageSrc(tileInstance)

    const classNames = [
        'tile',
        `tile-${size}`,
        isSelected ? 'selected' : '',
        onClick ? 'clickable' : '',
        isRiichi ? 'riichi' : '',
        isFaceDown ? 'face-down' : '', // Add explicit class for back
    ].filter(Boolean).join(' ')

    return (
        <div className={classNames} onClick={onClick}>
            {isFaceDown ? (
                <div className="tile-back" />
            ) : (
                <img
                    src={imgSrc}
                    alt={id}
                    className="tile-image"
                    draggable={false}
                />
            )}
        </div>
    )
}

export default Tile

