namespace MyUI {
	import Handler = laya.utils.Handler;
	import Event = laya.events.Event;
	import Log = Global.Log;

	/**
	 * 角色项数据
	 */
	export class RoleSelectorItemData {
		/** 角色ID */
		roleID: number = 0;
		/** 角色名称 */
		roleName: string;
		/** 角色职业 */
		roleOccupation: EnumOccupation = EnumOccupation.Invalid;
		/** 角色性别 */
		roleSex: EnumSex = EnumSex.Invalid;
		/** 重生等级 */
		roleChangeLife: number = 0;
		/** 等级 */
		roleLevel: number = 0;
		/** 战斗力 */
		combatForce: number = 0;
		/** 角色删除剩余时间（单位：秒） */
		delRemainingSec: number = -1;
	}

	/**
	 * 角色列表数据
	 */
	export class RoleSelectorItemDataList {
		private m_lstDataRole: RoleSelectorItemData[]; // 角色列表数据
		private m_bUseGoodsDataInited: boolean = false; // 角色数据使用的道具数据是否已初始化
		private m_nLastEnterRoleID: number = 0; // 上次登录游戏的角色ID

		/** 获取角色列表数据 */
		public getRoleDataList(): RoleSelectorItemData[] { return this.m_lstDataRole; }

		/** 获取角色个数 */
		public getRoleCount(): number {
			if (this.m_lstDataRole) {
				return this.m_lstDataRole.length;
			}
			return 0;
		}

		/**
		 * 初始化角色列表数据
		 * @param sRoleList 角色列表数据字符串（服务器返回的字符串形式）
		 */
		public initRoleDataList(sRoleList: string) {
			this.m_lstDataRole = [];
			if (Global.String.IsNullOrWhiteSpace(sRoleList)) {
				return;
			}

			// 获取上次登录游戏的角色ID			
			const sRoleID = Laya.LocalStorage.getItem("lastEnterRoleID");
			if (!Global.String.IsNullOrWhiteSpace(sRoleID)) this.m_nLastEnterRoleID = parseInt(sRoleID);

			// 角色列表数据解析
			const aRoleList = sRoleList.split("|");
			for (let nIdx = 0; nIdx < aRoleList.length; nIdx++) {
				this.addRoleData(aRoleList[nIdx]);
			}
		}

		/**
		 * 请求角色使用的物品数据
		 */
		public requestRoleUseGoodsData() {
			if (!this.m_bUseGoodsDataInited) {
				for (let nIdx = 0; nIdx < this.m_lstDataRole.length; nIdx++) {
					const sCmdInfo = `${this.m_lstDataRole[nIdx].roleID}`;
					gameIns.sendStringToGS(EMessageType.CMD_SPR_GETROLEUSINGGOODSDATALIST, sCmdInfo);
				}
				this.m_bUseGoodsDataInited = true;
			}
		}

		/**
		 * 添加角色数据到角色列表
		 * @param sRole 角色数据字符串（服务器返回的字符串形式）
		 */
		public addRoleData(sRole: string): RoleSelectorItemData {
			const dtRole = RoleSelectorItemDataList.parseOneRoleData(sRole);
			if (dtRole) {
				if (dtRole.roleID === this.m_nLastEnterRoleID) this.m_lstDataRole.unshift(dtRole);
				else this.m_lstDataRole.push(dtRole);
			}
			return dtRole;
		}

		/**
		 * 删除角色数据
		 * @param nRoleID 角色ID
		 */
		public removeRoleData(nRoleID: number) {
			for (let nIdx = 0; nIdx < this.m_lstDataRole.length; nIdx++) {
				if (this.m_lstDataRole[nIdx].roleID === nRoleID) {
					this.m_lstDataRole.splice(nIdx, 1);
					break;
				}
			}
		}

		/**
		 * 更新角色删除剩余时间
		 * @param nRoleID 
		 * @param nDelRemainingSec 
		 */
		public updateDelRemainingSec(nRoleID: number, nDelRemainingSec: number) {
			for (let nIdx = 0; nIdx < this.m_lstDataRole.length; nIdx++) {
				if (this.m_lstDataRole[nIdx].roleID === nRoleID) {
					this.m_lstDataRole[nIdx].delRemainingSec = nDelRemainingSec;
					break;
				}
			}
		}

