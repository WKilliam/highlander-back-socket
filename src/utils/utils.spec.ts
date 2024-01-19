import {describe} from "node:test";
import {Utils} from "./utils";
import {ConstantTestValue} from "./ConstantTestValue";
import {EntityCategorie, EntityStatus, StatusGame} from "../models/enums";

describe("Utils", () => {

    describe('createFightSession', () => {
        it('should create a fight session', () => {
            const session = ConstantTestValue.sessionDto;
            // Utils.createFightSession(session,1);
        })
    });

});
