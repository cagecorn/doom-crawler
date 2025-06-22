// src/engines/vfxEngine.js

export class VFXEngine {
    constructor(layerManager) {
        this.layerManager = layerManager;
        this.vfxLayer = this.layerManager.getLayer('vfx');
        this.effects = [];
    }

    addVFX(type, x, y, options = {}) {
        // 기존 VfxManager의 addVFX 로직
        const effect = {
            type,
            x,
            y,
            ...options,
            life: options.life || 1, // 1초 기본 수명
            createdAt: performance.now(),
        };
        this.effects.push(effect);
    }
    
    update(context) {
        const now = performance.now();
        this.effects = this.effects.filter(effect => {
            const age = (now - effect.createdAt) / 1000;
            return age < effect.life;
        });

        // VfxManager의 draw 로직을 update에서 함께 처리
        this.draw(context.ctx, context.camera);
    }

    draw(ctx, camera) {
        const context = this.vfxLayer.getContext();
        context.clearRect(0, 0, this.vfxLayer.canvas.width, this.vfxLayer.canvas.height);
        context.save();
        context.translate(-camera.x, -camera.y);

        this.effects.forEach(effect => {
            // 간단한 시각 효과 예시 (원)
            context.fillStyle = effect.color || 'rgba(255, 255, 0, 0.5)';
            context.beginPath();
            context.arc(effect.x, effect.y, effect.radius || 10, 0, Math.PI * 2);
            context.fill();
        });

        context.restore();
    }
    
    clear() {
        this.effects = [];
    }
}