		/**
		 * 解析角色数据字符串
		 * @param sRole 角色数据字符串（服务器返回的字符串形式）
		 */
		public static parseOneRoleData(sRole: string): RoleSelectorItemData {
			if (Global.String.IsNullOrWhiteSpace(sRole)) {
				return null;
			}

			const aRole = sRole.split("$");
			// 角色数据校验
			Global.Log.Assert(aRole.length >= 6, "role data is error!!!");
			// 角色数据解析
			const dtRole = new RoleSelectorItemData();
			dtRole.roleID = parseInt(aRole[0]);
			dtRole.roleSex = parseInt(aRole[1]);
			dtRole.roleOccupation = parseInt(aRole[2]);
			dtRole.roleName = aRole[3];
			dtRole.roleLevel = parseInt(aRole[4]);
			dtRole.roleChangeLife = parseInt(aRole[5]);
			dtRole.combatForce = parseInt(aRole[6]);
			if (aRole.length > 7) {
				dtRole.delRemainingSec = parseInt(aRole[7]);
			}

			// // 请求角色正在使用的物品列表
			// let sCmdInfo = `${dtRole.roleID}`;
			// gameIns.sendStringToGS(EMessageType.CMD_SPR_GETROLEUSINGGOODSDATALIST, sCmdInfo);
			return dtRole;
		}

		public destroy() {
			if (this.m_lstDataRole) {
				this.m_lstDataRole.length = 0;
			}
			this.m_lstDataRole = null;
			this.m_nLastEnterRoleID = 0;
		}
	}

	/**
	 * 选择角色界面
	 */
	export class RoleSelectorView extends ui.login.RoleSelectorUI {
		private m_lstItemRole: MyUI.RoleSelectorItem[]; // 角色列表
		private m_itmSelected: RoleSelectorItem; // 当前选择的项
		private m_lstOccupationInfo: string[]; // 职业信息列表

		public readonly uiEventActorChanged = "eventActorChanged";  // 当选中的角色改变时,通过 event 发送

		constructor() {
			super();

			this.m_lstOccupationInfo = [
				ConfigLoca.UI_OCCUPATION_LongDan,
				ConfigLoca.UI_OCCUPATION_HuaLing,
				ConfigLoca.UI_OCCUPATION_QiaoGong,
				ConfigLoca.UI_OCCUPATION_LongDan_Desc,
				ConfigLoca.UI_OCCUPATION_HuaLing_Desc,
				ConfigLoca.UI_OCCUPATION_QiaoGong_Desc
			];

			// 角色列表
			this.m_lstItemRole = [this._itmRole0, this._itmRole1, this._itmRole2, this._itmRole3];
			for (const iterItm of this.m_lstItemRole) {
				iterItm.on(Event.CLICK, this, this.onItemRoleClick);
				iterItm.on("EvtDeleteRoleItem", this, this.onDeleteItemRole);
			}

			// 按钮监听
			this._btnEnter.clickHandler = new OpIntervalHandler(1000, this, this.onEnterButtonClick, undefined, false);
			this._btnReturn.clickHandler = new OpIntervalHandler(1000, this, this.onReturnButtonClick, undefined, false);
		}

		/**
		 * 更新列表显示
		 * @param selectedIndex 指定选中的角色
		 */
		public updateItemList(dtRoleDataList: RoleSelectorItemDataList, selectedIndex?: number) {
			const lstDataRole = dtRoleDataList.getRoleDataList();
			for (let nIdx = 0; nIdx < this.m_lstItemRole.length; nIdx++) {
				const itmRole = this.m_lstItemRole[nIdx];
				if (nIdx < lstDataRole.length) {
					itmRole.updateMe(lstDataRole[nIdx]);
				} else {
					itmRole.clearMe();
				}
			}

			// 有选中的更新选中的状态
			if (this.m_itmSelected && this.m_itmSelected.getRoleData()) {
				this.updateSelectedItem();
				return;
			}

			let focusIndex = 0;
			if (selectedIndex) {
				focusIndex = selectedIndex;
			}
			// 没有选中的，默认选中第一个
			const itmSelected = this.m_lstItemRole[focusIndex];
			const evt = new Event();
			evt.setTo(Event.CLICK, itmSelected, itmSelected);
			itmSelected.event(Event.CLICK, evt);
		}

