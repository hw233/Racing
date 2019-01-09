// 游戏配置项,即不同客户端可能会有不同配置的启动相关的项,放在这里
namespace GameConfig {
    export const LoginServerUrl: string = "ws://192.168.88.20:4412";    // LoginServer的IP
    export const ListServerUrl: string = "http://127.0.0.1:4501";   // 获取服务器列表的地址
    export const DevGameServer: string = "ws://192.168.88.20:4404";     // 本地调试用的GameServer地址,仅能用在开发过程中. 发布时需要注释掉

    // to do ... 继续添加其它的配置项
}