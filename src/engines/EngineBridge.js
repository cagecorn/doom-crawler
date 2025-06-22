/**
 * EngineBridge는 기존 매니저 시스템과 새로운 엔진 시스템 사이의 어댑터입니다.
 * 모든 서브 엔진을 등록하고, 게임 루프에서 단일 지점을 통해 업데이트를 관리합니다.
 */
export class EngineBridge {
    constructor() {
        this.engines = new Map(); // 각 엔진을 이름과 함께 저장합니다.
        console.log("[EngineBridge] Initialized.");
    }

    /**
     * 서브 엔진을 브릿지에 등록합니다.
     * @param {string} name - 엔진의 고유 이름 (예: 'movement', 'combat')
     * @param {object} engineInstance - `update(context)` 메서드를 가진 엔진 인스턴스
     */
    register(name, engineInstance) {
        if (!engineInstance || typeof engineInstance.update !== 'function') {
            console.error(`[EngineBridge] Error: '${name}' 엔진은 'update(context)' 메서드를 가져야 합니다.`);
            return;
        }
        this.engines.set(name, engineInstance);
        console.log(`[EngineBridge] Engine '${name}' registered.`);
    }

    /**
     * 등록된 모든 엔진의 update 메서드를 순차적으로 호출합니다.
     * @param {object} context - 게임의 현재 상태와 모든 매니저를 포함하는 컨텍스트 객체
     */
    update(context) {
        for (const [name, engine] of this.engines) {
            try {
                engine.update(context);
            } catch (error) {
                console.error(`[EngineBridge] Error updating engine '${name}':`, error);
                // 오류 발생 시 해당 엔진만 비활성화하거나, 게임을 멈추는 등의 처리를 할 수 있습니다.
            }
        }
    }
}
