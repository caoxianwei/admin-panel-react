/************************************
 * All user related utility methods
 ***********************************/

import { GetItem } from './localStorage.utils';
import { FIRE_TOKEN } from './../Constants/asyncStorage.constants';

let fireToken = '';
/**
 * Returns firebase token for users
 * first checks in local variable, if its undefined, returns from Asyncstorage
 */
export const GetFireToken = async () => {
    if (fireToken) {
        return fireToken;
    }
    fireToken = GetItem(FIRE_TOKEN);
    return fireToken;
};