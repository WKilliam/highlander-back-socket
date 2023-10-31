// export interface Socket_GetTeamInfos{
//     sessionKey: string;
//     teamId: number;
// }


export interface SocketJoinTeamTag {
    sessionKey: string;
    teamTag: string;
    cardTag: string;
}

export interface SocketJoinTeamCard {
    gameKey: string;
    teamTag: string;
    userAvatar: string;
    userPseudo: string;
    position: number;
}

export interface SocketJoinSession {
    roomjoin: string;
    userAvatar: string;
    userPseudo: string;
}
