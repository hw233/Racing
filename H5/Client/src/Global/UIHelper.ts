/// 这里放置界面逻辑相关的辅助函数
namespace UIHelper {
	/** 卓越名字列表 */
	export let ZuoyueTitleNames: string[] = ["优秀的", "完美的", "传说的"];

    /**
     * 判断任务等级和重生次数是否都满足条件
     * @param MinLevel 做这个任务需要的最低等级
     * @param minZhuanSheng 做这个任务需要的最低转生等级
     * @param strict 是否要求等级和重生级别都满足
     * @returns {} 
     */
	export function AvalidLevel(MinLevel: number, minZhuanSheng: number, strict: boolean = false): boolean {
		const roleData = gameIns.gameState.roleData;
		if (!roleData) {
			return false;
		}

		if (minZhuanSheng < 0) {
			minZhuanSheng = 0;
		}
		if (strict) {
			if (roleData.Level < MinLevel || roleData.ChangeLifeCount < minZhuanSheng) {
				return false;
			}
		} else {
			if (roleData.ChangeLifeCount < minZhuanSheng) {
				return false;
			} else if (roleData.ChangeLifeCount === minZhuanSheng && roleData.Level < MinLevel) {
				return false;
			}
		}

		return true;
	}

	/**
	 * 判断人物重生次数和等级是否满足条件,重生级别优先
	 * @param minLevel 等级范围最小值
	 * @param maxLevel 等级范围最大值
	 * @param minZhuanSheng 重生等级范围最小值
	 * @param maxZhuanSheng 重生等级范围最大值
	 * @returns 0=等级满足、-1=小于要求的等级范围、1=大于要求的等级范围
	 */
	export function AvalidLevel2(minLevel: number, maxLevel: number, minZhuanSheng: number, maxZhuanSheng: number): number {
		const roleData = gameIns.gameState.roleData;
		if (!roleData) {
			return -1;
		}

		Global.isNullOrUndefined(minLevel) ? minLevel = 0 : 0;
		Global.isNullOrUndefined(maxLevel) ? maxLevel = 0 : 0;
		Global.isNullOrUndefined(minZhuanSheng) ? minZhuanSheng = 0 : 0;
		Global.isNullOrUndefined(maxZhuanSheng) ? maxZhuanSheng = 0 : 0;
		minLevel = (minLevel === -1) ? (0) : (minLevel);
		maxLevel = (maxLevel === -1) ? (0xfff) : (maxLevel);
		minZhuanSheng = (minZhuanSheng === -1) ? (0) : (minZhuanSheng);
		maxZhuanSheng = (maxZhuanSheng === -1) ? (0xfff) : (maxZhuanSheng);
		const min = minLevel + minZhuanSheng * 0x10000;
		const max = maxLevel + maxZhuanSheng * 0x10000;
		const val = roleData.Level + roleData.ChangeLifeCount * 0x10000;
		if (min <= val && val <= max) {
			return 0;
		} else if (val < min) {
			return -1;
		} else {
			return 1;
		}
	}

