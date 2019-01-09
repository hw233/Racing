namespace FBT {
    /**
     * Loops the node or branch a number of times, or infinitely.
     * 如果需要等待中断条件,且在循环中止前等到了中断条件,则返回 BehaviorTreeStatus.Success 否则返回 BehaviorTreeStatus.Failure
     * 如果没有需要等待的中断条件,则返回 BehaviorTreeStatus.Success
     */
    export class LoopNode extends ParentBehaviorTreeNodeInterface {
        private readonly mNumLoops:number = 3;                 // 循环次数,<=0表示无限循环
        private readonly mBreakConditional: BehaviorTreeStatus.Success | BehaviorTreeStatus.Failure;

        /**
         * List of child nodes.
         *
         * @type {BehaviorTreeNodeInterface[]}
         */
        private children: BehaviorTreeNodeInterface = null;

        /**
         * 
         * @param name 本节点的名称
         * @param numLoop 循环次数,<=0表示无限循环
         * @param breakConditional 中断条件,如果指定了,则等待子节点返回 BehaviorTreeStatus.Success 或 BehaviorTreeStatus.Failure
         */
        public constructor(name: string, numLoop: number, breakConditional?: BehaviorTreeStatus.Success | BehaviorTreeStatus.Failure) {
            super(name);
            this.mNumLoops = numLoop;
            this.mBreakConditional = breakConditional;
        }

         /**
          * 开始执行当前节点逻辑
          * @param rootNode 
          */
        public *executeNode(rootNode: RootNode): IterableIterator<BehaviorTreeStatus> {
            rootNode.curNode = this.children;   // 设置一下当前节点,方便调试用
            
            // 每帧执行一次子节点
            for (let index = 0, count = (this.mNumLoops > 0?this.mNumLoops:999999999); index < count; ++index) {                
                const status = yield* this.children.executeNode(rootNode);
                if (this.mBreakConditional !== undefined) {
                    if (this.mBreakConditional === status) {
                        return BehaviorTreeStatus.Success;  // 等到了需要的结果,中断循环返回
                    }
                }
            }

            if (this.mBreakConditional !== undefined) { // 等待条件没等到,返回Fail
                return BehaviorTreeStatus.Failure;
            }

            return BehaviorTreeStatus.Success;
        }

        public addChild(child: BehaviorTreeNodeInterface): void {
            Global.Log.Assert(this.children == null);
            this.children = child;
        }
    }
}