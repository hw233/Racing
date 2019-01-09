namespace MyUI.Welfare {
    /**
     * 等级奖励
     */
    export class GradeRewardPart extends ui.Welfare.GradeRewardPartUI implements IWindowPart {

        private mGradeDataList: GradeItemData[]; // 等级项数据列表

        constructor() {
            super();

            this._gradeList.vScrollBarSkin = "";
            const nOccu = Global.CalcOriginalOccupationID(gameIns.gameState.roleData.Occupation);
            const aGradeVOs = tableMgr.gradeRewardTable.AllRows();
            this.mGradeDataList = [];
            let datGrade: GradeItemData = null;
            aGradeVOs.forEach(element => {
                if (element.Occupation === nOccu) {
                    datGrade = new GradeItemData();
                    datGrade.itemId = element.ID;
                    datGrade.needChangeLife = element.ToZhuanSheng;
                    datGrade.needLevel = element.ToLevel;
                    datGrade.douQi = element.MoJing;
                    datGrade.bindGold = element.BindMoney;
                    datGrade.goodsDataList = UIHelper.parseRewardGoodsList(element.GoodsIDs);
                    datGrade.state = RewardState.Invalid;
                    this.mGradeDataList.push(datGrade);
                }
            });
            // 事件监听
            gameEventBus.gradeRewardInfo.on(this, this.onUpdateUI);
            gameEventBus.gradeRewardGet.on(this, this.onGetRewardGoods);
        }

        /** @override */
        public destroy(destroyChild?: boolean) {
            gameEventBus.gradeRewardInfo.off(this, this.onUpdateUI);
            gameEventBus.gradeRewardGet.off(this, this.onGetRewardGoods);
            super.destroy(destroyChild);
        }

        /** @implements */
        public enterPart() {
            this._gradeList.scrollTo(0);
            Net.sendQueryUpLevelGiftFlagList();
        }

        /**
         * 界面更新
         * @param flags 奖励标识
         */
        private onUpdateUI(flags: number[]) {
            const nRoleLv = Global.GetUnionLevel();
            this.mGradeDataList.forEach(
                element => {
                    if (nRoleLv >= Global.GetUnionLevel(element.needChangeLife, element.needLevel)) {
                        const nFlag = this.getBitValue(flags, element.itemId * 2 + 1);
                        if (nFlag === 0) { // 可领取
                            element.state = RewardState.Can;
                        } else if (nFlag === 1) { // 已领取
                            element.state = RewardState.Had;
                        }
                    } else { // 未达成
                        element.state = RewardState.Not;
                    }
                }
            );
            this.sortListAndUpdateUI();
        }

        /**
         * 奖励列表排序并更新显示，已领取奖励的放到列表最后
         */
        private sortListAndUpdateUI() {
            this.mGradeDataList.sort(
                (a, b) => {
                    if (a.state === b.state) {
                        return a.itemId - b.itemId;
                    }
                    if (a.state === RewardState.Had) {
                        return 1;
                    } else if (b.state === RewardState.Had) {
                        return -1;
                    } else {
                        return a.itemId - b.itemId;
                    }
                }
            );
            this._gradeList.array = this.mGradeDataList;
        }

        /**
         * 领取等级奖励
         * @param nItemId 奖励Id
         */
        private onGetRewardGoods(nItemId: number) {
            const datItem = this.mGradeDataList.find(element => element.itemId === nItemId);
            datItem.state = RewardState.Had;
            this.sortListAndUpdateUI();
        }

        /**
         * 获取指定数字在二进制位上的值（0或1）
         * @param values 存储二进制数字的数组
         * @param whichOne 指定的数字
         */
        private getBitValue(values: number[], whichOne: number): number {
            const index = whichOne / 32 | 0;
            const bitIndex = whichOne % 32;
            if (values.length <= index) {
                return 0;
            }
            const value = values[index];
            if ((value & (1 << bitIndex)) !== 0) {
                return 1;
            }
            return 0;
        }
    }
}