    /**
     * 格式化限制等级条件字符串
     * @param minLevel 最低等级限制
     * @param minZhuanSheng 最低重生限制
     */
	export function FormatLevelLimit(minLevel: number, minZhuanSheng: number): string {
		if (minZhuanSheng > 0) {
			return Global.String.Format(ConfigLoca.UI_Role_Level_With_ChangeLife, minZhuanSheng, minLevel); // {0}重{1}级
		} else {
			return Global.String.Format(ConfigLoca.UI_Role_Level_Only_Level, minLevel); // {0}级
		}
	}
	/**
	 * 格式化时间(时、分、秒)
	 * @param secs 秒
	 * @param def 特殊符号
	 */
	export function FormatSecs(secs: number, def: string = "-"): string {
		if (secs < 0) {
			return def;
		}
		const hour = Math.floor(secs / 3600);
		const minute = Math.floor((secs % 3600) / 60);
		const second = secs % 60;
		if (hour > 0) {
			return Global.String.Format(Loca.getLang("{0:00}时{1}分{2}秒"), hour, Global.String.FormatStr("00", minute.toString()), Global.String.Format("00", second));
		}
		else if (minute > 0) {
			return Global.String.FormatStr("00", minute.toString()) + Loca.getLang("166") + Global.String.FormatStr("00", second.toString()) + Loca.getLang("89");
		}
		else {
			return Global.String.FormatStr("00", second.toString()) + Loca.getLang("89");
		}
	}
    /**
     * 显示功能未开启的标准提示
     * @param id 功能ID
     * @param trigger 
     * @param param1 
     * @param param2 
     * @param hint 
     */
	export function HintGongNengOpenCondition(id: GongNengIDs, trigger: number, param1: number, param2: number, hint: boolean = true): string {
		let msg = "";
		if (trigger === 7) {
			const taskVO = tableMgr.tasksTable.getTaskVo(param1);
			if (taskVO) {
				if (Global.GetUnionLevel(taskVO.MinZhuanSheng, taskVO.MinLevel) > 0) {
					msg = Global.String.Format(Loca.getLang("需要完成{0}重{1}级的【{2}】主线任务才可开启{3}系统"), taskVO.MinZhuanSheng, taskVO.MinLevel, Loca.getLang(taskVO.Title), GongnengYugaoMgr.GetGongNengName(id));
				} else {
					msg = Global.String.Format(Loca.getLang("需要完成【{2}】主线任务才可开启{3}系统"), taskVO.MinZhuanSheng, taskVO.MinLevel, Loca.getLang(taskVO.Title), GongnengYugaoMgr.GetGongNengName(id));
				}
			} else {
				msg = Global.String.Format(Loca.getLang("完成【{0}】主线任务可开启该系统"), param1);
			}
		} else if (14 === trigger) {
			msg = Global.String.Format(Loca.getLang("翅膀达到【{0}】阶可开启{1}系统"), param1, GongnengYugaoMgr.GetGongNengName(id));
		} else if (trigger === <number>SystemHelpModes.ChengJiuLv) {
			msg = Global.String.Format(Loca.getLang("头衔达到【{0}】级可开启{1}系统"), param1, GongnengYugaoMgr.GetGongNengName(id));
		} else if (20 === trigger) {
			msg = Global.String.Format(Loca.getLang("帮会等级达到【{0}】级可开启{1}系统"), param1, GongnengYugaoMgr.GetGongNengName(id));
		} else if (16 === trigger) {
			msg = Global.String.Format(Loca.getLang("军衔达到【{0}】级可开启{1}系统"), param1, GongnengYugaoMgr.GetGongNengName(id));
		} else {
			msg = Global.String.Format(Loca.getLang("达到【{0}】可开启{1}系统"), UIHelper.FormatLevelLimit(param2, param1), GongnengYugaoMgr.GetGongNengName(id));
		}
		if (hint) {
			uiMgr.hintText(msg);
		}
		return msg;
	}

	/**
	 * 获取奖励名称
	 * @param awardType 奖励类型
	 * @param nameType 显示名称类型 0=文字、1=图标
	 */
	export function getAwardsName(awardType: AwardsTypes, nameType: number = 0) {
		let awardName = null;
		switch (awardType) {
			case AwardsTypes.Exp:
				awardName = ConfigLoca.UI_AWARDS_TYPE_Awards + ConfigLoca.UI_AWARDS_TYPE_JINGYAN + ":";
				break;
			case AwardsTypes.JinBi:
				awardName = ConfigLoca.UI_AWARDS_TYPE_Awards + ConfigLoca.UI_MONEY_TYPE_GOLD + ":";
				break;
			case AwardsTypes.BindJinBi:
				awardName = ConfigLoca.UI_MONEY_TYPE_BINDING_GOLD + ":";
				break;
			case AwardsTypes.ZuanShi:
				awardName = ConfigLoca.UI_AWARDS_TYPE_Awards + ConfigLoca.UI_MONEY_TYPE_DIAMOND + ":";
				break;
			case AwardsTypes.BindZuanShi:
				awardName = ConfigLoca.UI_MONEY_TYPE_BINDING_DIAMOND + ":";
				break;
			case AwardsTypes.MoJing:
				awardName = ConfigLoca.UI_AWARDS_TYPE_Awards + ConfigLoca.UI_MONEY_TYPE_DOUQI + ":";
				break;
			case AwardsTypes.ShengWang:
				awardName = ConfigLoca.UI_AWARDS_TYPE_Awards + ConfigLoca.UI_MONEY_TYPE_SHENGWANG + ":";
				break;
			case AwardsTypes.ZhanGong:
				awardName = ConfigLoca.UI_AWARDS_TYPE_Awards + ConfigLoca.UI_MONEY_TYPE_BANGGONG + ":";
				break;
			case AwardsTypes.ChengJiu:
				awardName = ConfigLoca.UI_AWARDS_TYPE_Awards + ConfigLoca.UI_MONEY_TYPE_CHENGHJIU + ":";
				break;
			case AwardsTypes.XingHun:
				awardName = ConfigLoca.UI_AWARDS_TYPE_Awards + ConfigLoca.UI_MONEY_TYPE_XINGHUN + ":";
				break;
			case AwardsTypes.FenMo:
				awardName = ConfigLoca.UI_AWARDS_TYPE_Awards + ConfigLoca.UI_MONEY_TYPE_FENMO + ":";
				break;
			case AwardsTypes.CangBaoXueZuan:
				awardName = ConfigLoca.UI_AWARDS_TYPE_Awards + ConfigLoca.UI_MONEY_TYPE_XUEZUAN + ":";
				break;
			case AwardsTypes.CangBaoJiFen:
				awardName = ConfigLoca.UI_AWARDS_TYPE_Awards + ConfigLoca.UI_MONEY_TYPE_JiFen + ":";
				break;
		}
		return awardName;
	}

