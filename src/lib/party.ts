import { browser } from '$app/environment';

import type { IParty } from "./data";

const PARTY_STATE_KEY = "state.party";

const defaultParty:IParty = { level: 1, size: 4 };


export function getParty(): IParty {
    if (browser) {
        const partyJson = localStorage.getItem(PARTY_STATE_KEY);
        if (partyJson) return JSON.parse(partyJson);
    }
    return defaultParty;
}

export function saveParty(party: IParty) {
    if (browser) {
        localStorage.setItem(PARTY_STATE_KEY, JSON.stringify(party));
    }
}
