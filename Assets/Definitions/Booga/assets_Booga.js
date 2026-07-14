/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
//Assets for Booga
"use strict";



/** END */

LoadSheetSequences = [
    { srcName: "FleaIdle.png", count: 1, name: "FleaIdle", trim: false },

];

LoadFonts = [
    { srcName: "C64_Pro-STYLE.ttf", name: "C64" },
    { srcName: "ArcadeClassic.ttf", name: "Arcade" },
    { srcName: "Booga.otf", name: "Booga" },
];

LoadTextures = [
    { srcName: "Wall/CaveWallBooga_210.webp", name: "CaveWallBooga_210" },
    { srcName: "Wall/CaveWallBooga_211.webp", name: "CaveWallBooga_211" },
    { srcName: "Wall/CaveWallBooga_212.webp", name: "CaveWallBooga_212" },
    { srcName: "Wall/CaveWallBooga_213.webp", name: "CaveWallBooga_213" },
    { srcName: "Wall/CaveWallBooga_214.webp", name: "CaveWallBooga_214" },
    { srcName: "Wall/CaveWallBooga_215.webp", name: "CaveWallBooga_215" },
    { srcName: "Wall/CaveWallBooga_216.webp", name: "CaveWallBooga_216" },
    { srcName: "Wall/CaveWallBooga_217.webp", name: "CaveWallBooga_217" },
    { srcName: "Wall/CaveWallBooga_218.webp", name: "CaveWallBooga_218" },
    { srcName: "Wall/CaveWallBooga_219.webp", name: "CaveWallBooga_219" },
    { srcName: "Wall/CaveWallBooga_220.webp", name: "CaveWallBooga_220" },
    { srcName: "Wall/CaveWallBooga_221.webp", name: "CaveWallBooga_221" },
    { srcName: "Wall/CaveWallBooga_222.webp", name: "CaveWallBooga_222" },
    { srcName: "Wall/CaveWallBooga_223.webp", name: "CaveWallBooga_223" },
    { srcName: "Wall/CaveWallBooga_224.webp", name: "CaveWallBooga_224" },
    { srcName: "Wall/CaveWallBooga_225.webp", name: "CaveWallBooga_225" },
    { srcName: "Wall/CaveWallBooga_226.webp", name: "CaveWallBooga_226" },
    { srcName: "Wall/CaveWallBooga_227.webp", name: "CaveWallBooga_227" },
    { srcName: "Wall/CaveWallBooga_228.webp", name: "CaveWallBooga_228" },
    { srcName: "Wall/CaveWallBooga_229.webp", name: "CaveWallBooga_229" },
    { srcName: "Wall/CaveWallBooga_230.webp", name: "CaveWallBooga_230" },
    { srcName: "Wall/CaveWallBooga_231.webp", name: "CaveWallBooga_231" },
    { srcName: "Wall/CaveWallBooga_232.webp", name: "CaveWallBooga_232" },

    { srcName: "Title/Booga_title_768.webp", name: "Title" },
];

LoadAudio = [
    { srcName: "Expect No Mercy - LaughingSkull.mp3", name: "Title" },
    //{ srcName: "death.mp3", name: "Death" },

];

LoadShaders = [
    'vShader2D_1_0.glsl', 'fShader2D_1_0.glsl',
];

