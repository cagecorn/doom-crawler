// src/engines/aiEngine.js

/**
 * AIEngine은 게임 내 모든 AI 개체들의 행동을 총괄하여 업데이트합니다.
 * 기존 MetaAIManager의 역할을 수행합니다.
 */
export class AIEngine {
    constructor() {
        console.log("[AIEngine] Initialized.");
        // 특별한 초기 상태는 필요 없습니다. 모든 정보는 context를 통해 받습니다.
        this.groups = {};
    }

    createGroup(id, strategy = 'aggressive') {
        if (!this.groups[id]) {
            this.groups[id] = {
                id,
                members: [],
                strategy,
                addMember(entity) {
                    this.members.push(entity);
                },
                removeMember(entityId) {
                    this.members = this.members.filter(m => m.id !== entityId);
                }
            };
        }
        return this.groups[id];
    }

    update(context) {
        const { monsterManager, mercenaryManager, isPlayerTurn } = context;

        // 플레이어 턴일 때는 AI가 행동하지 않습니다.
        if (isPlayerTurn) {
            return;
        }

        // 몬스터 AI 업데이트
        for (const monster of monsterManager.monsters) {
            if (monster.ai && typeof monster.ai.update === 'function') {
                try {
                    monster.ai.update(context);
                } catch (error) {
                    console.error(`[AIEngine] Error updating monster AI for ${monster.id}:`, error);
                }
            }
        }

        // 적대적인 용병 AI 업데이트
        for (const mercenary of mercenaryManager.mercenaries) {
            if (mercenary.isHostile && mercenary.ai && typeof mercenary.ai.update === 'function') {
                try {
                    mercenary.ai.update(context);
                } catch (error) {
                    console.error(`[AIEngine] Error updating mercenary AI for ${mercenary.id}:`, error);
                }
            }
        }
    }
}
