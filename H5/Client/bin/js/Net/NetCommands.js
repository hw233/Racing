/**
 * @desc 定义网络消息Id.
 * 注: 消息Id的值不可以大于65536.只支持uint16的值,以节省带宽
 */
var EMessageType;
(function (EMessageType) {
    EMessageType[EMessageType["CMD_SOCKET_DEFAULT"] = -3] = "CMD_SOCKET_DEFAULT";
    EMessageType[EMessageType["CMD_SOCKET_DISCONNECT"] = -2] = "CMD_SOCKET_DISCONNECT";
    EMessageType[EMessageType["CMD_INVALID"] = -1] = "CMD_INVALID";
    EMessageType[EMessageType["LS_LOGIN_ON"] = 1] = "LS_LOGIN_ON";
    EMessageType[EMessageType["LS_LOGIN_SPEEDY_LOGIN"] = 2] = "LS_LOGIN_SPEEDY_LOGIN";
    EMessageType[EMessageType["CMD_SPR_CLIENTHEART"] = 23] = "CMD_SPR_CLIENTHEART";
    EMessageType[EMessageType["CMD_PREREMOVE_ROLE"] = 98] = "CMD_PREREMOVE_ROLE";
    EMessageType[EMessageType["CMD_UNREMOVE_ROLE"] = 99] = "CMD_UNREMOVE_ROLE";
    EMessageType[EMessageType["CMD_LOGIN"] = 100] = "CMD_LOGIN";
    EMessageType[EMessageType["CMD_ROLE_LIST"] = 101] = "CMD_ROLE_LIST";
    EMessageType[EMessageType["CMD_CREATE_ROLE"] = 102] = "CMD_CREATE_ROLE";
    EMessageType[EMessageType["CMD_REMOVE_ROLE"] = 103] = "CMD_REMOVE_ROLE";
    EMessageType[EMessageType["CMD_INIT_GAME"] = 104] = "CMD_INIT_GAME";
    EMessageType[EMessageType["CMD_SYNC_TIME"] = 105] = "CMD_SYNC_TIME";
    EMessageType[EMessageType["CMD_PLAY_GAME"] = 106] = "CMD_PLAY_GAME";
    EMessageType[EMessageType["CMD_SPR_MOVE"] = 107] = "CMD_SPR_MOVE";
    EMessageType[EMessageType["CMD_OTHER_ROLE"] = 110] = "CMD_OTHER_ROLE";
    EMessageType[EMessageType["CMD_SPR_POSITION"] = 112] = "CMD_SPR_POSITION";
    EMessageType[EMessageType["CMD_SPR_ACTTION"] = 114] = "CMD_SPR_ACTTION";
    EMessageType[EMessageType["CMD_SPR_MAGICCODE"] = 116] = "CMD_SPR_MAGICCODE";
    EMessageType[EMessageType["CMD_SPR_ATTACK"] = 117] = "CMD_SPR_ATTACK";
    EMessageType[EMessageType["CMD_SPR_INJURE"] = 118] = "CMD_SPR_INJURE";
    EMessageType[EMessageType["CMD_SPR_REALIVE"] = 119] = "CMD_SPR_REALIVE";
    EMessageType[EMessageType["CMD_SPR_RELIFE"] = 120] = "CMD_SPR_RELIFE";
    EMessageType[EMessageType["CMD_SPR_CLICKON"] = 121] = "CMD_SPR_CLICKON";
    EMessageType[EMessageType["CMD_SYSTEM_MONSTER"] = 122] = "CMD_SYSTEM_MONSTER";
    EMessageType[EMessageType["CMD_SPR_MAPCHANGE"] = 123] = "CMD_SPR_MAPCHANGE";
    EMessageType[EMessageType["CMD_SPR_NEWTASK"] = 125] = "CMD_SPR_NEWTASK";
    EMessageType[EMessageType["CMD_SPR_GETATTRIB2"] = 126] = "CMD_SPR_GETATTRIB2";
    EMessageType[EMessageType["CMD_SPR_LEAVE"] = 127] = "CMD_SPR_LEAVE";
    EMessageType[EMessageType["CMD_SPR_ADD_GOODS"] = 130] = "CMD_SPR_ADD_GOODS";
    EMessageType[EMessageType["CMD_SPR_MOD_GOODS"] = 131] = "CMD_SPR_MOD_GOODS";
    EMessageType[EMessageType["CMD_SPR_CHGCODE"] = 137] = "CMD_SPR_CHGCODE";
    EMessageType[EMessageType["CMD_SPR_MONEYCHANGE"] = 138] = "CMD_SPR_MONEYCHANGE";
    EMessageType[EMessageType["CMD_SPR_MODTASK"] = 139] = "CMD_SPR_MODTASK";
    EMessageType[EMessageType["CMD_SPR_COMPTASK"] = 140] = "CMD_SPR_COMPTASK";
    EMessageType[EMessageType["CMD_SPR_EXPCHANGE"] = 141] = "CMD_SPR_EXPCHANGE";
    EMessageType[EMessageType["CMD_SPR_UPDATENPCSTATE"] = 151] = "CMD_SPR_UPDATENPCSTATE";
    EMessageType[EMessageType["CMD_SPR_NPCSTATELIST"] = 152] = "CMD_SPR_NPCSTATELIST";
    EMessageType[EMessageType["CMD_SPR_HITED"] = 155] = "CMD_SPR_HITED";
    EMessageType[EMessageType["CMD_SPR_MODKEYS"] = 156] = "CMD_SPR_MODKEYS";
    EMessageType[EMessageType["CMD_SPR_CHAT"] = 157] = "CMD_SPR_CHAT";
    EMessageType[EMessageType["CMD_SPR_USEGOODS"] = 158] = "CMD_SPR_USEGOODS";
    EMessageType[EMessageType["CMD_SPR_CHANGEPOS"] = 159] = "CMD_SPR_CHANGEPOS";
    EMessageType[EMessageType["CMD_SPR_NOTIFYCHGMAP"] = 160] = "CMD_SPR_NOTIFYCHGMAP";
    EMessageType[EMessageType["CMD_SPR_UPDATE_ROLEDATA"] = 164] = "CMD_SPR_UPDATE_ROLEDATA";
    EMessageType[EMessageType["CMD_SPR_REMOVE_COOLDOWN"] = 165] = "CMD_SPR_REMOVE_COOLDOWN";
    EMessageType[EMessageType["CMD_SPR_MALL_BUY"] = 166] = "CMD_SPR_MALL_BUY";
    EMessageType[EMessageType["CMD_SPR_USERMONEYCHANGE"] = 168] = "CMD_SPR_USERMONEYCHANGE";
    EMessageType[EMessageType["CMD_SPR_USERYINLIANGCHANGE"] = 169] = "CMD_SPR_USERYINLIANGCHANGE";
    EMessageType[EMessageType["CMD_SPR_AUTOFIGHT"] = 182] = "CMD_SPR_AUTOFIGHT";
    EMessageType[EMessageType["CMD_SPR_GOTOMAP"] = 193] = "CMD_SPR_GOTOMAP";
    EMessageType[EMessageType["CMD_SPR_LOADALREADY"] = 209] = "CMD_SPR_LOADALREADY";
    EMessageType[EMessageType["CMD_SPR_UPSKILLLEVEL"] = 216] = "CMD_SPR_UPSKILLLEVEL";
    EMessageType[EMessageType["CMD_SPR_ADD_SKILL"] = 217] = "CMD_SPR_ADD_SKILL";
    EMessageType[EMessageType["CMD_SPR_BUFFERDATA"] = 230] = "CMD_SPR_BUFFERDATA";
    EMessageType[EMessageType["CMD_SPR_RESETBAG"] = 235] = "CMD_SPR_RESETBAG";
    EMessageType[EMessageType["CMD_SPR_GETHUODONGDATA"] = 245] = "CMD_SPR_GETHUODONGDATA";
    EMessageType[EMessageType["CMD_SPR_FINDMONSTER"] = 262] = "CMD_SPR_FINDMONSTER";
    EMessageType[EMessageType["CMD_UPDATEALLTHINGINDEXS"] = 292] = "CMD_UPDATEALLTHINGINDEXS";
    EMessageType[EMessageType["CMD_SPR_TASKTRANSPORT"] = 353] = "CMD_SPR_TASKTRANSPORT";
    EMessageType[EMessageType["CMD_SPR_MALLZHENQIBUY"] = 387] = "CMD_SPR_MALLZHENQIBUY";
    EMessageType[EMessageType["CMD_SPR_USERGOLDCHANGE"] = 397] = "CMD_SPR_USERGOLDCHANGE";
    EMessageType[EMessageType["CMD_SPR_NEWNPC"] = 406] = "CMD_SPR_NEWNPC";
    EMessageType[EMessageType["CMD_SPR_DELNPC"] = 407] = "CMD_SPR_DELNPC";
    EMessageType[EMessageType["CMD_SPR_STOPMOVE"] = 411] = "CMD_SPR_STOPMOVE";
    EMessageType[EMessageType["CMD_SPR_ROLEPARAMSCHANGE"] = 427] = "CMD_SPR_ROLEPARAMSCHANGE";
    EMessageType[EMessageType["CMD_SPR_TASKTRANSPORT2"] = 433] = "CMD_SPR_TASKTRANSPORT2";
    EMessageType[EMessageType["CMD_SPR_TRANSFERSOMETHING"] = 438] = "CMD_SPR_TRANSFERSOMETHING";
    EMessageType[EMessageType["CMD_SPR_FETCHMALLDATA"] = 440] = "CMD_SPR_FETCHMALLDATA";
    EMessageType[EMessageType["CMD_SPR_MALLQIANGGOUBUYGOODS"] = 441] = "CMD_SPR_MALLQIANGGOUBUYGOODS";
    EMessageType[EMessageType["CMD_SPR_ENTERTASKFUBEN"] = 444] = "CMD_SPR_ENTERTASKFUBEN";
    EMessageType[EMessageType["CMD_SPR_GETTASKAWARDS"] = 447] = "CMD_SPR_GETTASKAWARDS";
    EMessageType[EMessageType["CMD_SPR_GETROLEUSINGGOODSDATALIST"] = 512] = "CMD_SPR_GETROLEUSINGGOODSDATALIST";
    EMessageType[EMessageType["CMD_SPR_EXECUTERECOMMENDPROPADDPOINT"] = 514] = "CMD_SPR_EXECUTERECOMMENDPROPADDPOINT";
    EMessageType[EMessageType["CMD_SPR_UPDATEEVERYDAYONLINEAWARDGIFTINFO"] = 539] = "CMD_SPR_UPDATEEVERYDAYONLINEAWARDGIFTINFO";
    EMessageType[EMessageType["CMD_SPR_GETEVERYDAYONLINEAWARDGIFT"] = 540] = "CMD_SPR_GETEVERYDAYONLINEAWARDGIFT";
    EMessageType[EMessageType["CMD_SPR_GETMEDITATEEXP"] = 549] = "CMD_SPR_GETMEDITATEEXP";
    EMessageType[EMessageType["CMD_SPR_GETMEDITATETIMEINFO"] = 550] = "CMD_SPR_GETMEDITATETIMEINFO";
    EMessageType[EMessageType["CMD_SPR_SETAUTOASSIGNPROPERTYPOINT"] = 560] = "CMD_SPR_SETAUTOASSIGNPROPERTYPOINT";
    EMessageType[EMessageType["CMD_SPR_GETSKILLINFO"] = 564] = "CMD_SPR_GETSKILLINFO";
    EMessageType[EMessageType["CMD_SPR_GETVIPINFO"] = 593] = "CMD_SPR_GETVIPINFO";
    EMessageType[EMessageType["CMD_SPR_GETVIPLEVELAWARD"] = 594] = "CMD_SPR_GETVIPLEVELAWARD";
    EMessageType[EMessageType["CMD_SPR_VIPLEVELUP"] = 595] = "CMD_SPR_VIPLEVELUP";
    EMessageType[EMessageType["CMD_SPR_STARTMEDITATE"] = 600] = "CMD_SPR_STARTMEDITATE";
    EMessageType[EMessageType["CMD_SPR_REFRESH_ICON_STATE"] = 614] = "CMD_SPR_REFRESH_ICON_STATE";
    EMessageType[EMessageType["CMD_SPR_QUERYUPLEVELGIFTINFO"] = 632] = "CMD_SPR_QUERYUPLEVELGIFTINFO";
    EMessageType[EMessageType["CMD_SPR_GETUPLEVELGIFTAWARD"] = 633] = "CMD_SPR_GETUPLEVELGIFTAWARD";
    EMessageType[EMessageType["CMD_SPR_PUSH_VERSION"] = 673] = "CMD_SPR_PUSH_VERSION";
    EMessageType[EMessageType["CMD_SECOND_PASSWORD_CHECK_STATE"] = 860] = "CMD_SECOND_PASSWORD_CHECK_STATE";
    EMessageType[EMessageType["CMD_SPR_SEVEN_DAY_ACT_QUERY"] = 1310] = "CMD_SPR_SEVEN_DAY_ACT_QUERY";
    EMessageType[EMessageType["CMD_SPR_SEVEN_DAY_ACT_GET_AWARD"] = 1311] = "CMD_SPR_SEVEN_DAY_ACT_GET_AWARD";
    EMessageType[EMessageType["CMD_SPR_FASHION_ACTIVE"] = 1611] = "CMD_SPR_FASHION_ACTIVE";
    EMessageType[EMessageType["CMD_SPR_MAGIC_ATTACK"] = 2002] = "CMD_SPR_MAGIC_ATTACK";
    EMessageType[EMessageType["CMD_SPR_UPDATE_MONSTER_BELONGTO_INFO"] = 2010] = "CMD_SPR_UPDATE_MONSTER_BELONGTO_INFO";
    EMessageType[EMessageType["CMD_SPR_ClientFunOpenTiShi"] = 30103] = "CMD_SPR_ClientFunOpenTiShi";
    EMessageType[EMessageType["CMD_SPR_ClientFunOpenTiShiRewardPickUp"] = 30104] = "CMD_SPR_ClientFunOpenTiShiRewardPickUp";
})(EMessageType || (EMessageType = {}));
//# sourceMappingURL=NetCommands.js.map