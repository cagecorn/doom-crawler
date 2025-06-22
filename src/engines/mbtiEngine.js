// src/engines/mbtiEngine.js
import { TRAITS as allTraits } from '../data/traits.js';
import { MBTI_INFO as mbtiData } from '../data/mbti.js';

/**
 * MBTIEngine은 개체의 MBTI 및 기타 특성을 적용하고 관리합니다.
 * 기존 TraitManager의 역할을 수행합니다.
 */
export class MBTIEngine {
    constructor(eventManager, uiManager) {
        this.eventManager = eventManager;
        this.uiManager = uiManager;
        // 모든 특성 데이터를 통합 (MBTI 포함)
        this.traits = { ...allTraits, ...mbtiData };
        console.log("[MBTIEngine] Initialized.");
    }

    /**
     * 개체에게 지정된 특성들을 적용합니다.
     * @param {object} entity - 특성을 적용할 개체
     * @param {string[]} traitIds - 적용할 특성의 ID 배열 (예: ['ISTJ', 'strong'])
     */
    applyTraits(entity, traitIds) {
        if (!traitIds || !Array.isArray(traitIds)) {
            return;
        }

        for (const traitId of traitIds) {
            const trait = this.traits[traitId];
            if (trait) {
                if (!entity.traits) {
                    entity.traits = [];
                }
                entity.traits.push(trait);

                // 특성의 능력치 변경 적용
                if (trait.stats) {
                    for (const stat in trait.stats) {
                        entity.stats[stat] = (entity.stats[stat] || 0) + trait.stats[stat];
                    }
                }

                // 특성의 스킬 추가
                if (trait.skills) {
                    if (!entity.skills) {
                        entity.skills = [];
                    }
                    entity.skills.push(...trait.skills);
                }

                console.log(`[MBTIEngine] Applied trait '${traitId}' to entity ${entity.id}`);
            } else {
                console.warn(`[MBTIEngine] Trait not found: ${traitId}`);
            }
        }
    }

    /**
     * MBTIEngine의 주기적인 업데이트를 담당합니다.
     * (지금은 비어 있지만, 나중에 지속 효과 등을 추가할 수 있습니다.)
     * @param {object} context 
     */
    update(context) {
        // 현재는 매 프레임마다 처리할 로직이 없습니다.
        // 하지만 엔진 구조의 일관성을 위해 남겨둡니다.
    }
}
