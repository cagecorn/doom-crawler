// src/engines/turnEngine.js

export class TurnEngine {
    constructor(player, monsterManager, mercenaryManager, eventManager) {
        this.player = player;
        this.monsterManager = monsterManager;
        this.mercenaryManager = mercenaryManager;
        this.eventManager = eventManager;
        this.isPlayerTurn = true;
        this.turnNumber = 0;
    }

    update(context) {
        // TurnManager의 update 로직을 그대로 가져옵니다.
        if (this.isPlayerTurn) {
            // 플레이어 턴 로직 (현재는 입력 기반이라 특별한 로직 없음)
        } else {
            // 적 턴 로직
            const allEnemies = [...this.monsterManager.monsters, ...this.mercenaryManager.mercenaries.filter(m => m.isHostile)];
            allEnemies.forEach(enemy => {
                if (enemy.ai) {
                    enemy.ai.update(context);
                }
            });

            // 턴 종료
            this.endTurn();
        }
    }

    endTurn() {
        if (!this.isPlayerTurn) { // 적 턴이 끝났을 때
            this.isPlayerTurn = true;
            this.turnNumber++;
            this.eventManager.publish('turnEnd', { turnNumber: this.turnNumber });
            this.eventManager.publish('playerTurnStart');
            this.eventManager.publish('log', { message: 'Your turn.', color: 'white' });
        }
    }

    takeTurn() {
        if (this.isPlayerTurn) {
            this.isPlayerTurn = false;
            // 적 턴 시작 로직을 이곳이나 update에서 처리
        }
    }
}
