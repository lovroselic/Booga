/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */

"use strict";
console.log("%cMonsters for Booga loaded.", "color: #888");

const HERO_TYPE = {
    Booga: {
        name: "Booga",
        asset: "FleaIdle",
        animate: true,
        dirRef: UP,
        w: 64,
        h: 64,
        fps: 10,
    }
};

const MONSTER_TYPE = {
    DinoDragon: {
        name: "DinoDragon",
        category: "enemy",
        asset: "DinoDragon",
        w: 64,
        h: 64,
        dirRef: RIGHT,
        animate: true,
        fps: 60,
        speed: 1.0 * 64,
        behaviourArguments: [Infinity, ["wanderer"], 10000, ["hunter2D"]],
        preventRotation: true,
    },

};