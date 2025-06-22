// src/engines/statEngine.js

/**
 * StatEngine은 개체의 능력치 계산과 버프/디버프 효과의 적용을 관리합니다.
 * 기존 StatManager의 전역 역할을 수행하도록 설계되었습니다.
 */
export class StatEngine {
    constructor() {
        console.log('[StatEngine] Initialized.');
    }

    /**
     * 장비 등을 고려하여 개체의 최종 능력치를 다시 계산합니다.
     * @param {object} entity
     */
    recalculateStats(entity) {
        // 기본 능력치로 초기화
        Object.assign(entity.stats, entity.baseStats);

        // 장비로 인한 변화 적용
        if (entity.equipment) {
            for (const slot in entity.equipment) {
                const item = entity.equipment[slot];
                if (item && item.stats) {
                    for (const stat in item.stats) {
                        entity.stats[stat] = (entity.stats[stat] || 0) + item.stats[stat];
                    }
                }
            }
        }
        // TODO: 특성이나 버프에 의한 계산 로직 추가 가능
    }

    /**
     * 특정 스탯 값을 가져옵니다.
     * @param {object} entity
     * @param {string} statName
     * @returns {number}
     */
    getStat(entity, statName) {
        return entity.stats[statName] || 0;
    }

    /**
     * 버프/디버프 효과를 적용합니다.
     * @param {object} entity
     * @param {object} effect - { id, duration, stats }
     */
    applyEffect(entity, effect) {
        if (!entity.effects) entity.effects = [];
        const now = performance.now();
        const existing = entity.effects.findIndex(e => e.id === effect.id);
        const newEffect = { ...effect, startTime: now };
        if (existing > -1) entity.effects[existing] = newEffect;
        else entity.effects.push(newEffect);
        this.recalculateStats(entity);
    }

    /**
     * 모든 개체를 순회하며 효과 지속 시간을 관리합니다.
     * @param {object} context
     */
    update(context) {
        const { player, monsterManager, mercenaryManager } = context;
        const entities = [player, ...monsterManager.monsters, ...mercenaryManager.mercenaries];
        const now = performance.now();

        for (const entity of entities) {
            if (!entity.effects || entity.effects.length === 0) continue;
            const before = entity.effects.length;
            entity.effects = entity.effects.filter(effect => {
                if (effect.duration === Infinity) return true;
                return now - effect.startTime < effect.duration;
            });
            if (entity.effects.length !== before) this.recalculateStats(entity);
        }
    }
}
