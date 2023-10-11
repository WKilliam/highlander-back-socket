export interface DecksModelsRequest{
    name : string
    description : string
    image : string
    type : string
    rarity : string
    createdAt : string
    count : number
    cards : Array<number>
}