LoadSprites = [
    //mask decals
    { srcName: "MaskDecals/AmanitaClusterFullback1.png", name: "AmanitaClusterFullback1" },
    { srcName: "MaskDecals/AmanitaFullback1.png", name: "AmanitaFullback1" },
    { srcName: "MaskDecals/AmanityFull2.png", name: "AmanityFull2" },
    { srcName: "MaskDecals/Eyes2.png", name: "Eyes2" },
    { srcName: "MaskDecals/Flower1.png", name: "Flower1" },
    { srcName: "MaskDecals/Fungi1.png", name: "Fungi1" },
    { srcName: "MaskDecals/Fungi2.png", name: "Fungi2" },
    { srcName: "MaskDecals/Fungus1.png", name: "Fungus1" },
    { srcName: "MaskDecals/Fungus3.png", name: "Fungus3" },
    { srcName: "MaskDecals/Fungus4.png", name: "Fungus4" },
    { srcName: "MaskDecals/GreenFungiClusterFullBack1.png", name: "GreenFungiClusterFullBack1" },
    { srcName: "MaskDecals/GreenWallFungi1.png", name: "GreenWallFungi1" },
    { srcName: "MaskDecals/Lichen.png", name: "Lichen" },
    { srcName: "MaskDecals/Moss1.png", name: "Moss1" },
    { srcName: "MaskDecals/Moss2.png", name: "Moss2" },
    { srcName: "MaskDecals/Plant1.png", name: "Plant1" },
    { srcName: "MaskDecals/Plant2.png", name: "Plant2" },
    { srcName: "MaskDecals/Roots.png", name: "Roots" },
    { srcName: "MaskDecals/SideFungus.png", name: "SideFungus" },
    { srcName: "MaskDecals/Spider1.png", name: "Spider1" },
    { srcName: "MaskDecals/Spider2.png", name: "Spider2" },
    { srcName: "MaskDecals/Spider3.png", name: "Spider3" },
    { srcName: "MaskDecals/Spider4.png", name: "Spider4" },
    { srcName: "MaskDecals/Spider5.png", name: "Spider5" },
    { srcName: "MaskDecals/WallFungi1.png", name: "WallFungi1" },
    { srcName: "MaskDecals/WallFungi2.png", name: "WallFungi2" },
    { srcName: "MaskDecals/WallFungi3.png", name: "WallFungi3" },
    { srcName: "MaskDecals/WallFungi4.png", name: "WallFungi4" },
    { srcName: "MaskDecals/WallFungi5.png", name: "WallFungi5" },
    { srcName: "MaskDecals/YellowEyes1.png", name: "YellowEyes1" },
    { srcName: "MaskDecals/YellowPlant1.png", name: "YellowPlant1" },
    { srcName: "MaskDecals/Mushroom_233.png", name: "Mushroom_233" },
    { srcName: "MaskDecals/Mushroom_234.png", name: "Mushroom_234" },
    { srcName: "MaskDecals/Mushroom_235.png", name: "Mushroom_235" },
    { srcName: "MaskDecals/Mushroom_236.png", name: "Mushroom_236" },
    { srcName: "MaskDecals/Mushroom_237.png", name: "Mushroom_237" },
    { srcName: "MaskDecals/Mushroom_238.png", name: "Mushroom_238" },
    { srcName: "MaskDecals/Mushroom_239.png", name: "Mushroom_239" },
    { srcName: "MaskDecals/Mushroom_240.png", name: "Mushroom_240" },
    { srcName: "MaskDecals/Mushroom_241.png", name: "Mushroom_241" },
    { srcName: "MaskDecals/Mushroom_242.png", name: "Mushroom_242" },


    //mask elements for map editor
    { srcName: "MaskElements/CurvedTriangle.png", name: "CurvedTriangle" },
    { srcName: "MaskElements/Peak.png", name: "Peak" },
    { srcName: "MaskElements/Ridge.png", name: "Ridge" },
    { srcName: "MaskElements/SharpCorner.png", name: "SharpCorner" },
    { srcName: "MaskElements/Tit.png", name: "Tit" },
    { srcName: "MaskElements/Triangle.png", name: "Triangle" },
    { srcName: "MaskElements/Circular.png", name: "Circular" },
    { srcName: "MaskElements/Crescent.png", name: "Crescent" },
    { srcName: "MaskElements/Half.png", name: "Half" },
    { srcName: "MaskElements/Ledge.png", name: "Ledge" },
    { srcName: "MaskElements/Spiky.png", name: "Spiky" },
    { srcName: "MaskElements/Stalag.png", name: "Stalag" },
    { srcName: "MaskElements/Third.png", name: "Third" },
    { srcName: "MaskElements/Wavy.png", name: "Wavy" },
    { srcName: "MaskElements/Full_Ledge.png", name: "Full_Ledge" },
    { srcName: "MaskElements/HighLedge.png", name: "HighLedge" },
    { srcName: "MaskElements/HalfCorner.png", name: "HalfCorner" },
    { srcName: "MaskElements/ThirdToZero.png", name: "ThirdToZero" },
    { srcName: "MaskElements/CrescentLedge.png", name: "CrescentLedge" },
    { srcName: "MaskElements/IsolatedLedge.png", name: "IsolatedLedge" },
    { srcName: "MaskElements/HalfToZero.png", name: "HalfToZero" },
    { srcName: "MaskElements/Full.png", name: "Full" },
    { srcName: "MaskElements/Fullish.png", name: "Fullish" },
    { srcName: "MaskElements/HalfToFull.png", name: "HalfToFull" },
    { srcName: "MaskElements/ThirdToFull.png", name: "ThirdToFull" },
    { srcName: "MaskElements/MiniCorner.png", name: "MiniCorner" },
    { srcName: "MaskElements/Pedestal.png", name: "Pedestal" },
    { srcName: "MaskElements/HalfRidge.png", name: "HalfRidge" },
    { srcName: "MaskElements/InvCurvedTriangle.png", name: "InvCurvedTriangle" },
    { srcName: "MaskElements/InvHalfCorner.png", name: "InvHalfCorner" },
    { srcName: "MaskElements/InvHalfToFull.png", name: "InvHalfToFull" },
    { srcName: "MaskElements/InvHalfToZero.png", name: "InvHalfToZero" },
    { srcName: "MaskElements/InvThirdToFull.png", name: "InvThirdToFull" },
    { srcName: "MaskElements/InvThirdToZero.png", name: "InvThirdToZero" },
    { srcName: "MaskElements/ThirdRidge.png", name: "ThirdRidge" },
    { srcName: "MaskElements/AnotherLedge.png", name: "AnotherLedge" },
    { srcName: "MaskElements/LowLedge.png", name: "LowLedge" },
    { srcName: "MaskElements/HalfToLedge.png", name: "HalfToLedge" },
    { srcName: "MaskElements/ThirdToLedge.png", name: "ThirdToLedge" },
    { srcName: "MaskElements/RoughLine.png", name: "RoughLine" },

    //UI
    //{ srcName: "UI/FroggessLife.png", name: "Lives" },

];

console.log("%cAssets for Booga ready.", "color: orange");