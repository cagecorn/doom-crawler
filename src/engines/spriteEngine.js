// src/engines/spriteEngine.js

/**
 * SpriteEngine은 게임 월드의 모든 개체(유닛, 아이템, 투사체 등)를
 * 화면에 그리는(drawing) 역할을 전담합니다.
 */
export class SpriteEngine {
    constructor(layerManager) {
        this.mainLayer = layerManager.getLayer('main');
        this.projectileLayer = layerManager.getLayer('projectile');
        console.log("[SpriteEngine] Initialized.");
    }

    /**
     * SpriteEngine은 프레임마다 계산할 로직이 없습니다.
     * @param {object} context
     */
    update(context) {
        // 비워 둡니다.
    }

    /**
     * 모든 개체를 캔버스에 그립니다.
     * @param {object} context
     */
    draw(context) {
        const { camera, player, monsterManager, mercenaryManager, itemManager, projectileManager, fogManager } = context;

        // 메인 캔버스 초기화
        const mainCtx = this.mainLayer.getContext();
        mainCtx.clearRect(0, 0, this.mainLayer.canvas.width, this.mainLayer.canvas.height);
        mainCtx.save();
        mainCtx.translate(-camera.x, -camera.y);

        // 그리기 순서: 아이템 -> 유닛 (몬스터, 용병, 플레이어)
        for (const item of itemManager.items) {
            if (fogManager.isVisible(item.x, item.y)) {
                 mainCtx.drawImage(item.asset, item.x, item.y, item.width, item.height);
            }
        }
        for (const monster of monsterManager.monsters) {
            if (fogManager.isVisible(monster.x, monster.y)) {
                mainCtx.drawImage(monster.asset, monster.x, monster.y, monster.width, monster.height);
            }
        }
        for (const mercenary of mercenaryManager.mercenaries) {
             if (fogManager.isVisible(mercenary.x, mercenary.y)) {
                mainCtx.drawImage(mercenary.asset, mercenary.x, mercenary.y, mercenary.width, mercenary.height);
            }
        }
        mainCtx.drawImage(player.asset, player.x, player.y, player.width, player.height);
        mainCtx.restore();

        // 투사체 캔버스 초기화 및 그리기
        const projCtx = this.projectileLayer.getContext();
        projCtx.clearRect(0, 0, this.projectileLayer.canvas.width, this.projectileLayer.canvas.height);
        projCtx.save();
        projCtx.translate(-camera.x, -camera.y);

        for (const p of projectileManager.projectiles) {
            projCtx.fillStyle = p.color;
            projCtx.fillRect(p.x, p.y, p.width, p.height);
        }
        projCtx.restore();
    }
}