	/**
	 * 添加奖励文本信息
	 * @param taskAwards 
	 * @param prefab 
	 * @returns {} 
	 */
	export function addAwardData(taskAwards: NetMsg.ITaskAwardsData, prefab: string = "CTextAwards"): Map<AwardsTypes, number> {

		const map = new Map<AwardsTypes, number>();
		if (null == taskAwards) {
			return map;
		}

		let type: number = 0;
		if (prefab === "CTextAwards2") {
			type = 1;
		}

		if (taskAwards.Experienceaward > 0) { // 经验
			map.set(AwardsTypes.Exp, Number(taskAwards.Experienceaward));
		}

		if (taskAwards.Moneyaward > 0) { // 绑定金币
			map.set(AwardsTypes.BindJinBi, taskAwards.Moneyaward);
		}

		if (taskAwards.YinLiangaward > 0) { // 银两
			map.set(AwardsTypes.JinBi, taskAwards.YinLiangaward);
		}

		if (taskAwards.BindYuanBaoaward > 0) { // 绑定钻石
			map.set(AwardsTypes.BindZuanShi, taskAwards.BindYuanBaoaward);
		}

		if (taskAwards.ZhenQiaward > 0) { // 真气
			map.set(AwardsTypes.ZhenQi, taskAwards.ZhenQiaward);
		}

		if (taskAwards.LieShaaward > 0) { // 猎杀值
			map.set(AwardsTypes.None, taskAwards.LieShaaward);
		}

		if (taskAwards.WuXingaward > 0) { // 悟性
			map.set(AwardsTypes.None, taskAwards.WuXingaward);
		}

		if (taskAwards.JunGongaward > 0) { // 帮贡
			map.set(AwardsTypes.ZhanGong, taskAwards.JunGongaward);
		}

		if (taskAwards.RongYuaward > 0) { // 荣誉
			map.set(AwardsTypes.ChengJiu, taskAwards.RongYuaward);
		}

		if (taskAwards.MoJingaward > 0) { // 斗气
			map.set(AwardsTypes.MoJing, taskAwards.MoJingaward);
		}

		if (taskAwards.XingHunaward > 0) { // 星魂
			map.set(AwardsTypes.XingHun, taskAwards.XingHunaward);
		}

		if (taskAwards.FenMoAward > 0) { // 粉末
			map.set(AwardsTypes.FenMo, taskAwards.FenMoAward);
		}

		if (taskAwards.ShengwangAward > 0) { // 声望
			map.set(AwardsTypes.ShengWang, taskAwards.ShengwangAward);
		}

		return map;

	}

