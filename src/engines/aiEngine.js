// src/engines/aiEngine.js

/**
 * AIEngine은 게임 내 모든 AI 개체들의 행동을 총괄하여 업데이트합니다.
 * 기존 MetaAIManager의 역할을 수행합니다.
 */
import { SKILLS } from '../data/skills.js';
import { WEAPON_SKILLS } from '../data/weapon-skills.js';

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

    executeAction(entity, action, context) {
        if (!action || !action.type || action.type === 'idle') return;
        const { eventManager } = context;

        if (!entity._aiLogCooldown) entity._aiLogCooldown = 0;
        if (entity._aiLogCooldown <= 0) {
            eventManager.publish('debug', {
                tag: 'AI',
                message: `${entity.constructor.name} (id: ${entity.id.substr(0,4)}) decided action: ${action.type}`
            });
            entity._aiLogCooldown = 30;
        } else {
            entity._aiLogCooldown--;
        }

        switch (action.type) {
            case 'attack':
                if (entity.attackCooldown === 0) {
                    const weaponTags = entity.equipment?.weapon?.tags || [];
                    const isRanged = weaponTags.includes('ranged') || weaponTags.includes('bow');
                    eventManager.publish('entity_attack', { attacker: entity, defender: action.target });
                    if (isRanged && context.projectileManager) {
                        const projSkill = { projectile: 'arrow', damage: entity.attackPower };
                        context.projectileManager.create(entity, action.target, projSkill);
                    }
                    const baseCd = 60;
                    entity.attackCooldown = Math.max(1, Math.round(baseCd / (entity.attackSpeed || 1)));
                }
                break;
            case 'skill': {
                const isSilenced = entity.effects?.some(e => e.id === 'silence');
                if (isSilenced) {
                    eventManager.publish('log', { message: `[침묵] 상태라 스킬을 사용할 수 없습니다.`, color: 'grey' });
                    break;
                }
                const skill = SKILLS[action.skillId];
                if (skill && entity.mp >= skill.manaCost && (entity.skillCooldowns[action.skillId] || 0) <= 0) {
                    entity.mp -= skill.manaCost;
                    entity.skillCooldowns[action.skillId] = skill.cooldown;
                    eventManager.publish('skill_used', { caster: entity, skill, target: action.target });
                    if (context.speechBubbleManager) {
                        context.speechBubbleManager.addBubble(entity, skill.name);
                    }
                    const baseCd = 60;
                    entity.attackCooldown = Math.max(1, Math.round(baseCd / (entity.attackSpeed || 1)));
                }
                break; }
            case 'backstab_teleport': {
                const { target } = action;
                const { mapManager, vfxManager } = context;
                if (!target || !mapManager || !vfxManager) break;
                const fromPos = { x: entity.x, y: entity.y };
                const behindX = target.x - (target.direction * (mapManager.tileSize * 0.8));
                const behindY = target.y;
                const toPos = { x: behindX, y: behindY };
                vfxManager.addTeleportEffect(entity, fromPos, toPos, () => {
                    this.executeAction(entity, { type: 'attack', target }, context);
                });
                break; }
            case 'weapon_skill': {
                const skillData = WEAPON_SKILLS[action.skillId];
                if (!skillData) break;
                const weapon = entity.equipment?.weapon;
                if (!weapon || !weapon.weaponStats?.canUseSkill(action.skillId)) break;
                eventManager.publish('log', { message: `${entity.constructor.name}의 ${weapon.name}(이)가[${skillData.name}] 스킬을 사용합니다!`, color: 'yellow' });
                if (action.skillId === 'charge' && context.motionManager && action.target) {
                    context.motionManager.dashTowards(
                        entity,
                        action.target,
                        3,
                        context.enemies,
                        context.eventManager,
                        context.vfxManager,
                        context.assets['strike-effect']
                    );
                }
                if (action.skillId === 'pull' && context.motionManager && action.target) {
                    context.motionManager.pullTargetTo(action.target, entity, context.vfxManager);
                }
                if (action.skillId === 'charge_shot' && context.effectManager) {
                    context.effectManager.addEffect(action.target, 'charging_shot_effect');
                }
                if (action.skillId === 'parry_stance' && context.effectManager) {
                    context.effectManager.addEffect(entity, 'parry_ready');
                }
                if (context.speechBubbleManager) {
                    context.speechBubbleManager.addBubble(entity, skillData.name);
                }
                weapon.weaponStats.setCooldown(skillData.cooldown);
                break; }
            case 'charge_attack': {
                const { motionManager, eventManager: ev, enemies, vfxManager, assets } = context;
                const { target, skill } = action;
                if (motionManager) {
                    motionManager.dashTowards(
                        entity,
                        target,
                        Math.floor(skill.chargeRange / context.mapManager.tileSize),
                        enemies,
                        ev,
                        vfxManager,
                        assets['strike-effect']
                    );
                } else {
                    const dx = target.x - entity.x;
                    const dy = target.y - entity.y;
                    const dist = Math.hypot(dx, dy) || 1;
                    entity.x = target.x - (dx / dist) * entity.width;
                    entity.y = target.y - (dy / dist) * entity.height;
                    ev.publish('entity_attack', { attacker: entity, defender: target, skill });
                }
                entity.mp -= skill.manaCost;
                entity.skillCooldowns[skill.id] = skill.cooldown;
                entity.attackCooldown = Math.max(1, Math.round(60 / (entity.attackSpeed || 1)));
                break; }
            case 'move': {
                const { movementManager } = context;
                if (movementManager) {
                    movementManager.moveEntityTowards(entity, action.target, context);
                }
                break; }
        }
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
