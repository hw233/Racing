var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var GameMode;
(function (GameMode) {
    /**
     * 实现对游戏模块的管理,单实例对象
     */
    class ModeManager {
        constructor() {
            this.eCurrentGameMode = EnumGameMode.Invalid; // 保存当前的游戏模块
            this.eNextGameMode = EnumGameMode.Logo; // 保存要切换到的游戏模块
            // protected eNextGameModule = ENUM_GameModule.Invalid; // 把 eNextGameModule 的默认值修改为 ENUM_GameModule.Invalid,可以使得游戏相关的逻辑不工作,
            // 以方便在真机上Attch后再调试.通过调试过程中修改内存中 m_eNextGameModule 的值为 Logo 即可使得逻辑继续执行
            this.nextGameModeBuildParam = undefined; // 保存切换到eNextGameMode游戏模块时传递给Build()函数的参数.用于模块间切换传递参数用.
            this.currentMode = null; // 当前模块
            this.slowElapsedTime = 0; // 慢速逻辑上次以来经过的时间
            this.modeBuilding = false; // 标识是否正在切换模块
            if (ModeManager.instance)
                throw new Error("Error: Only one ModuleManager's instance can exist!");
            ModeManager.instance = this;
        }
        // 返回当前的模块实例
        get CurrentMode() {
            return this.currentMode;
        }
        /**
         * @desc 初始化本实例
         * 注: 可以重载
         */
        build() {
            // 驱动帧回调
            Laya.timer.frameLoop(1, this, this._callback_frameMove);
            return true;
        }
        /**
         * @desc 切换到指定的模块.
         * @param eNextMode 指定要切换到的模块
         * @param modeBuildParam - 用于模块间切换传递参数. 如果传入了,则会传递给具体Mode的Build(preModule: EnumGameMode, param?:any)的param
         * 注: 模块并不会立即切换,会等到合适的时间才会真正切换,最快会在下一帧切换.
         */
        ChangeToMode(eNextMode, modeBuildParam) {
            if (this.eCurrentGameMode !== eNextMode) {
                this.eNextGameMode = eNextMode;
                this.nextGameModeBuildParam = modeBuildParam;
            }
            return true;
        }
        /**
         * @desc 重载此函数,以便创建传入类型的模块实例
         * @param eGameModule
         * 注: 可以重载
         */
        createMode(eGameModule) {
            return null;
        }
        /**
         * @desc 1秒种最多执行5次的更新函数.适合不及时的逻辑,如AI决策等.
         * @param elapsedTime 上次调用以来经过的时间
         */
        slowUpdate(elapsedTime) {
            if (this.currentMode) {
                this.currentMode.SlowUpdate(elapsedTime);
            }
        }
        /**
         * @desc 每帧调用
         * @param elapsedTime 上次调用以来经过的时间
         */
        frameMove(elapsedTime) {
            // 偿试执行慢速逻辑
            this.slowElapsedTime += elapsedTime;
            if (this.slowElapsedTime > 1.0 / 5.0) { // 1秒最多5次
                this.slowUpdate(this.slowElapsedTime);
                this.slowElapsedTime = 0;
            }
            this._internal_ChangeMode();
            // 更新当前的模块
            if (this.currentMode) {
                this.currentMode.FrameMove(elapsedTime);
            }
        }
        /**
         * @desc 内部用函数,用于Laya.timer.frameLoop的回调
         */
        _callback_frameMove() {
            this.frameMove(Laya.timer.delta * 0.001); // *0.001是转换单位为秒
        }
        /**
         * @desc 内部用函数,用来支持协程与异步创建新的Mode,以便在Mode创建过程中异步加载资源
         */
        _internal_ChangeMode() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.eNextGameMode !== EnumGameMode.Invalid && this.modeBuilding === false) { // 处理模块的切换
                    if (this.currentMode != null) {
                        // 释放当前的模块
                        this.currentMode.Release();
                        this.currentMode = null;
                    }
                    this.checkMemoryLeak();
                    const preMode = this.eCurrentGameMode;
                    this.eCurrentGameMode = this.eNextGameMode;
                    this.eNextGameMode = EnumGameMode.Invalid;
                    // 创建新的模块
                    const newMode = this.createMode(this.eCurrentGameMode);
                    // 等待模块创建完成
                    this.modeBuilding = true; // 模块正在创建中,有些事情不可以做,必须等待完成,如新模块的切换等.
                    yield atlasMgr.checkAtlasAssets(this.eCurrentGameMode);
                    yield newMode.Build(preMode, this.nextGameModeBuildParam);
                    this.modeBuilding = false;
                    this.nextGameModeBuildParam = undefined; // 清除模块创建参数
                    // 真正加载模块完成,才设置currentMode,以免误用.
                    this.currentMode = newMode;
                }
            });
        }
    }
    GameMode.ModeManager = ModeManager;
})(GameMode || (GameMode = {}));
//# sourceMappingURL=ModeManager.js.map