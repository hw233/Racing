﻿namespace Logic {

    type CellCoord = number;

    /**
     * 地图格子中的对象个数窗口
     */
    class MapGridSpriteNum {
        // 总的个数
        public TotalNum: number = 0;

        // 角色对象的个数
        public RoleNum: number = 0;

        // 怪物对象的个数
        public MonsterNum: number = 0;

        // NPC对象的个数
        public NPCNum: number = 0;

        // 镖车对象个数
        public BiaoCheNum: number = 0;

        // 战旗对象个数
        public JunQiNum: number = 0;

        // 包裹对象个数
        public GoodsPackNum: number = 0;

        // 特效对象个数
        public DecoNum: number = 0;
    }

    /**
     * 管理地图上对象的移动
     */
    export class MapGrid {
        private _MapData: GMapData = null;  // 对应地图的模板数据
        private MapCode: number;            // 地图编号
        private MapWidth: number;           // 地图宽度
        private MapHeight: number;          // 地图高度
        private _MapGridWidth: number;      // 地图的格子的宽度
        /** 地图的格子的宽度 */
        public get MapGridWidth() {
            return this._MapGridWidth;
        }

        private _MapGridHeight: number;     // 地图的格子的高度

        // 地图的格子的高度
        public get MapGridHeight() {
            return this._MapGridHeight;
        }

        private _MapGridXNum = 0;           // X方向格子的总数

        // X方向格子的总数
        public get MapGridXNum() {
            return this._MapGridXNum;
        }

        private _MapGridYNum = 0;           // Y方向格子的总数

        // Y方向格子的总数
        public get MapGridYNum() {
            return this._MapGridYNum;
        }

        private mObj2Cell = new Map<AActor, CellCoord>();       // 对象到格子的映射, CellCoord 是两个移位操作，最大为0xFFFF(65535)
        private mCell2Object = new Map<CellCoord, AActor[]>();  // 格子中对应的对象的列表
        private mCell2ObjectNum = new Map<CellCoord, MapGridSpriteNum>();  // 保存格子中含有的各种对象的数量

        /**
         * 构造地图信息
         * @param mapCode 关卡Id
         * @param mapWidth 地图的宽度（厘米）
         * @param mapHeight 地图的高度（厘米）
         * @param mapGridWidth 地图的格子宽度（个数）
         * @param mapGridHeight 地图的格子高度（个数）
         * @param mapData 地图数据
         */
        public constructor(mapCode: number,
            mapWidth: number,
            mapHeight: number,
            mapGridWidth: number,
            mapGridHeight: number,
            mapData: GMapData) {

            Global.Log.Assert(Number.isInteger(mapWidth));
            Global.Log.Assert(Number.isInteger(mapHeight));
            Global.Log.Assert(Number.isInteger(mapGridWidth));
            Global.Log.Assert(Number.isInteger(mapGridHeight));

            this.MapCode = mapCode;
            this.MapWidth = mapWidth;
            this.MapHeight = mapHeight;
            this._MapGridWidth = mapGridWidth;
            this._MapGridHeight = mapGridHeight;

            this._MapGridXNum = (this.MapWidth - 1) / this._MapGridWidth | 0 + 1;       // | 0 是为了转成32位整数
            this._MapGridYNum = (this.MapHeight - 1) / this._MapGridHeight | 0 + 1;

            this._MapData = mapData;
        }

        /**
         * 转换格子坐标到格子的封装值
         * @param cellX 要转换的格子坐标
         * @param cellY 要转换的格子坐标
         */
        private cellCoord(cellX: number, cellY: number): CellCoord {
            const cellValue = cellX << 16 | cellY;
            return cellValue >>> 0;   // >>>0 是为了转换成无符号整数
        }

        /**
         * 移动对象到新的格子
         * @param posX 对象要移动到的新的坐标（厘米）
         * @param posY 对象要移动到的新的坐标（厘米）
         * @param obj 要移动的对象
         */
        public moveObject(posX: number, posY: number, obj: AActor): boolean {
            if (posX < 0 || posY < 0 || posX >= this.MapWidth || posY >= this.MapHeight) {
                return false;
            }

            const cellX = posX / this._MapGridWidth | 0;
            const cellY = posY / this._MapGridHeight | 0;

            const newCellCoord = this.cellCoord(cellX, cellY);

            const oldCellCoord = this.mObj2Cell.get(obj);
            if (oldCellCoord !== undefined) {
                if (newCellCoord === oldCellCoord) {
                    return false;    // 相同，不需要移动对象
                }
                this.mObj2Cell.delete(obj);

                // 从旧的格子中移除自己
                const objList = this.mCell2Object.get(oldCellCoord);
                if (!objList) {
                    const index = objList.indexOf(obj);
                    if (index >= 0) {
                        objList.splice(0, 1);

                        // 减少旧格子的对象数量
                        this.changeCellActorsNum(oldCellCoord, obj, -1);
                    }
                }
            }

            // 添加到新的格子中
            let objList = this.mCell2Object.get(newCellCoord);
            if (objList !== undefined) {
                objList.push(obj);
            }
            else {
                objList = [obj];
                this.mCell2Object.set(newCellCoord, objList);
            }

            // 增加新格子的对象数量
            this.changeCellActorsNum(newCellCoord, obj, 1);
            this.mObj2Cell.set(obj, newCellCoord);
            return true;
        }

        /**
         * 从格子中移除指定的对象
         * @param obj 指定要移除的对象
         */
        public removeObject(obj: AActor) {
            const oldCellCoord = this.mObj2Cell.get(obj);
            if (oldCellCoord === undefined)
                return;

            this.mObj2Cell.delete(obj);

            const objList = this.mCell2Object.get(oldCellCoord);
            if (!objList) {
                const index = objList.indexOf(obj);
                if (index >= 0) {
                    objList.splice(0, 1);

                    // 减少对象数量
                    this.changeCellActorsNum(oldCellCoord, obj, -1);
                }
            }
        }

        /**
         * 在给定的格子中查找对象列表
         * @param cellX 指定要查找对象的格子坐标
         * @param cellY 指定要查找对象的格子坐标
         */
        public findObjects(cellX: number, cellY: number): AActor[] {
            if (cellX < 0 || cellY < 0 || cellX >= this._MapGridXNum || cellY >= this._MapGridYNum) {
                return null;
            }

            Global.Log.Assert(Number.isInteger(cellX));
            Global.Log.Assert(Number.isInteger(cellY));
            const newCellCoord = this.cellCoord(cellX, cellY);

            const objList = this.mCell2Object.get(newCellCoord);
            if (objList !== undefined) {
                return [...objList];    // 复制一个对象列表
            }
            return null;
        }

        /**
         * 返回指定格子坐标是否允许指定类型的角色通过
         * @param actorType 要通过的角色类型
         * @param cellX 要通过的格子坐标
         * @param cellY 要通过的格子坐标
         * @param holdGridNum 要检测的数量
         * @param holdBitSet 
         */
        public canMove(actorType: EActorType, cellX: number, cellY: number, holdGridNum: number, holdBitSet: number = 0) {
            if (actorType === EActorType.BiaoChe) {
                return true;
            }
            const mapGridSpriteNum = this.getMapGridSpriteNum(cellX, cellY);
            if (!mapGridSpriteNum) {
                return true;
            }

            if (actorType === EActorType.LocalPlayer || actorType === EActorType.NetPlayer) {
                if (this._MapData.HoldRole > 0) {
                    if (mapGridSpriteNum.RoleNum > holdGridNum || ForceHoldBitSets.HoldRole === (holdBitSet & ForceHoldBitSets.HoldRole)) {
                        return false;
                    }
                }
                if (this._MapData.HoldMonster > 0) {
                    if (mapGridSpriteNum.MonsterNum > holdGridNum || ForceHoldBitSets.HoldMonster === (holdBitSet & ForceHoldBitSets.HoldMonster)) {
                        return false;
                    }
                }
                if (this._MapData.HoldNPC > 0) {
                    if (mapGridSpriteNum.NPCNum > holdGridNum || mapGridSpriteNum.JunQiNum > holdGridNum || ForceHoldBitSets.HoldNPC === (holdBitSet & ForceHoldBitSets.HoldNPC)) {
                        return false;
                    }
                }
                return true;
            }
            else if (actorType === EActorType.Monster) {
                if (mapGridSpriteNum.RoleNum > holdGridNum) {
                    return false;
                }

                if (mapGridSpriteNum.MonsterNum > holdGridNum) {
                    return false;
                }

                if (mapGridSpriteNum.NPCNum > holdGridNum || mapGridSpriteNum.JunQiNum > holdGridNum) {
                    return false;
                }

                return true;
            }
            else if (actorType === EActorType.GoodsPack) {
                if (mapGridSpriteNum.GoodsPackNum > holdGridNum) {
                    return false;
                }

                return true;
            }
            return false;
        }

        /**
         * 修改地图格子中对象的数量
         * @param cellCoord 要修改对象数量的格子坐标
         * @param obj 指定要添加或减少的角色
         * @param addOrSubNum 指定要添加或减少的数量（1或-1）
         */
        private changeCellActorsNum(cellCoord: CellCoord, obj: AActor, addOrSubNum: number): void {
            let mapGridSpriteNum = this.mCell2ObjectNum.get(cellCoord);
            if (mapGridSpriteNum === undefined) {// 还没有存在角色数量对象，创建一个
                mapGridSpriteNum = new MapGridSpriteNum();
                this.mCell2ObjectNum.set(cellCoord, mapGridSpriteNum);
            }

            mapGridSpriteNum.TotalNum += addOrSubNum;
            mapGridSpriteNum.TotalNum = Math.max(0, mapGridSpriteNum.TotalNum);

            const actorType = obj.getType();
            switch (actorType) {
                case EActorType.LocalPlayer:
                case EActorType.NetPlayer:
                    {
                        mapGridSpriteNum.RoleNum += addOrSubNum;
                        mapGridSpriteNum.RoleNum = Math.max(0, mapGridSpriteNum.RoleNum);
                        break;
                    }

                case EActorType.Monster:
                    {
                        mapGridSpriteNum.MonsterNum += addOrSubNum;
                        mapGridSpriteNum.MonsterNum = Math.max(0, mapGridSpriteNum.MonsterNum);
                        break;
                    }

                case EActorType.NPC:
                    {
                        mapGridSpriteNum.NPCNum += addOrSubNum;
                        mapGridSpriteNum.NPCNum = Math.max(0, mapGridSpriteNum.NPCNum);
                        break;
                    }

                case EActorType.BiaoChe:
                    {
                        mapGridSpriteNum.BiaoCheNum += addOrSubNum;
                        mapGridSpriteNum.BiaoCheNum = Math.max(0, mapGridSpriteNum.BiaoCheNum);
                        break;
                    }

                case EActorType.JunQi:
                    {
                        mapGridSpriteNum.JunQiNum += addOrSubNum;
                        mapGridSpriteNum.JunQiNum = Math.max(0, mapGridSpriteNum.JunQiNum);
                        break;
                    }

                case EActorType.GoodsPack:
                    {
                        mapGridSpriteNum.GoodsPackNum += addOrSubNum;
                        mapGridSpriteNum.GoodsPackNum = Math.max(0, mapGridSpriteNum.GoodsPackNum);
                        break;
                    }
            }
        }

        /**
         * 获取指定坐标格子的角色数量信息
         * @param cellX 指定要获取角色数量信息的坐标
         * @param cellY 指定要获取角色数量信息的坐标
         */
        private getMapGridSpriteNum(cellX: number, cellY: number): MapGridSpriteNum {
            const cellCoord = this.cellCoord(cellX, cellY);
            return this.mCell2ObjectNum.get(cellCoord);
        }

    }
}