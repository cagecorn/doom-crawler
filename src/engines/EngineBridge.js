/**
 * EngineBridge는 기존 매니저 시스템과 새로운 엔진 시스템 사이의 어댑터입니다.
 * 모든 서브 엔진을 등록하고, 게임 루프에서 단일 지점을 통해 업데이트를 관리합니다.
 */
export class EngineBridge {
    constructor() {
        this.engines = new Map(); // 각 엔진을 이름과 함께 저장합니다.
        this.engineOrder = []; // 엔진의 실행 순서를 관리합니다.
        console.log("[EngineBridge] Initialized.");
    }

    register(name, engineInstance) {
        if (!engineInstance) {
            console.error(`[EngineBridge] Error: '${name}' 엔진 인스턴스가 유효하지 않습니다.`);
            return;
        }
        this.engines.set(name, engineInstance);
        this.engineOrder.push(name);
        console.log(`[EngineBridge] Engine '${name}' registered.`);
    }

    get(name) {
        return this.engines.get(name);
    }

    /**
     * 등록된 모든 엔진의 update 메서드를 순차적으로 호출합니다. (계산 담당)
     * @param {object} context - 게임의 현재 상태와 모든 매니저를 포함하는 컨텍스트 객체
     */
    update(context) {
        for (const name of this.engineOrder) {
            const engine = this.engines.get(name);
            if (engine && typeof engine.update === 'function') {
                try {
                    engine.update(context);
                } catch (error) {
                    console.error(`[EngineBridge] Error updating engine '${name}':`, error);
                }
            }
        }
    }

    /**
     * 등록된 모든 엔진의 draw 메서드를 순차적으로 호출합니다. (그리기 담당)
     * @param {object} context - 게임의 현재 상태와 모든 매니저를 포함하는 컨텍스트 객체
     */
    draw(context) {
        for (const name of this.engineOrder) {
            const engine = this.engines.get(name);
            if (engine && typeof engine.draw === 'function') {
                try {
                    engine.draw(context);
                } catch (error) {
                    console.error(`[EngineBridge] Error drawing engine '${name}':`, error);
                }
            }
        }
    }
}
