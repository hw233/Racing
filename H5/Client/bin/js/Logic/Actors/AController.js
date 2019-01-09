var Logic;
(function (Logic) {
    /** 控制器状态的基类 */
    class ControllerStateBase {
        /**
         * 当进入一个状态时调用
         * @param controller 用于传入状态所在的控制器
         * @param 外部传入的切换参数
         */
        onEnterState(controller, enterParams) {
        }
        /**
         * 1秒种最多执行5次的更新函数.适合不及时的逻辑,如AI决策等.
         * @param controller 用于传入状态所在的控制器
         * @param elapsedTime 上次调用以来经过的时间
         */
        slowUpdate(controller, elapsedTime) {
        }
        /**
         * 每帧调用，以处理逻辑
         * @param controller 用于传入状态所在的控制器
         * @param deltaTime 上次调用以来经过的时间
         */
        onTick(controller, deltaTime) {
        }
        /**
         * 当退出一个状态时调用
         * @param controller 用于传入状态所在的控制器
         */
        onExitState(controller) {
        }
    }
    Logic.ControllerStateBase = ControllerStateBase;
    /** 定义角色控制器的基类,用来处理一个角色的操作,可以是从键盘输入也可以是来自网络的消息同步 */
    class AController {
        constructor() {
            this.mOwner = null; // 此控制器的拥有者
            this.m_states = new Array(Logic.EControllerStateId.NumStates); // 保存角色控制器的状态（简单的状态机）
            this.m_currentStateId = Logic.EControllerStateId.StateNone; // 保存角色控制器的当前状态
            this.m_nextStateId = Logic.EControllerStateId.Idling; // 保存切换到角色控制器的状态
            this.m_preStateId = Logic.EControllerStateId.StateNone; // 保存角色控制器的上一个状态
            this.mEnterParams = null; // 保存进入一个状态时外部传入的参数
        }
        /**
         * 设置拥有者
         * @param owner 指定要绑定的拥有者,为null时,表示去掉绑定
         */
        setOwner(owner) {
            this.mOwner = owner;
        }
        /** 返回拥有者 */
        getOwner() {
            return this.mOwner;
        }
        /**
         * 设置当前的状态
         * @param newStateId 指定要设置的控制器的状态
         * @param enterParams 指定传入到新状态的参数
         * @param forceReEnter 指定当要切换的状态与当前状态相同时是否强制重新进入
         */
        SetState(newStateId, enterParams, forceReEnter = false) {
            if (newStateId === Logic.EControllerStateId.StateNone || this.m_nextStateId === Logic.EControllerStateId.Dead || this.m_currentStateId === Logic.EControllerStateId.Dead) {
                return;
            }
            if (this.m_currentStateId === newStateId && !forceReEnter) {
                return; // 状态相同,且不强制重进入返回
            }
            if (this.m_nextStateId === newStateId) {
                this.mEnterParams = enterParams; // 就算要切换的状态相同,我们也需要重新赋值后来要设置的状态进入参数.
                return;
            }
            if (!this.m_states[newStateId]) {
                Global.Log.Assert(false, "要切换到的状态%d并不存在(%s)", newStateId, this.toString());
                return;
            }
            /*
            // to do ... 这里处理处于某buff中不能切状态
            if (!this.CheckChangeState(newStateId)) {
                return;
            }
            if (m_currentStateId != RPG_ControllerStateId::kStateNone)
            {
                RPG_ControllerStateBase * kCurrentState = m_states[m_currentStateId];
                if (kCurrentState && FALSE == kCurrentState ->CanChangeToState(this, newStateId)) {
                    return;
                }
            }
            */
            this.m_nextStateId = newStateId;
            this.mEnterParams = enterParams;
        }
        /**
         * 返回当前的状态
         */
        GetState() {
            return this.m_currentStateId;
        }
        /**
         * 返回之前的状态ID
         */
        GetPreState() {
            return this.m_preStateId;
        }
        /**
         * 返回指定的状态
         * @param eState 指定要返回的状态
         * @return 如果存在则返回对应的状态指针,否则返回null
         */
        GetStateById(eState) {
            if (eState >= Logic.EControllerStateId.NumStates || eState === Logic.EControllerStateId.StateNone) {
                return null;
            }
            return this.m_states[eState];
        }
        /**
         * @desc    1秒种最多执行5次的更新函数.适合不及时的逻辑,如AI决策等.
         * @param elapsedTime 上次调用以来经过的时间
         */
        slowUpdate(elapsedTime) {
            // 处理状态切换
            this._StateChanged();
            // 状态的逻辑帧
            const curState = this.m_states[this.m_currentStateId];
            if (curState)
                curState.slowUpdate(this, elapsedTime);
        }
        /**
         * @desc    每帧被调用
         * @param   elapsedTime 上次调用以来经过的时间(秒)
         */
        frameMove(elapsedTime) {
            // 处理状态切换
            this._StateChanged();
            // 状态的逻辑帧
            const curState = this.m_states[this.m_currentStateId];
            if (curState)
                curState.onTick(this, elapsedTime);
        }
        /**
         * 处理状态机的状态改变
         */
        _StateChanged() {
            if (this.m_nextStateId === Logic.EControllerStateId.StateNone)
                return;
            let currentState = null;
            if (this.m_currentStateId !== Logic.EControllerStateId.StateNone) { // 退出当前的状态机
                currentState = this.m_states[this.m_currentStateId];
                if (currentState) {
                    currentState.onExitState(this);
                }
            }
            this.m_preStateId = this.m_currentStateId;
            this.m_currentStateId = this.m_nextStateId;
            this.m_nextStateId = Logic.EControllerStateId.StateNone;
            // to do ... 以后也许可以通过事件来扩展状态机的功能,像之前项目的lua脚本一样
            // 通知Lua状态机已经发生改变
            // GetOwner() ->TriggerScriptEvent("OnFSMStateChange", "*i", m_currentStateId);
            currentState = this.m_states[this.m_currentStateId];
            if (currentState) { // 进入新的状态
                currentState.onEnterState(this, this.mEnterParams);
            }
        }
        destroy() {
            // 退出一下当前的状态,以便及时清理占用的资源
            const currentState = this.m_states[this.m_currentStateId];
            if (currentState) {
                currentState.onExitState(this);
            }
            // 清理状态相关的数据
            this.m_currentStateId = Logic.EControllerStateId.StateNone;
            this.m_nextStateId = Logic.EControllerStateId.StateNone;
            this.m_preStateId = Logic.EControllerStateId.StateNone;
            this.m_states = null;
        }
    }
    Logic.AController = AController;
})(Logic || (Logic = {}));
//# sourceMappingURL=AController.js.map