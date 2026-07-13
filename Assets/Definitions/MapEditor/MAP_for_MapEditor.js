/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */

"use strict";

/** textures */
const TEXTURE_LIST = [
    "CaveWallBooga_210", "CaveWallBooga_211", "CaveWallBooga_212", "CaveWallBooga_213", "CaveWallBooga_214", "CaveWallBooga_215", "CaveWallBooga_216", "CaveWallBooga_217", "CaveWallBooga_218", "CaveWallBooga_219", "CaveWallBooga_220", "CaveWallBooga_221",
    "CaveWallBooga_222", "CaveWallBooga_223", "CaveWallBooga_224", "CaveWallBooga_225", "CaveWallBooga_226", "CaveWallBooga_227", "CaveWallBooga_228", "CaveWallBooga_229", "CaveWallBooga_230", "CaveWallBooga_231", "CaveWallBooga_232"
].sort();

/** Decals */
const DECAL_PAINTINGS = [

].sort();

/** Crests */

const DECAL_CRESTS = [].sort();

//lights
const LIGHT_DECALS = [

].sort();

//panorama
const PANORAMA_DECALS = [

].sort();

//arch
const ARCH_DECALS = [

].sort();;

//sky
const SKY_DECALS = [

].sort();

//mask elements

const MASK_ELEMENTS = [
    "CurvedTriangle", "Peak", "Ridge", "SharpCorner", "Tit", "Triangle", "Circular", "Crescent", "Half", "Ledge", "Spiky", "Stalag", "Third", "Wavy", "Full_Ledge", "HighLedge", "HalfCorner", "ThirdToZero",
    "CrescentLedge", "IsolatedLedge", "HalfToZero", "Full", "Fullish", "HalfToFull", "ThirdToFull", "MiniCorner", "Pedestal", "HalfRidge", "InvCurvedTriangle", "InvHalfCorner", "InvHalfToFull", "InvHalfToZero", "InvThirdToFull", "InvThirdToZero",
    "ThirdRidge", "AnotherLedge", "LowLedge", "HalfToLedge", "ThirdToLedge", "RoughLine",
];

const MASK_DECALS = [
    "AmanitaClusterFullback1", "AmanitaFullback1", "AmanityFull2", "Eyes2", "Flower1", "Fungi1", "Fungi2", "Fungus1", "Fungus3", "Fungus4", "GreenFungiClusterFullBack1", "GreenWallFungi1",
    "Lichen", "Moss1", "Moss2", "Plant1", "Plant2", "Roots", "SideFungus", "Spider1", "Spider2", "Spider3", "Spider4", "Spider5",
    "WallFungi1", "WallFungi2", "WallFungi3", "WallFungi4", "WallFungi5", "YellowEyes1", "YellowPlant1"
];

const TRIGGER_DECALS = [];
const LAIR_DECALS = [].sort();

const CONTAINER_LIST = [];
if (typeof CONTAINER_ITEM_TYPE !== "undefined") {

    for (const container in CONTAINER_ITEM_TYPE) {
        CONTAINER_LIST.push(container);
    }
}
console.log("%cMAP for MapEditor loaded.", "color: #888");