/**
 * MovementEngine은 유닛의 이동 계산을 전담합니다.
 * 기존 MovementManager의 로직을 가져옵니다.
 */
export class MovementEngine {
    constructor(mapManager) {
        this.mapManager = mapManager;
        this.stuckTimers = new Map();
        console.log("[MovementEngine] Initialized.");
    }

    // MovementManager의 moveEntityTowards 메서드와 거의 동일
    moveEntityTowards(entity, target, context) {
        const distance = Math.hypot(target.x - entity.x, target.y - entity.y);
        if (distance < entity.width) {
            this.stuckTimers.delete(entity.id);
            return;
        }

        if (distance <= entity.speed) {
            if (!this._isOccupied(target.x, target.y, entity, context)) {
                entity.x = target.x;
                entity.y = target.y;
            }
            this.stuckTimers.delete(entity.id);
            return;
        }

        const speedBonus = Math.min(5, Math.floor(distance / this.mapManager.tileSize / 2));
        const currentSpeed = entity.speed + speedBonus;
        let vx = ((target.x - entity.x) / distance) * currentSpeed;
        let vy = ((target.y - entity.y) / distance) * currentSpeed;

        let newX = entity.x + vx;
        let newY = entity.y + vy;

        if (this._isOccupied(newX, newY, entity, context)) {
            if (!this._isOccupied(newX, entity.y, entity, context)) {
                entity.x = newX;
                this.stuckTimers.delete(entity.id);
                return;
            }
            if (!this._isOccupied(entity.x, newY, entity, context)) {
                entity.y = newY;
                this.stuckTimers.delete(entity.id);
                return;
            }
            const stuckTime = (this.stuckTimers.get(entity.id) || 0) + 1;
            this.stuckTimers.set(entity.id, stuckTime);
            if (stuckTime > 180) {
                const sizeInTiles = {
                    w: Math.ceil(entity.width / this.mapManager.tileSize),
                    h: Math.ceil(entity.height / this.mapManager.tileSize)
                };
                const safePos = this.mapManager.getRandomFloorPosition(sizeInTiles);
                if (safePos) {
                    entity.x = safePos.x;
                    entity.y = safePos.y;
                }
                this.stuckTimers.delete(entity.id);
            }
        } else {
            entity.x = newX;
            entity.y = newY;
            this.stuckTimers.delete(entity.id);
        }
    }

    // MovementManager의 _isOccupied 메서드와 동일
    _isOccupied(x, y, self, context) {
        if (this.mapManager.isWallAt(x, y, self.width, self.height)) return true;

        const selfHasShield = self.equipment?.off_hand?.tags.includes('shield');
        if (!selfHasShield) return false;

        const allEntities = [context.player, ...context.mercenaryManager.mercenaries, ...context.monsterManager.monsters];

        for (const other of allEntities) {
            if (other === self) continue;

            const otherHasShield = other.equipment?.off_hand?.tags.includes('shield');
            if (!otherHasShield) continue;

            if (x < other.x + other.width &&
                x + self.width > other.x &&
                y < other.y + other.height &&
                y + self.height > other.y) {
                return true;
            }
        }

        return false;
    }

    // 모든 엔진은 update 메서드를 가집니다.
    // 하지만 MovementEngine은 AI가 직접 moveEntityTowards를 호출하므로,
    // 이 update는 비워두거나, 나중에 전역 이동 효과 등을 처리하는 데 사용할 수 있습니다.
    update(context) {
        // 현재로서는 특별히 할 일이 없습니다.
    }
}
