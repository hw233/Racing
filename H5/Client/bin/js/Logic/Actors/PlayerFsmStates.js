var Logic;
(function (Logic) {
    let PlayerFsmState;
    (function (PlayerFsmState) {
        var $rootNode = FBT.$rootNode;
        var $sequence = FBT.$sequence;
        var $do = FBT.$do;
        var $doT = FBT.$doT;
        var $condition = FBT.$condition;
        var $waitTime = FBT.$waitTime;
        var $loop = FBT.$loop;
        /**
         * 技能行为树的状态数据
         */
        class SkillBTStateData extends FBT.StateData {
        }
        /**
         * 定义检测角色输入的行为节点类
         * 注: 等待时间结束则返回 BehaviorTreeStatus.Failure, 如果接收到输入,则返回输入函数返回的状态
         */
        class CheckCharacterInput {
            /**
             *
             * @param mWaitTime 检测时间(秒)
             * @param mfnCheckInput 检测输入的回调函数.每帧调用
             */
            constructor(mWaitTime, mfnCheckInput) {
                this.mWaitTime = mWaitTime;
                this.mfnCheckInput = mfnCheckInput;
            }
            /**
             * 节点进入的函数
             * @returns {}
             */
            enter() {
                this.mTime = this.mWaitTime;
            }
            /**
             * 每帧调用的函数
             * @param state 行为树的状态数据
             * @returns 返回BehaviorTreeStatus.Success或BehaviorTreeStatus.Failure中止运行,返回BehaviorTreeStatus.Running继续运行
             */
            tick(state) {
                this.mTime -= state.deltaTime;
                if (this.mTime <= 0) {
                    return BehaviorTreeStatus.Failure; // 没等到时间,返回Failure
                }
                return this.mfnCheckInput(state);
            }
        }
        /**
         * 本地玩家的技能释放状态
         */
        class LocalPlayerSkillState extends Logic.ControllerStateBase {
            constructor() {
                super();
                this.mToFireSkillId = -1; // 待释放的技能Id
                this.mTarget = null; // 技能攻击的目标
                this.mFiredCallback = null; // 技能释放成功后的回调函数
                this.mTargetMonsterId = -1; // 要攻击目标的怪物的ID
                this.mAutoFighting = false; // 是否是自动挂机中的技能释放
                this.mFiredSkillId = -1; // 正在释放的技能Id
                this.mRootTreeNode = null; // 技能释放行为树的根节点
            }
            /**
             * 设置待释放的技能Id
             * @param toFireSkillId 指定要释放的技能Id
             * @param target 如果指定了,则攻击此目标
             * @param firedCallback 如果给定了,在释放成功时,会调用此函数
             * @param targetMonsterId 要攻击的目标怪物数据表Id
             * @param autoFighting 是否是自动挂机中释放技能
             */
            setToFireSkill(toFireSkillId, target, firedCallback, targetMonsterId, autoFighting) {
                this.mToFireSkillId = toFireSkillId;
                this.mTarget = target;
                this.mFiredCallback = firedCallback;
                this.mTargetMonsterId = targetMonsterId;
                this.mAutoFighting = autoFighting;
            }
            /**
             * 生成指定攻击参数的普攻行为树节点
             * @param attackIndex 指定普攻的索引, 0 ~ 5
             */
            createMeleeAttackBT(attackIndex) {
                // 普攻分5个动作,下面对应每个动作的配置数据
                const damageTimes = [0.2, 0.12, 0.2, 0.12, 0.4]; // 普攻的伤害时间点(秒). 从技能释放开始计算
                const lockTimes = [0.6, 0.425, 0.445, 0.45, 0.85]; // 普攻的硬值时间点(秒). 从技能释放开始计算,之后动作可以被下一个技能释放或行走打断
                const attackTimes = [0.667, 0.5, 0.5, 0.5, 0.9]; // 普攻的动作总长度(秒). 即如果动作不被打断,会等待这么长时间以便动作播放完成. 从技能释放开始计算.
                return $sequence(`普攻_${attackIndex}`, 
                // 查找并面向攻击目标
                $condition("查找目标", (stateData) => {
                    this.findValidTarget(stateData.controller);
                    return true;
                }), 
                // 向GameServer发送动作指令
                $do("发送指令到GS", () => this.sendActionCmdToGS(GActions.Attack)), $do("播放普攻动作", () => this.playMeleeAttackAction(attackIndex)), $waitTime("等待伤害点", damageTimes[attackIndex]), $do("发送伤害消息", () => this.sendDamageMsg(attackIndex)), $waitTime("等待硬值结束", lockTimes[attackIndex] - damageTimes[attackIndex]), $do("通知技能释放结束", () => this.skillFiredCallback()), // 这时技能实际已经播放完成,剩下的动作全是表演性质的,可以被打断了
                // 等待动作播放结束并响应玩家输入,如果等到输入,动作被打断,则返回 BehaviorTreeStatus.Success,否则返回 BehaviorTreeStatus.Failure
                $doT("检测输入", CheckCharacterInput, attackTimes[attackIndex] - lockTimes[attackIndex], () => this.checkMeleeInput()));
            }
            /**
             * 当进入一个状态时调用
             * @param controller 用于传入状态所在的控制器
             * @param 外部传入的切换参数
             */
            onEnterState(controller, enterParams) {
                this.mSkillBTStateData = new SkillBTStateData();
                this.fireSkill();
            }
            /**
             * 释放一个技能
             */
            fireSkill() {
                if (this.mToFireSkillId === 10000) { // 普攻             
                    this.mRootTreeNode = $rootNode($loop("循环,直到没普攻输入", -1, $sequence("5次普攻", this.createMeleeAttackBT(0), // 普攻1
                    this.createMeleeAttackBT(1), // 普攻2
                    this.createMeleeAttackBT(2), // 普攻3
                    this.createMeleeAttackBT(3), // 普攻4
                    this.createMeleeAttackBT(4)), BehaviorTreeStatus.Failure // 等待没有输入下一次普攻
                    ));
                    // Debug - 调试这棵行为树
                    // FBT.Debugger.Debug(this.mRootTreeNode);
                }
                else { // 其它魔法技能?
                }
                this.mFiredSkillId = this.mToFireSkillId; // 保存已经释放的技能Id
                this.mToFireSkillId = -1; // 清除掉已经开始释放的技能,等待重新设置
            }
            /**
             * 每帧调用，以处理逻辑
             * @param controller 用于传入状态所在的控制器
             * @param deltaTime 上次调用以来经过的时间
             */
            onTick(controller, deltaTime) {
                // 运行技能释放逻辑的行为树
                this.mSkillBTStateData.deltaTime = deltaTime;
                this.mSkillBTStateData.controller = controller;
                const runResult = this.mRootTreeNode.tick(this.mSkillBTStateData);
                if (runResult !== BehaviorTreeStatus.Running) {
                    if (this.mToFireSkillId >= 0) {
                        this.fireSkill(); // 释放一个新的技能
                        return;
                    }
                    // 行为树运行结束了,切换到Idle状态
                    controller.SetState(Logic.EControllerStateId.Idling);
                }
            }
            /**
             * 当退出一个状态时调用
             * @param controller 用于传入状态所在的控制器
             */
            onExitState(controller) {
                this.mToFireSkillId = -1;
                this.mFiredSkillId = -1;
                this.mTarget = null;
                this.mFiredCallback = null;
                this.mRootTreeNode = null;
                this.mAutoFighting = false;
                this.mTargetMonsterId = -1;
                super.onEnterState(controller);
            }
            /**
             * 偿试查找一个有效的攻击目标,如果找到返回true,否则返回false
             * 如果找到目标,会自动面向目标
             * @param controller 指定攻击者的角色控制器
             * @param isAutoFighting 指定是否是挂机中
             */
            findValidTarget(controller) {
                if (this.mTarget && this.mTarget.isDead()) {
                    this.mTarget = null;
                }
                if (this.mTarget == null) {
                    // 偿试查找周围离得最近的有效的攻击目标
                    const character = controller.getCharacter();
                    this.mTarget = character.getLevel().seekMonsterToLock(character, this.mAutoFighting, this.mTargetMonsterId, 350);
                }
                // 如果找到目标,则转向目标
                if (this.mTarget) {
                    const coord = this.mTarget.getCoordinate();
                    controller.faceToPoint(coord.x, coord.y);
                    return true;
                }
                return false;
            }
            /**
             * 发送动作指令给服务器
             */
            sendActionCmdToGS(actoin) {
                // 同步技能攻击行为
                const controller = this.mSkillBTStateData.controller;
                const selfCoord = controller.getControlPosition();
                if (this.mTarget) { // 如果有攻击目标,则取目标位置
                    this.mTargetCoord = this.mTarget.getCoordinate();
                }
                else { // 没有攻击目标,则角色面向的方向
                    const forward = controller.getControlForward();
                    const length = 350; // 默认的攻击距离
                    this.mTargetCoord = new Laya.Point(selfCoord.x + forward.x * length, selfCoord.y + forward.y * length);
                }
                const targetCoord = this.mTargetCoord;
                const yAngle = Global.GetYAngle(controller.getControlRotation());
                const direction = Global.getDirectionByTan(targetCoord.x, targetCoord.y, selfCoord.x, selfCoord.y);
                Net.sendAction(direction, actoin, selfCoord, targetCoord, yAngle);
                return BehaviorTreeStatus.Success;
            }
            /**
             * 触发技能释放完成的回调
             */
            skillFiredCallback() {
                this.mFiredCallback && this.mFiredCallback();
                return BehaviorTreeStatus.Success;
            }
            /**
             * 播放普攻的指定招式
             * @param attackIndex 指定普攻的第几招
             */
            playMeleeAttackAction(attackIndex) {
                const controller = this.mSkillBTStateData.controller;
                controller.getActionPlayer().playAction(GActions.Attack1 + attackIndex);
                return BehaviorTreeStatus.Success;
            }
            /**
             * 发送伤害消息给服务器
             * @param attackIndex 指定普攻的第几招
             */
            sendDamageMsg(attackIndex) {
                // 发送伤害消息
                Net.sendSpriteAttack(this.mSkillBTStateData.controller.getCharacter(), this.mTargetCoord, this.mFiredSkillId, this.mTarget);
                return BehaviorTreeStatus.Success;
            }
            /**
             * 检测新的技能释放输入
             */
            checkMeleeInput() {
                // to do ... 检测是否玩家按下了移动键? 这个要优先. 切换到行走状态,以便处理移动输入
                if (this.mToFireSkillId < 0) {
                    return BehaviorTreeStatus.Running;
                }
                if (this.mToFireSkillId === 10000) {
                    // 继续普攻
                    this.mToFireSkillId = -1; // 清除掉普攻的标记.
                    return BehaviorTreeStatus.Success;
                }
                else {
                    this.fireSkill();
                }
                return BehaviorTreeStatus.Running;
            }
        }
        PlayerFsmState.LocalPlayerSkillState = LocalPlayerSkillState;
        /**
         * 实现玩家的服务器动作表演状态
         */
        class ServerRunActionState extends Logic.CharacterFsmState.ServerRunActionState {
            constructor() {
                super(...arguments);
                this.mMeleeAttackIndex = 0; // 记录普攻连击的索引
            }
            /**
             * 当进入一个状态时调用
             * @param controller 用于传入状态所在的控制器
             * @param 外部传入的切换参数
             */
            onEnterState(controller, enterParams) {
                const action = enterParams.action;
                if (action === GActions.Attack) {
                    enterParams.action = GActions.Attack1 + this.mMeleeAttackIndex;
                    this.mMeleeAttackIndex++; // 增加连击数
                    if (this.mMeleeAttackIndex >= 5) {
                        this.mMeleeAttackIndex = 0;
                    }
                }
                super.onEnterState(controller, enterParams);
            }
            onAniStop(characterController) {
                this.mMeleeAttackIndex = 0; // 重置普攻连击索引
                super.onAniStop(characterController);
            }
        }
        PlayerFsmState.ServerRunActionState = ServerRunActionState;
        /**
         * 本地玩家的死亡状态
         */
        class LocalPlayerDeath extends Logic.CharacterFsmState.Death {
            constructor(nDelay) {
                super(nDelay);
            }
            /**
             * 当进入一个状态时调用
             * @param controller 用于传入状态所在的控制器
             */
            onEnterState(controller) {
                super.onEnterState(controller);
                controller.cancelAutoFight(); // 死亡后自动停止挂机
            }
        }
        PlayerFsmState.LocalPlayerDeath = LocalPlayerDeath;
    })(PlayerFsmState = Logic.PlayerFsmState || (Logic.PlayerFsmState = {}));
})(Logic || (Logic = {}));
//# sourceMappingURL=PlayerFsmStates.js.map