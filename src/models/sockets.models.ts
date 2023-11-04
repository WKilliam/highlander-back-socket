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
    room: string;
    teamTag: string;
    userAvatar: string;
    userPseudo: string;
    position: number;
}

export interface SocketJoinSession {
    room: string;
    userAvatar: string;
    userPseudo: string;
}

export interface SocketBody {

}

export interface SocketSelectPlaceTeam {
    room:string,
    avatar:string,
    pseudo:string,
    teamTag:string,
    position:number
}