		/**
		 * 角色条点击处理
		 * @param e 
		 */
		private onItemRoleClick(e: Event) {
			if (!e || !(e.target instanceof RoleSelectorItem)) {
				return;
			}
			if (this.m_itmSelected === e.target) {
				return;
			}

			const itmClick = <RoleSelectorItem>e.target;
			if (itmClick.getRoleID() === 0) { // 点击没有角色的条目，切换到创建角色
				this.event("EvtChangeToCreator");
				return;
			}

			if (this.m_itmSelected) {
				this.m_itmSelected.setSelected(false);
			}
			this.m_itmSelected = itmClick;
			this.m_itmSelected.setSelected(true);
			this.updateSelectedItem();

			// 更新职业描述文本显示
			const roleData = this.m_itmSelected.getRoleData();
			const nOccuID: number = roleData.roleOccupation;
			this._imgBadge.skin = Global.getLoginAtlasImgPath(`badge_${nOccuID}`);
			this._txtOccuName.text = this.m_lstOccupationInfo[nOccuID];
			this._txtOccuInfo.text = this.m_lstOccupationInfo[nOccuID + EnumOccupation.Max];

			// 发送选中角色改变事件
			this.event(this.uiEventActorChanged, roleData.roleID);
		}

		/**
		 * 更新选中状态
		 */
		private updateSelectedItem() {
			if (this.m_itmSelected) {
				const bDel = this.m_itmSelected.getRoleData().delRemainingSec > 0;
				this._txtDelRemainingSec.visible = bDel;
				this._btnEnter.visible = !bDel;
			}
		}

		/**
		 * 删除角色
		 * @param nRoleID 
		 */
		private onDeleteItemRole(nRoleID: number) {

			// TODO: 验证码输入窗口

			// 发送预删除角色消息
			const sCmdInfo = `${gameIns.gameState.UserId}:${nRoleID}`;
			gameIns.sendStringToGS(EMessageType.CMD_PREREMOVE_ROLE, sCmdInfo);
		}

		/**
		 * 进入游戏按钮点击处理
		 */
		private onEnterButtonClick() {
			if (!this.m_itmSelected || this.m_itmSelected.getRoleID() === 0) {
				Log.Error("haven't select role, please select one role!!!");
				return;
			}

			// 保存进入游戏的角色信息
			const dtRole = this.m_itmSelected.getRoleData();
			// gameIns.gameState.RoleID = dtRole.roleID;
			// gameIns.gameState.RoleSex = dtRole.roleSex;
			// gameIns.gameState.RoleName = dtRole.roleName;

			// TODO: 二级密码验证逻辑

			// 偿试进入游戏世界
			RoleSelectorView.enterGameWorld(dtRole.roleID, dtRole.roleSex, dtRole.roleName);
		}

		/**
		 * 偿试进入游戏世界
		 */
		public static async enterGameWorld(nRoleID: number, nRoleSex: number, sRoleName: string) {
			Global.ReEnterCheck.tryEnter(RoleSelectorView.enterGameWorld);

			gameIns.gameState.RoleID = nRoleID;
			gameIns.gameState.RoleSex = nRoleSex;
			gameIns.gameState.RoleName = sRoleName;

			// 发送初始化游戏消息
			uiMgr.showNetWaiting();
			const sUserID = gameIns.gameState.UserId;
			const nDeviceID = 0;
			const bYueYu = 0;
			// let sCmdMsg = `${sUserID}:${nRoleID}:${nDeviceID}:${bYueYu}`;
			const sCmdMsg = `${sUserID}:${nRoleID}::${Global.VersionInfo.versionDesc}`;
			gameIns.sendStringToGS(EMessageType.CMD_INIT_GAME, sCmdMsg);
			// 等待并解析初始化游戏消息
			const msgReader = await gameIns.WaitMessage(EMessageType.CMD_INIT_GAME);
			if (msgReader == null) {
				uiMgr.hideNetWaiting();
				uiMgr.hintText(Loca.getLang("452")); // 初始化游戏登陆数据时失败
				Global.ReEnterCheck.leave(RoleSelectorView.enterGameWorld);
				return;	// 不应该啊?网络断了?
			}

			const roleData = NetMsg.RoleData.decode(msgReader);
			if (!RoleSelectorView.onInitGame(roleData)) {
				uiMgr.hideNetWaiting();
				Global.ReEnterCheck.leave(RoleSelectorView.enterGameWorld);
				return;
			}

			// 同步时间
			await gameIns.TimeSynchronization();

			uiMgr.hideNetWaiting();

			// 记录上次进入游戏的角色ID
			Laya.LocalStorage.setItem("lastEnterRoleID", nRoleID.toString());

			// 进入游戏世界
			gameIns.ChangeToMode(EnumGameMode.Playing);

			Global.ReEnterCheck.leave(RoleSelectorView.enterGameWorld);
		}