	/**
	 * 解析奖励字符串,返回物品列表
	 * @param goodsListStr 奖励字符串
	 * @param index 从第几个开始，默认从0开始
	 * @param count 最大返回几个物品
	 */
	export function parseRewardGoodsList(goodsListStr: string, index: number = 0, count: number = Number.MAX_VALUE): NetMsg.GoodsData[] {
		const goodsList = new Array<NetMsg.GoodsData>();
		if (Global.String.IsNullOrWhiteSpace(goodsListStr)) {
			return goodsList;
		}
		let i = 0;
		const ids = goodsListStr.split("|");
		for (let j = 0; j < ids.length; ++j) {
			const dataStr = ids[i];
			if (Global.String.IsNullOrWhiteSpace(dataStr)) {
				continue;
			}
			if (i++ < index) {
				continue;
			}

			const goodsData = new NetMsg.GoodsData();
			const dataArr = dataStr.split(",");
			const paramCount = dataArr.length;
			goodsData.GoodsID = parseInt(dataArr[0]);
			if (paramCount >= 2) {
				goodsData.GCount = parseInt(dataArr[1]);
			}
			if (paramCount >= 3) {
				goodsData.Binding = parseInt(dataArr[2]);
			}
			if (paramCount >= 4) {
				goodsData.ForgeLevel = parseInt(dataArr[3]);
			}
			if (paramCount >= 5) {
				goodsData.AppendPropLev = parseInt(dataArr[4]);
			}
			if (paramCount >= 6) {
				goodsData.Lucky = parseInt(dataArr[5]);
			}
			if (paramCount >= 7) {
				goodsData.ExcellenceInfo = parseInt(dataArr[6]);
			}
			goodsList.push(goodsData);
			if (i >= index + count) {
				break;
			}
		}
		return goodsList;
	}
	/**
		 * 提示获得物品消息
		 * @param goodsData   物品Data
		 * @param goodsCount 物品数量
		 * @param hint              是否在聊天里显示
		 */
	export function hintNewGoodsText(goodsData: NetMsg.IGoodsData, goodsCount: number, hint: number = 0) {
		const goodsName = UIHelper.formatGoodsName(goodsData, true, false, goodsCount);
		let msg = Global.String.Format(ConfigLoca.UI_COMMON_GetGoodsX, goodsName);
		msg = Global.GetColorStringForNGUIText(MyUI.ColorCode.yellow, msg);
		uiMgr.hintHtmlText(msg);
	}
	/**
	 * 得到物品名称
	 * @param goodsData  物品Data
	 * @param isShowCount  是否显示物品数量
	 * @param isShowAllName  是否显示物品全称
	 * @param nExCnt  物品数量
	 * @param callBack  回调函数
	 */
	export function formatGoodsName(goodsData: NetMsg.IGoodsData, isShowCount: boolean, isShowAllName: boolean, nExCnt: number, callBack: Function = null) {
		let nameStr = "";
		let fontColor = MyUI.ColorCode.zhuoYue0;

		const goodVo = tableMgr.goodsTable.Find(goodsData.GoodsID);
		if (goodVo === null) {
			if (callBack !== null) {
				callBack(fontColor);
			}
			return "";
		}
		// 获得物品属性条数
		const zhuoyueNum = Global.GetZhuoyueAttributeCount(goodsData.ExcellenceInfo);
		if ((ItemCategories.MengChongWu === goodVo.Categoriy) || (ItemCategories.ChongWu === goodVo.Categoriy) || (ItemCategories.ShouHuChong === goodVo.Categoriy)) {
			if (0 !== goodsData.ExcellenceInfo) {
				fontColor = MyUI.ColorCode.zhuoYue3;
			}
			else if (1 === goodVo.SuitID) {
				fontColor = MyUI.ColorCode.zhuoYue2;
			}
			else {
				fontColor = MyUI.ColorCode.zhuoYue3;
			}
		}
		else if (goodVo.Categoriy >= 0 && goodVo.Categoriy < (ItemCategories.EquipMax)) {
			if (goodVo.Categoriy === (ItemCategories.Fashion)) {
				// 时装单独判断，不走装备的各种条件判断
				if (goodVo.ItemQuality === GoodsQuality.FlashPurple)
					fontColor = MyUI.ColorCode.zhuoYue3;
			}
			else {
				if ((zhuoyueNum > 0) && (zhuoyueNum <= 1)) {
					fontColor = MyUI.ColorCode.zhuoYue1;
					nameStr += UIHelper.ZuoyueTitleNames[0];
				}
				else if ((zhuoyueNum >= 2) && (zhuoyueNum <= 3)) {
					fontColor = MyUI.ColorCode.zhuoYue2;
					nameStr += UIHelper.ZuoyueTitleNames[1];
				}
				else if ((zhuoyueNum >= 4) && (zhuoyueNum <= 6)) {
					fontColor = MyUI.ColorCode.zhuoYue3;
					nameStr += UIHelper.ZuoyueTitleNames[2];
				}
			}
		}
		else {
			fontColor = goodVo.GoodsColor;
		}

		nameStr += Loca.getLang(goodVo.Title);
		if ((ItemCategories.ShouHuChong === goodVo.Categoriy) || (ItemCategories.ChongWu === goodVo.Categoriy) || (ItemCategories.MengChongWu === goodVo.Categoriy)) {
			if (zhuoyueNum === 0) {
				fontColor = goodVo.GoodsColor;
			}

			const sName = Loca.getLang(goodVo.Title);
			// TODO:萌宠相关，暂没有
			// if (Global.Data.roleData.MengchongNameList.ContainsKey(goodsData.Id)) {
			// 	sName = Global.Data.roleData.MengchongNameList[goodsData.Id];
			// }
			nameStr = sName;
		}

		if (isShowCount) {
			if (nExCnt === -1) {
				nExCnt = goodsData.GCount;
			}
			nameStr = Global.String.Format("{0}x{1}", nameStr, nExCnt);
		}
		else if (isShowAllName || goodVo.Categoriy === ItemCategories.JieHunJieZhi) {
			if ((ItemCategories.ShouHuChong !== goodVo.Categoriy) && (ItemCategories.ChongWu !== goodVo.Categoriy) && (ItemCategories.MengChongWu !== goodVo.Categoriy)
				&& (ItemCategories.Decoration !== goodVo.Categoriy) && (ItemCategories.Fashion !== goodVo.Categoriy)) {
				const str1 = goodsData.ForgeLevel > 0 ? Global.String.Format("+{0}", goodsData.ForgeLevel) : "";
				const str2 = goodsData.AppendPropLev > 0 ? Global.String.Format(ConfigLoca.UI_COMMON_FuX, goodsData.AppendPropLev) : "";
				nameStr = Global.String.Format("{0} {1}{2}", nameStr, str1, str2);
			}
		}
		if (callBack != null) {
			callBack(fontColor);
		}
		nameStr = Global.GetColorStringForNGUIText(fontColor, nameStr);
		return nameStr;
	}
	/**
	 * 成生一个GoodsIcon的列表
	 * @param list list容器
	 * @param goodsIdList 物品列表 
	 * @param scale 比例
	 * @param repeatX 横向数量
	 * @param repeatY 纵向数量
	 * @param repeatXSpacing 横向间距
	 * @param repeatYSpacing 纵向间距
	 */
	export function createGoodsList(list: Laya.List, goodsIdList: string[], scale: number = 1, repeatX: number = 1, repeatY: number = 1, repeatXSpacing: number = 5, repeatYSpacing: number = 5): void {
		// list.itemRender = itemRender;
		// list列数
		list.repeatX = repeatX;
		// list行数
		list.repeatY = repeatY;
		let goodsId = 0;
		let goodsList = null;
		let goodsIndex = 0;
		goodsIdList.forEach((goodsStr) => {
			goodsList = goodsStr.split(",");
			goodsId = parseInt(goodsList[0]);
			const goodIcon = new MyUI.GoodsIcon();
			const goodsVo = tableMgr.goodsTable.Find(goodsId);
			const goodData = Global.GetDummyGoodsDataMu(goodsId, parseInt(goodsList[3]), parseInt(goodsList[4]), parseInt(goodsList[6]), parseInt(goodsList[5]), parseInt(goodsList[2]), parseInt(goodsList[1]));
			// 筛选本职业装备与非装备道具
			const isEquip = Global.goodsIsEquip(goodsId);
			if (!isEquip || (isEquip && goodsVo.MainOccupation === gameIns.gameState.roleData.Occupation)) {
				goodIcon.scaleX = goodIcon.scaleY = scale;
				if (repeatX > 1) {
					goodIcon.x = goodsIndex * (goodIcon.width + repeatXSpacing);
				}
				if (repeatY > 1) {
					goodIcon.y = goodsIndex * (goodIcon.height + repeatYSpacing);
				}
				goodIcon.updateByGoodsData(goodData);
				// goodIcon.updateByGoodsID(goodsId); 
				list.addChild(goodIcon);
				goodsIndex++;
			}
		});
	}
}