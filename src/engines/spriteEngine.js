// src/engines/spriteEngine.js

/**
 * SpriteEngine은 게임 월드의 모든 개체(유닛, 아이템, 투사체 등)를
 * 화면에 그리는(drawing) 역할을 전담합니다.
 */
export class SpriteEngine {
    constructor(layerManager) {
        // 레이어 매니저에서 주로 사용할 캔버스를 받아옵니다.
        this.entityLayer = layerManager.getLayer('entity');
        this.projectileLayer = layerManager.getLayer('vfx');
        console.log('[SpriteEngine] Initialized.');
    }

    /**
     * 매 프레임 호출되어 모든 월드 개체를 다시 그립니다.
     * @param {object} context - 게임 월드 정보
     */
    update(context) {
        this.draw(context);
    }

    draw(context) {
        const {
            camera,
            player,
            monsterManager,
            mercenaryManager,
            petManager,
            itemManager,
            projectileManager,
            fogManager
        } = context;

        // === 메인 엔티티 레이어 ===
        const mainCtx = this.entityLayer.getContext();
        mainCtx.clearRect(0, 0, this.entityLayer.canvas.width, this.entityLayer.canvas.height);
        mainCtx.save();
        mainCtx.translate(-camera.x, -camera.y);

        // 아이템
        for (const item of itemManager.items) {
            if (!fogManager || fogManager.isVisible(item.x, item.y)) {
                if (typeof item.render === 'function') item.render(mainCtx);
            }
        }

        // 몬스터
        monsterManager.monsters
            .filter(m => !m.isHidden)
            .forEach(m => {
                if (!fogManager || fogManager.isVisible(m.x, m.y)) m.render(mainCtx);
            });

        // 용병
        mercenaryManager.mercenaries
            .filter(m => !m.isHidden)
            .forEach(m => {
                if (!fogManager || fogManager.isVisible(m.x, m.y)) m.render(mainCtx);
            });

        // 펫
        if (petManager?.pets) {
            petManager.pets
                .filter(p => !p.isHidden)
                .forEach(p => {
                    if (!fogManager || fogManager.isVisible(p.x, p.y)) p.render(mainCtx);
                });
        }

        // 플레이어
        if (player && !player.isHidden) player.render(mainCtx);

        mainCtx.restore();

        // === 투사체 레이어 ===
        const projCtx = this.projectileLayer.getContext();
        projCtx.clearRect(0, 0, this.projectileLayer.canvas.width, this.projectileLayer.canvas.height);
        projCtx.save();
        projCtx.translate(-camera.x, -camera.y);

        if (projectileManager && typeof projectileManager.render === 'function') {
            projectileManager.render(projCtx);
        }

        projCtx.restore();
    }
}