		/**
         * 初始化游戏
         * @param dtRole 
         */
		private static onInitGame(roleData: NetMsg.RoleData): boolean {
			if (null == roleData) {
				uiMgr.hintText(Loca.getLang("452")); // 初始化游戏登陆数据时失败
				return false;
			}

			if (roleData.RoleID < 0) {  // 进入游戏失败了
				switch (roleData.RoleID) {
					case -10:
						uiMgr.hintText(Loca.getLang("1630")); // 你已经被游戏管理员禁止登陆
						break;
					case -20:
						{
							const sErrorMsg = Global.String.Format(Loca.getLang("5096"), Math.floor(roleData.BodyCode / 60));
							uiMgr.hintText(sErrorMsg); // 系统检测您的角色使用加速,已被系统封号, 离解封还剩余: {0} 分钟	
						}
						break;
					case -30:
						// TODO: 这块需要补充
						// if (SceneManager.GetActiveScene().name == "empty") {
						//     KuaFuLoginManager.ClearLoginInfo();
						//     ClosedBySDK();
						// } else { // 二级密码尚未验证
						//     uiMgr.hintText(ConfigLoca.UI_INIT_ROLE_SECOND_PWD_NOT_VERIFY);
						// }
						break;
					case -50:
						{
							const sErrorMsg = Global.String.Format(Loca.getLang("5097"), Math.floor(roleData.BodyCode / 60));
							uiMgr.hintText(sErrorMsg); // 系统检测您的角色使用外挂,已被系统封号, 离解封还剩余: {0} 分钟	
						}
						break;
					case -40:
						// TODO: 显示服务器同步需要等待时间的提示窗口
						// float startTime = Time.realtimeSinceStartup;
						// if (null != MainGame._current)
						//     MainGame._current.ShowStepServerTimeWaiting(roleData.BodyCode);
						break;
					case -80:
						{
							const sErrorMsg = Global.String.Format(Loca.getLang("5098"), Math.floor(roleData.BodyCode / 60));
							uiMgr.hintText(sErrorMsg); // 系统检测您的角色交易异常,已被系统封号, 离解封还剩余: {0} 分钟
						}
						break;
					default:    // 初始化游戏登陆数据时失败
						uiMgr.hintText(Loca.getLang("452")); // 初始化游戏登陆数据时失败
				}
				return false;
			}

			// 进入游戏世界成功,保存角色数据到全局变量
			let curFightHorseData: NetMsg.GoodsData = null;
			if (roleData.GoodsDataList != null) {
				const dtHorseImp = roleData.GoodsDataList.find(
					element => element.Using === 1 && tableMgr.goodsTable.getCategoriy(element.GoodsID) === ItemCategories.ShouHuChong
				);
				if (dtHorseImp) curFightHorseData = <NetMsg.GoodsData>dtHorseImp;
				if (curFightHorseData) {
					if (!Global.Data.equipPet) {
						Global.Data.equipPet = new Array<NetMsg.GoodsData>();
						Global.Data.equipPet.push(curFightHorseData);
					}
					const nDelIdx = roleData.GoodsDataList.indexOf(dtHorseImp);
					if (nDelIdx !== -1) {
						roleData.GoodsDataList.splice(nDelIdx, 1);
					}
				}
			}

			Logic.KuaFuLoginManager.OnChangeServerComplete();
			gameIns.gameState.roleData = roleData;
			// TODO:
			// Global.ClearFashionAndTitleData();
			// HuoDongCommonFlag.ClearStaticData();
			// Global.GetUsingGoodsDataList();

			// //加载系统设置
			// Global.LoadSystemSettings();
			// //加载挂机设置
			// Global.LoadAutoFightSettings();
			return true;
		}

		/**
		 * 返回按钮点击处理
		 */
		private onReturnButtonClick() {
			gameIns.ChangeToMode(EnumGameMode.Login);
		}

		public destroy(destroyChild?: boolean) {
			this.offAll();
			for (const iterItm of this.m_lstItemRole) {
				iterItm.destroy();
			}
			super.destroy(destroyChild);
		}
	}
}