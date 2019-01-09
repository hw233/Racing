var MyUI;
(function (MyUI) {
    /** GoodsIcon作为ItemRender时的数据源 */
    class GoodsIconDataSource {
        constructor() {
            /** 道具的DBID */
            this.dbID = 0;
            /** 开启状态 */
            this.iconState = IconState.Invalid;
        }
        /** 道具数据 */
        get goodsData() { return this._goodsData; }
        set goodsData(value) {
            this._goodsData = value;
            if (value)
                this.dbID = value.Id;
            else
                this.dbID = 0;
        }
    }
    MyUI.GoodsIconDataSource = GoodsIconDataSource;
    /** 格子状态 */
    let IconState;
    (function (IconState) {
        /** 无效值 */
        IconState[IconState["Invalid"] = 0] = "Invalid";
        /** 已开启（格子已解锁） */
        IconState[IconState["Unlocked"] = 1] = "Unlocked";
        /** 开启中（格子正在解锁） */
        IconState[IconState["Opening"] = 2] = "Opening";
        /** 未开启（格子未解锁） */
        IconState[IconState["Locked"] = 3] = "Locked";
        /** 不可用（道具不可使用） */
        IconState[IconState["CannotUse"] = 4] = "CannotUse";
    })(IconState = MyUI.IconState || (MyUI.IconState = {}));
    /**
     * 道具图标类
     * <p>
     * 注意：该道具图标可以作为List的ItemRender（自渲染）使用，
     * 因此，如果作为ItemRender使用，则只能通过dataSource更新显示，
     * 不能使用updateByGoodsData、updateByGoodsID和updateByGoodsVO更新。
     * 同理，如果不作为ItemRender使用时可以用三个update方法更新该道具图标。
     * </p>
     *
     */
    class GoodsIcon extends ui.Components.GoodsIconUI {
        constructor() {
            super();
            this.m_textType = IconTextTypes.Qianghua; // 文本显示类型
            this.m_ownerType = GoodsOwnerTypes.SysGifts; // 道具所属类型
            this.clearMe();
            this.on(Laya.Event.CLICK, this, this.onGoodsIconClick);
        }
        destroy(destroyChild) {
            this.off(Laya.Event.CLICK, this, this.onGoodsIconClick);
            if (this.iconClickHandler) {
                this.iconClickHandler.clear();
            }
            this.clearMe();
            super.destroy(destroyChild);
            this.iconClickHandler = null;
        }
        /**
         * 道具图标点击处理
         * @param e
         */
        onGoodsIconClick(e) {
            if (!this.m_voGoods) {
                return;
            }
            if (this.iconClickHandler) {
                this.iconClickHandler.run();
            }
            else {
                let dtGoods = this.m_dtGoods;
                if (!dtGoods) {
                    dtGoods = Global.GetDummyGoodsData(this.m_voGoods.ID);
                }
                MyUI.GTipServiceEx.ShowTip(this, TipTypes.GoodsText, this.m_ownerType, dtGoods);
            }
        }
        /** 获取道具数据 */
        get goodsData() { return this.m_dtGoods; }
        /** 获取道具VO */
        get goodsVO() { return this.m_voGoods; }
        /** 文本显示类型 */
        set textType(value) { this.m_textType = value; }
        /** 道具所属类型 */
        set ownerType(value) { this.m_ownerType = value; }
        /** 道具绑定状态(一些需要手动设置道具，如商城里) */
        set isBinding(value) { this._imgBinding.visible = value; }
        /**
         * 清空图标显示
         */
        clearMe() {
            // 清空显示
            this._imgIcon.skin = null;
            this._imgQuality.skin = null;
            this._imgState.skin = null;
            this._imgTime.visible = false;
            this._imgBinding.visible = false;
            this._imgComparison.visible = false;
            this._txtContent.changeText("");
            this._txtCount.changeText("");
            // 清空数据
            this._dataSource = null;
            this.m_dtGoods = null;
            this.m_voGoods = null;
            this.m_textType = IconTextTypes.Qianghua;
        }
        /** 设置/获取该GoodsIcon作为ItemRender时的数据源 */
        get dataSource() {
            return this._dataSource;
        }
        set dataSource(value) {
            this._dataSource = value;
            if (!value) {
                this.clearMe();
                return;
            }
            if (value instanceof GoodsIconDataSource) {
                if (value.goodsData) {
                    this._updateByGoodsData(value.goodsData);
                }
                else {
                    this.clearMe();
                    this._updateLockedState(value.iconState);
                }
            }
            else if (value instanceof NetMsg.GoodsData) {
                this._updateByGoodsData(value);
            }
            else if ((typeof value === "number") && Math.floor(value) === value) {
                const voGoods = tableMgr.goodsTable.Find(value);
                this._updateByGoodsVO(voGoods);
            }
        }
        /**
         * 根据道具数据更新
         * @param dtGoods 道具数据
         */
        updateByGoodsData(dtGoods) {
            this._dataSource = null;
            this._updateByGoodsData(dtGoods);
        }
        /**
         * 根据道具数据实际更新道具显示（private）
         * @param dtGoods 道具数据
         */
        _updateByGoodsData(dtGoods) {
            this.m_dtGoods = dtGoods;
            let voGoods = null;
            if (dtGoods) {
                voGoods = tableMgr.goodsTable.Find(dtGoods.GoodsID);
                Global.Log.Assert(voGoods != null, `can't find goodsVO!!! (goodsID = ${dtGoods.GoodsID})`);
            }
            this.m_voGoods = voGoods;
            if (dtGoods) {
                this._updateUI();
            }
            else {
                this.clearMe();
            }
        }
        /**
         * 根据道具ID更新
         * @param goodsID 道具ID
         */
        updateByGoodsID(goodsID) {
            const voGoods = tableMgr.goodsTable.Find(goodsID);
            Global.Log.Assert(voGoods != null, `can't find goodsVO!!! (goodsID = ${goodsID})`);
            this.updateByGoodsVO(voGoods);
        }
        /**
         * 根据道具VO更新
         * @param voGoods 道具VO
         */
        updateByGoodsVO(voGoods) {
            this._dataSource = null;
            this.m_dtGoods = null;
            this._updateByGoodsVO(voGoods);
        }
        /**
         * 根据道具VO实际更新（private）
         * @param voGoods 道具VO
         */
        _updateByGoodsVO(voGoods) {
            this.m_voGoods = voGoods;
            if (voGoods) {
                this._updateUI();
            }
            else {
                this.clearMe();
            }
        }
        /**
         * 更新图标显示
         */
        _updateUI() {
            this._imgIcon.skin = Global.getGoodsIconPath(this.m_voGoods.IconCode);
            if (this.m_dtGoods) {
                this._imgTime.visible = Global.IsTimeLimitGoods(this.goodsData);
                this._imgBinding.visible = this.m_dtGoods.Binding > 0;
                this._imgComparison.visible = false; // TODO: 对比箭头更新
            }
            else {
                this._imgTime.visible = false;
                this._imgBinding.visible = false;
                this._imgComparison.visible = false;
            }
            this._updateIconQuality();
            this._updateIconState();
            this._updateIconText();
        }
        /**
         * 更新品质框显示
         */
        _updateIconQuality() {
            if (!this.m_dtGoods) {
                this._imgQuality.skin = Global.getGoodsQualityPath(this.m_voGoods.ItemQuality);
                return;
            }
            if (ItemCategories.ShouHuChong === this.m_voGoods.Categoriy || ItemCategories.ChongWu === this.m_voGoods.Categoriy
                || ItemCategories.MengChongWu === this.m_voGoods.Categoriy) {
                if (0 !== this.m_dtGoods.ExcellenceInfo) {
                    this._imgQuality.skin = Global.getGoodsQualityPath(GoodsQuality.Purple);
                }
                else if (1 === this.m_voGoods.SuitID) {
                    this._imgQuality.skin = Global.getGoodsQualityPath(GoodsQuality.Blue);
                }
                else {
                    this._imgQuality.skin = Global.getGoodsQualityPath(GoodsQuality.Purple);
                }
            }
            else if (ItemCategories.MonsterSoul === this.m_voGoods.Categoriy) {
                this._imgQuality.skin = Global.getGoodsQualityPath(this.m_voGoods.ItemQuality, true);
            }
            else if (this.m_dtGoods.ExcellenceInfo > 0) {
                if (Global.GetZhuoyueAttributeCount(this.m_dtGoods.ExcellenceInfo) >= 6) { // 拥有6条卓越属性即为全属装备
                    this._imgQuality.skin = Global.getGoodsQualityPath(GoodsQuality.Purple);
                }
                else {
                    if (Global.GetZhuoyueAttributeCount(this.m_dtGoods.ExcellenceInfo) < 3) {
                        this._imgQuality.skin = Global.getGoodsQualityPath(GoodsQuality.Green);
                    }
                    else if (Global.GetZhuoyueAttributeCount(this.m_dtGoods.ExcellenceInfo) >= 3 && (Global.GetZhuoyueAttributeCount(this.m_dtGoods.ExcellenceInfo) < 5)) {
                        this._imgQuality.skin = Global.getGoodsQualityPath(GoodsQuality.Blue);
                    }
                    else if (Global.GetZhuoyueAttributeCount(this.m_dtGoods.ExcellenceInfo) === 5) {
                        this._imgQuality.skin = Global.getGoodsQualityPath(GoodsQuality.Purple);
                    }
                }
            }
            else {
                this._imgQuality.skin = Global.getGoodsQualityPath(this.m_voGoods.ItemQuality);
            }
        }
        /**
         * 更新道具可用状态
         */
        _updateIconState() {
            let sPath = null;
            if (this.m_voGoods) {
                if (!Global.CanUseGoods(this.m_voGoods.ID, false, true, false)) {
                    sPath = "icon_state_cannot"; // 职业不符合
                }
                else if (!Global.CanUseGoodsAttr(this.m_voGoods.ID, false)) {
                    sPath = "icon_state_cannot"; // 属性未达到要求
                }
            }
            if (sPath)
                sPath = Global.getCommonAtlasImgPath(sPath);
            this._imgState.skin = sPath;
        }
        /**
         * 更新格子锁定状态
         */
        _updateLockedState(nState) {
            let sPath = null;
            if (nState === IconState.Opening)
                sPath = "icon_state_opening";
            else if (nState === IconState.Locked)
                sPath = "icon_state_lock";
            if (sPath) {
                sPath = Global.getCommonAtlasImgPath(sPath);
                this._imgState.skin = sPath;
            }
        }
        /**
         * 更新文本显示
         */
        _updateIconText() {
            this._txtContent.changeText("");
            this._txtCount.changeText((this.m_dtGoods && this.m_dtGoods.GCount > 1) ? this.m_dtGoods.GCount.toString() : "");
            if (this.m_dtGoods && this.m_voGoods.Categoriy >= ItemCategories.TouKui && this.m_voGoods.Categoriy < ItemCategories.EquipMax) {
                if (IconTextTypes.Qianghua === this.m_textType) {
                    if (ItemCategories.ShouHuChong === this.m_voGoods.Categoriy || ItemCategories.MengChongWu === this.m_voGoods.Categoriy
                        || ItemCategories.ChongWu === this.m_voGoods.Categoriy) {
                        if ((this.m_dtGoods.ForgeLevel > 1)) {
                            if (ItemCategories.MengChongWu === this.m_voGoods.Categoriy) {
                                // TODO: 萌宠表数据
                                // if (ConfigMengchong.bIsLevelMax(this.m_dtGoods.ForgeLevel))
                                // 	this._txtContent.text = "Max";
                                // else
                                this._txtContent.text = `Lv${this.m_dtGoods.ForgeLevel}`;
                            }
                            else {
                                this._txtContent.text = `Lv${this.m_dtGoods.ForgeLevel + 1}`;
                            }
                        }
                    }
                    else {
                        this._txtContent.text = this.m_dtGoods.ForgeLevel > 0 ? `+${this.m_dtGoods.ForgeLevel}` : "";
                    }
                }
                else if (IconTextTypes.Zhuijia === this.m_textType) {
                    this._txtContent.text = this.m_dtGoods.AppendPropLev > 0 ? Global.String.Format(Loca.getLang("附{0}"), this.m_dtGoods.AppendPropLev) : "";
                }
                else if (IconTextTypes.Zhuansheng === this.m_textType) {
                    this._txtContent.text = this.m_dtGoods.ChangeLifeLevForEquip > 0 ? Global.String.Format(Loca.getLang("{0}重"), this.m_dtGoods.ChangeLifeLevForEquip) : "";
                }
                //#region 时装特殊处理
                if (ItemCategories.Fashion === this.m_voGoods.Categoriy) {
                    this._txtContent.text = this.m_dtGoods.ForgeLevel > 0 ? `+${this.m_dtGoods.ForgeLevel}` : "";
                }
                //#endregion 时装特殊处理
            }
            if (this._txtContent.text !== "")
                return;
            let aExec = null;
            if (this.m_voGoods.ExecMagic)
                aExec = this.m_voGoods.ExecMagic.split(/[()]/);
            if (!aExec || aExec.length < 2)
                return;
            const sKey = aExec[0], sVal = aExec[1];
            switch (sKey) {
                case "NEW_ADD_YINLIANG": // 金币
                case "NEW_ADD_MONEY": // 绑金
                case "ADD_DJ": // 钻石
                case "ADD_BINDYUANBAO": // 绑钻
                case "ADD_XINGHUN": // 星魂
                case "NEW_PACK_JINGYUAN": // 斗气
                case "NEW_ADD_CHENGJIU": // 成就
                case "ADD_SHENGWANG": // 声望
                case "ADD_VIPEXP": // VIP
                case "ADDYSFM": // 元素粉末
                case "ADD_LINGJING": // 兽魂
                case "ADD_BANGGONG": // 帮贡
                case "ADD_LANGHUN": // 狼魂粉末
                case "ADD_ZAIZAO": // 再造点数
                    this._txtContent.changeText(sVal);
                    break;
                case "DYNAMIC_COUNT": // 动态数量
                    if (this.m_dtGoods && this.m_dtGoods.GCount > 1) {
                        this._txtContent.changeText(this.m_dtGoods.GCount.toString());
                    }
                    break;
            }
        }
        /**
         * 更新内容文本框的显示
         * @param value 显示内容
         */
        updateTxtContent(value) {
            this._txtContent.changeText(value);
        }
    }
    MyUI.GoodsIcon = GoodsIcon;
})(MyUI || (MyUI = {}));
//# sourceMappingURL=GoodsIcon.js.map