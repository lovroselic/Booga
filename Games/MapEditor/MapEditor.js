/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
"use strict";

const INI = {
    MAXINT: 256,
    MININT: 1,
    MAX_GRID: 64,
    MIN_GRID: 5,
    SPACE_X: 4192,
    SPACE_Y: 4192,
    CANVAS_RESOLUTION: 256,
    TEXTURE_RESOLUTION: 128, //320
    DRAW_OCCLUSION_MAP: false,
    OCCLUSION_RESOLUTION: 4,
    USE_NOISE_FUNCTIONS: false,
    USE_QUAD_MAP: false,
    USE_OCCLUSION_MAP: false,
    USE_TEXTURES: true,
    USE_FLOORS: false,
    USE_TERRAIN: false,
    USE_PANORAMA: false,
    USE_LIGHTS: false,
    USE_DECALS: false,
    USE_MASK: true,
};

const MAP = {
    Demo: {
        name: "Booga",
        data: '{"width":"40","height":"40","depth":1,"map":"BB40AA1443B$BB39AA38BB38A"}',
        start: '[1540,1]',
    }
};

const $MAP = {
    map: {},
    properties: null,
    lists: null,
    combined: [],
    init() {
        for (const prop of this.properties) {
            this.map[prop] = [];
        }
        for (const prop of this.lists) {
            this.map[prop] = [];
        }
    },
    combine() {
        this.combined = [];
        for (const prop of this.properties) {
            this.combined.push(this.map[prop]);
        }
    },
    mask_moves: [],
    mask_decal_moves: [],
};

const PRG = {
    VERSION: "0.11.0",
    NAME: "MapEditor",
    YEAR: "2026",
    CSS: "color: #239AFF;",
    INIT() {
        console.log("%c**************************************************************************************************************************************", PRG.CSS);
        console.log(`${PRG.NAME} ${PRG.VERSION} by Lovro Selic, (c) LaughingSkull ${PRG.YEAR} on ${navigator.userAgent}`);
        console.log("%c**************************************************************************************************************************************", PRG.CSS);
        $("#title").html(PRG.NAME);
        $("#version").html(`${PRG.NAME} V${PRG.VERSION} <span style='font-size:14px'>&copy</span> LaughingSkull ${PRG.YEAR}`);

        ENGINE.autostart = true;
        ENGINE.start = PRG.start;
        ENGINE.readyCall = GAME.setup;
        ENGINE.setGridSize(64);
        ENGINE.setSpriteSheetSize(64);
        ENGINE.init();
    },
    setup() {
        console.log("PRG.setup");
        $("#verticalGrid").change(GAME.updateWH);
        $("#horizontalGrid").change(GAME.updateWH);
        $("#gridsize").change(GAME.updateWH);
        $("#selector input[name=renderer]").click(GAME.render);
        $("#corr").click(GAME.render);
        $("#coord").click(GAME.render);
        $("#mask").click(GAME.maskVisibility);
        $("#all_coord").click(GAME.render);
        $("#grid").click(GAME.render);

        $("#engine_version").html(ENGINE.VERSION);
        $("#grid_version").html(GRID.VERSION);
        $("#maze_version").html(DUNGEON.VERSION);
        $("#lib_version").html(LIB.VERSION);
        $("#webgl_version").html(WebGL.VERSION);
        $("#iam_version").html(IndexArrayManagers.VERSION);

        $(".section").show();

        $("#buttons").on("click", "#new", GAME.init);
        $("#buttons").on("click", "#export", GAME.export);
        $("#buttons").on("click", "#import", GAME.import);
        $("#buttons").on("click", "#copy", GAME.copyToClipboard);
        $("#buttons").on("click", "#copy_mask", GAME.copyMaskToClipboard);
        $("#buttons").on("click", "#copy_decal", GAME.copyDecalMaskToClipboard);
        $("#buttons").on("click", "#create_mask", GAME.createMask);
        $("#buttons").on("click", "#download_mask", GAME.downloadMask);
        $("#buttons").on("click", "#textured_mask", GAME.textureToMask);

        MAP_TOOLS.INI.FOG = false;
        WebGL.PRUNE = false;

        // hide unwanted
        if (!INI.USE_PANORAMA) {
            $("#panorama_row").hide();
            $("#panorama_row_2").hide();
        }

        if (!INI.USE_TEXTURES) {
            $("#texture_row").hide();
        }

        if (!INI.USE_FLOORS) {
            $("#floor_row").hide();
        }

        if (!INI.USE_NOISE_FUNCTIONS) {
            $("#noise_row").hide();
        }

        if (!INI.USE_LIGHTS) {
            $("#material_light_row").hide();
            $("#show_lights").hide();
        }

        if (!INI.USE_DECALS) {
            $("#show_decals").hide();
        }

        if (!INI.USE_MASK) {
            $("#show_mask_paint").hide();
            $("#mask_export").hide();
            $("#show_mask_decals").hide();
            $("#mask_decal_export").hide();
        }
    },
    start() {
        console.log(PRG.NAME + " started.");
        $("#startGame").addClass("hidden");
        GAME.start();
    }
};

const HERO = {};

const GAME = {
    floor: 0,
    start() {
        WebGL.setContext("webgl");
        $MAP.properties = MAP_TOOLS.properties;
        $MAP.lists = MAP_TOOLS.lists;

        $("#bottom")[0].scrollIntoView();

        ENGINE.topCanvas = ENGINE.getCanvasName("ROOM");
        $(ENGINE.topCanvas).on("click", { layer: ENGINE.topCanvas }, GAME.mouseClick);

        GAME.level = "Demo";
        GAME.loadLevel(GAME.level);
        GAME.started = false;

        WebGL.PRUNE = false;
        WebGL.HERO_AS_INNER = true;
        WebGL.INI.BACKGROUND_ALPHA = 0.0;
        WebGL.USE_SHADOW = false;

        GAME.render(false);
        GAME.started = true;
        GAME.WebGL_settings();
        GAME.levelStart();
    },
    setStartPositionFromStart(map = GAME.activeMap()) {
        map.startPosition = new Pointer_3DGrid(
            map.GA.indexToGrid(map.start[0]),
            Vector.fromInt(map.start[1])
        );

        return map.startPosition;
    },
    WebGL_settings() {
        WebGL.setAmbientStrength(0.1);
        WebGL.setDiffuseStrength(0.5);

        WebGL.INI.BACKGROUND_ALPHA = 0.0;
        WebGL.USE_SHADOW = false;
        WebGL.USE_INTERACTION = false;
        WebGL.NO_TOP_CEILING = true;
        WebGL.FIRST_PERSON_DUAL_DISPLAY = true;
        WebGL.VIEWS_ALLOWED = new Set([1, 3]);

        if (typeof INI !== "undefined" && Number.isFinite(INI.HERO_HEIGHT)) WebGL.INI.HERO_HEIGHT = INI.HERO_HEIGHT;

        //WebGL.CONFIG.setMovementMode("surface");
    },
    activeMap() {
        return $MAP.map;
    },
    syncLegacyLevel(level = GAME.level, map = GAME.activeMap()) {
        if (!level) level = "Demo";
        if (!MAP[level]) {
            MAP[level] = {
                name: "MapEditor scratch level"
            };
        }

        MAP[level].map = map;
        MAP[level].world = map.world || null;
        return map;
    },
    ensureMapArrays(map = GAME.activeMap()) {
        if (!map) throw new Error("ensureMapArrays: missing map");

        for (const prop of ($MAP.properties || [])) {
            if (!Array.isArray(map[prop])) map[prop] = [];
        }

        for (const list of ($MAP.lists || [])) {
            if (!Array.isArray(map[list])) map[list] = [];
        }

        return map;
    },
    adoptMap(map, level = GAME.level) {
        if (!map || !map.GA) throw new Error("adoptMap: expected a map with GA");

        $MAP.map = map;
        $MAP.width = map.GA.width;
        $MAP.height = map.GA.height;
        $MAP.depth = map.GA.depth || 1;

        $("#horizontalGrid").val($MAP.width);
        $("#verticalGrid").val($MAP.height);

        GAME.ensureMapArrays(map);
        GAME.ensureTerrain();
        GAME.syncLegacyLevel(level, map);

        return map;
    },
    loadLevel(level) {
        GAME.level = level;
        MAP_TOOLS.unpack(level);

        if (!MAP[level] || !MAP[level].map) throw new Error(`loadLevel: MAP[${level}].map was not created by MAP_TOOLS.unpack`);
        const map = GAME.adoptMap(MAP[level].map, level);

        if (INI.USE_NOISE_FUNCTIONS) {

            if (!map.terrain && MAP[level].terrain) map.terrain = typeof MAP[level].terrain === "string" ? JSON.parse(MAP[level].terrain) : MAP[level].terrain;
            GAME.ensureTerrain();

            if (map.terrain.direction?.parameters && map.terrain.width?.parameters && map.terrain.slope?.parameters) {
                NOISE_FUNCTION.writeParsToForm();
            } else {
                NOISE_FUNCTION.generate_terrain();
            }
        }

        return map;
    },
    levelStart() {
        const map = GAME.activeMap();
        if (!map || !map.GA) throw new Error("levelStart: no active $MAP.map");
        GAME.initLevel(GAME.level);
        //WebGL.render2DScene(map);
    },
    initLevel(level) {
        const map = GAME.activeMap();

        GAME.syncLegacyLevel(level, map);
        GAME.ensureMapArrays(map);
        if (INI.USE_TERRAIN) GAME.ensureTerrain();
        if (!map.startPosition) GAME.setStartPositionFromStart(map);

        WebGL.MOUSE.initialize("ROOM");
        WebGL.setContext("webgl");
        GAME.buildWorld(level, map);                                        // Build surface FIRST, because hero placement depends on quadMap/zMap.

        const start_dir = map.startPosition.vector;
        const start_grid = Grid.toClass(map.startPosition.grid);
        HERO.player = new $2D_player(start_grid, start_dir, HERO_TYPE.Booga, map.GA, map);

        GAME.setCameraView();
        GAME.setWorld(map);
        console.info("MapEditor init completed", map);
    },
    buildWorld(level = GAME.level, map = GAME.activeMap()) {
        console.warn("building MapEditor world", { level, map });

        GAME.syncLegacyLevel(level, map);
        WebGL.init_required_IAM(map, HERO);

        if (INI.USE_QUAD_MAP) {
            map.quadMap = QUAD_MAP.create(map.GA, map.terrain);
            map.zMap = QUAD_MAP.create_zMap(map.quadMap, map.GA);
            map.zMap1 = QUAD_MAP.create_zMap(map.quadMap, map.GA, 1);
        }

        if (typeof SPAWN_TOOLS !== "undefined" && SPAWN_TOOLS.spawn) SPAWN_TOOLS.spawn(level);

        if (INI.USE_OCCLUSION_MAP) GAME.rebuildOcclusionMap(map);
        //map.world = WORLD.buildSurfaceBasedWorld(map);
        map.world = WORLD.build(map);
        MAP[level].world = map.world;

        return map.world;
    },
    setWorld(map = GAME.activeMap(), decalsAreSet = false) {
        console.log("setting MapEditor world", { map: map });
        console.time("setWorld");

        const textureData = {
            wall: TEXTURE[$("#walltexture")[0].value],
            floor: TEXTURE[$("#floortexture")[0].value],
            frontPanorama: TEXTURE[$("#frontPanorama")[0].value],
            leftPanorama: TEXTURE[$("#leftPanorama")[0].value],
            rightPanorama: TEXTURE[$("#rightPanorama")[0].value],
            backPanorama: TEXTURE[$("#backPanorama")[0].value],
            archPanorama: TEXTURE[$("#archPanorama")[0].value],
            skyPanorama: TEXTURE[$("#skyPanorama")[0].value],
            floorPanorama: TEXTURE.SnowFloorPanoramaTexture,                    //fixed
        };

        WebGL.updateShaders();
        //const viewObject = WebGL.CONFIG.firstperson ? WebGL.hero.player : WebGL.hero.topCamera;
        WebGL.init2D('webgl');
        console.timeEnd("setWorld");
    },
    renderQuadMap(paint = true) {
        if (!INI.USE_QUAD_MAP) return;
        const map = GAME.activeMap();
        if (!map || !map.GA) throw new Error("renderQuadMap: no active map/GA");

        GAME.ensureTerrain();
        const GA = map.GA;
        const QM = QUAD_MAP.create(GA, map.terrain);
        map.quadMap = QM;
        map.zMap = QUAD_MAP.create_zMap(QM, GA);
        map.zMap1 = QUAD_MAP.create_zMap(QM, GA, INI.OCCLUSION_RESOLUTION);

        if (paint) {
            QUAD_MAP.paintTopDown(QM, "surface");
            QUAD_MAP.paintSideSlope(QM, "sideslope");
            QUAD_MAP.paintZMap(map.zMap, "zmap");
        }

        return QM;
    },
    rebuildOcclusionMap(map = GAME.activeMap()) {
        if (!USE_OCCLUSION_MAP) return;
        if (!map || !map.zMap1) throw new Error("rebuildOcclusionMap: map.zMap1 missing");

        const zMap = map.zMap1;
        const pixelData = QUAD_MAP.toTextureMap(zMap);
        const texDepth = 1;

        if (map.occlusionMap?.texture && WebGL.CTX) WebGL.CTX.deleteTexture(map.occlusionMap.texture);

        map.textureMap = pixelData;
        map.occlusionMap = {
            texture: WebGL.createOcclusionTexture3D(pixelData, zMap.xSize, zMap.ySize, texDepth),
            size: new Float32Array([zMap.xSize, zMap.ySize, texDepth]),
            originXZ: new Float32Array([zMap.minX, zMap.minY]),
            resolution: zMap.resolution,
            zMap: zMap,
        };

        return map.occlusionMap;
    },
    assertRenderableMap(map = GAME.activeMap()) {
        if (!map) throw new Error("render map missing");
        if (!map.GA) throw new Error("render map missing GA");
        if (!map.quadMap) throw new Error("render map missing quadMap");
        if (!map.zMap1) throw new Error("render map missing zMap1");
        if (!map.world) throw new Error("render map missing world");
        if (!map.occlusionMap) throw new Error("render map missing occlusionMap");
        if (!map.occlusionMap.texture) throw new Error("render map occlusionMap missing texture");
        if (!map.occlusionMap.size) throw new Error("render map occlusionMap missing size");
        if (!map.occlusionMap.originXZ) throw new Error("render map occlusionMap missing originXZ");
        if (!Number.isFinite(map.occlusionMap.resolution)) throw new Error("render map occlusionMap has invalid resolution");

    },
    setCameraView() {
        WebGL.hero.camera2D = new $2D_Camera(ENGINE.gameWIDTH, ENGINE.gameHEIGHT);
        WebGL.camera = WebGL.hero.camera2D;
    },
    setup() {
        console.chapter("GAME SETUP started");

        GAME.updateWH();
        $(ENGINE.gameWindowId).width(ENGINE.gameWIDTH + 4);

        ENGINE.addBOX("ROOM", ENGINE.gameWIDTH, ENGINE.gameHEIGHT, ["pacgrid",
            "wall",
            "hint",
            "mask",
            "paintedmask",
            "decals",
            "final",
            "coord", "grid",
            "click"], null);

        if (INI.USE_NOISE_FUNCTIONS) {
            ENGINE.addBOX("ZMAP", 2048, 256, ["zmap"], null);
            ENGINE.addBOX("SURFACE", 2048, 256, ["surface"], null);
            ENGINE.addBOX("DIRECTION", 2048, 128, ["direction"], null);
            ENGINE.addBOX("WIDTH", 2048, 128, ["width"], null);
            ENGINE.addBOX("SLOPE", 2048, 128, ["slope"], null);
            ENGINE.addBOX("SIDE_SLOPE", 2048, 768, ["sideslope"], null);
        }
        ENGINE.addBOX("WEBGL", 1024, 768, ["3d_webgl"], null);

        $("#buttons").append("<input type='button' id='new' value='New'>");
        $("#buttons").append("<input type='button' id='export' value='Export'>");
        $("#buttons").append("<input type='button' id='import' value='Import'>");
        $("#buttons").append("<input type='button' id='copy' value='MAP to Clipboard' class='green_button'>");
        $("#buttons").append("<input type='button' id='create_mask' value='Create Mask' class='red_button'>");
        $("#buttons").append("<input type='button' id='download_mask' value='DownloadImgs'>");
        $("#buttons").append("<input type='button' id='copy_mask' value='MASK to Clipboard' class='blue_button'>");
        $("#buttons").append("<input type='button' id='copy_decal' value='DECAL to Clipboard' class='green_button'>");
        $("#buttons").append("<input type='button' id='textured_mask' value='TextureToMask'>");

        $("#gridsize").on("change", GAME.render);

        //fill_value
        $("#fill_value").append(`<option value="${MAPDICT.EMPTY}">Space</option>`);
        $("#fill_value").append(`<option value="${MAPDICT.HOLE}">Hole</option>`);
        $("#fill_value").append(`<option value="${MAPDICT.WALL}">Wall</option>`);
        $("#fill_value").append(`<option value="${MAPDICT.MASK}">Mask</option>`);

        //textures
        for (const prop of TEXTURE_LIST) {
            $("#walltexture").append(`<option value="${prop}">${prop}</option>`);
            $("#floortexture").append(`<option value="${prop}">${prop}</option>`);
            $("#texture_decal").append(`<option value="${prop}">${prop}</option>`);
        }

        LAYER.wallcanvas = $("#wallcanvas")[0].getContext("2d");
        LAYER.floorcanvas = $("#floorcanvas")[0].getContext("2d");
        LAYER.texturecanvas = $("#texturecanvas")[0].getContext("2d");


        $("#walltexture").change(GAME.updateTextures);
        $("#floortexture").change(GAME.updateTextures);
        $("#texture_decal").change(GAME.updateTextures);

        //panorama
        for (const prop of PANORAMA_DECALS) {
            $("#frontPanorama").append(`<option value="${prop}">${prop}</option>`);
            $("#leftPanorama").append(`<option value="${prop}">${prop}</option>`);
            $("#rightPanorama").append(`<option value="${prop}">${prop}</option>`);
            $("#backPanorama").append(`<option value="${prop}">${prop}</option>`);
        }

        LAYER.frontPanoramaCanvas = $("#frontPanoramaCanvas")[0].getContext("2d");
        LAYER.leftPanoramaCanvas = $("#leftPanoramaCanvas")[0].getContext("2d");
        LAYER.rightPanoramaCanvas = $("#rightPanoramaCanvas")[0].getContext("2d");
        LAYER.backPanoramaCanvas = $("#backPanoramaCanvas")[0].getContext("2d");

        $("#frontPanorama").change(GAME.updateTextures);
        $("#leftPanorama").change(GAME.updateTextures);
        $("#rightPanorama").change(GAME.updateTextures);
        $("#backPanorama").change(GAME.updateTextures);

        //arch
        for (const prop of ARCH_DECALS) {
            $("#archPanorama").append(`<option value="${prop}">${prop}</option>`);
        }
        LAYER.archPanoramaCanvas = $("#archPanoramaCanvas")[0].getContext("2d");
        $("#archPanorama").change(GAME.updateTextures);

        //sky
        for (const prop of SKY_DECALS) {
            $("#skyPanorama").append(`<option value="${prop}">${prop}</option>`);
        }
        LAYER.skyPanoramaCanvas = $("#skyPanoramaCanvas")[0].getContext("2d");
        $("#skyPanorama").change(GAME.updateTextures);


        GAME.updateTextures();                  //common to textures and panorama

        /** mask elements */
        if (MASK_ELEMENTS.length > 0) {
            for (const pic of MASK_ELEMENTS) {
                $("#mask_element").append(`<option value="${pic}">${pic}</option>`);
            }

            $("#mask_element, #mask_rotation, #mask_flip").on("change",
                () => {
                    ENGINE.drawRotatedToId("maskcanvas", 0, 0, SPRITE[$("#mask_element").val()], parseInt($("#mask_rotation").val(), 10) || 0, true, parseInt($("#mask_flip").val(), 10) || 0);
                    ENGINE.drawRotatedToId("maskdecalcanvas", 0, 0, SPRITE[$("#mask_decal").val()], parseInt($("#mask_rotation").val(), 10) || 0, true, parseInt($("#mask_flip").val(), 10) || 0);
                });

            $("#mask_element").trigger("change");
        }

        if (MASK_DECALS.length > 0) {
            for (const pic of MASK_DECALS) {
                $("#mask_decal").append(`<option value="${pic}">${pic}</option>`);
            }
            $("#mask_decal").on("change",
                () => {
                    ENGINE.drawRotatedToId("maskdecalcanvas", 0, 0, SPRITE[$("#mask_decal").val()], parseInt($("#mask_rotation").val(), 10) || 0, true, parseInt($("#mask_flip").val(), 10) || 0);
                });
            $("#mask_decal").trigger("change");
        }

        /** pictures */
        if (DECAL_PAINTINGS.length > 0) {
            for (const pic of DECAL_PAINTINGS) {
                $("#picture_decal").append(`<option value="${pic}">${pic}</option>`);
            }
            $("#picture_decal").change(function () {
                ENGINE.drawToId("picturecanvas", 0, 0, ENGINE.conditionalResize(SPRITE[$("#picture_decal")[0].value], INI.CANVAS_RESOLUTION));
            });
            $("#picture_decal").trigger("change");
        }

        /** crests */
        if (DECAL_CRESTS.length > 0) {
            for (const crest of DECAL_CRESTS) {
                $("#crest_decal").append(`<option value="${crest}">${crest}</option>`);
            }
            $("#crest_decal").change(function () {
                ENGINE.drawToId("crestcanvas", 0, 0, ENGINE.conditionalResize(SPRITE[$("#crest_decal")[0].value], INI.CANVAS_RESOLUTION));
            });
            $("#crest_decal").trigger("change");
        }

        /** lights */
        if (LIGHT_DECALS.length > 0) {
            for (const light of LIGHT_DECALS) {
                $("#light_decal").append(`<option value="${light}">${light}</option>`);
            }
            $("#light_decal").change(function () {
                ENGINE.drawToId("lightcanvas", 0, 0, ENGINE.conditionalResize(SPRITE[$("#light_decal")[0].value], INI.CANVAS_RESOLUTION));
            });
            $("#light_decal").trigger("change");
        }

        for (const light in LIGHT_COLORS) {
            $("#lighttype").append(`<option value="${light}">${light}</option>`);
        }
        GAME.printLightDetails();
        $("#lighttype").change(GAME.printLightDetails);

        for (const material in MATERIAL) {
            if (material !== "VERSION") {
                $("#materialtype").append(`<option value="${material}">${material}</option>`);
            }
        }
        GAME.printMaterialDetails();
        $("#materialtype").change(GAME.printMaterialDetails);

        /** randoms */

        $("#randwall").click(GAME.randomTexture.bind(null, TEXTURE_LIST, "#walltexture", "wallcanvas"));
        $("#randfloor").click(GAME.randomTexture.bind(null, TEXTURE_LIST, "#floortexture", "floorcanvas"));

        $("#randFrontPanorama").click(GAME.randomTexture.bind(null, PANORAMA_DECALS, "#frontPanorama", "frontPanoramaCanvas"));
        $("#randLeftPanorama").click(GAME.randomTexture.bind(null, PANORAMA_DECALS, "#leftPanorama", "leftPanoramaCanvas"));
        $("#randRightPanorama").click(GAME.randomTexture.bind(null, PANORAMA_DECALS, "#rightPanorama", "rightPanoramaCanvas"));
        $("#randBackPanorama").click(GAME.randomTexture.bind(null, PANORAMA_DECALS, "#backPanorama", "backPanoramaCanvas"));
        $("#randArchPanorama").click(GAME.randomTexture.bind(null, ARCH_DECALS, "#archPanorama", "archPanoramaCanvas"));
        $("#randSkyPanorama").click(GAME.randomTexture.bind(null, SKY_DECALS, "#skyPanorama", "skyPanoramaCanvas"));

        $("#randpic").click(GAME.randomPic);
        $("#randcrest").click(GAME.randomCrest);
        $("#randlight").click(GAME.randomLight);

        /** search inputs */
        const filterOptions = (selectId, searchId) => {
            const filter = $(searchId).val().toLowerCase();

            $(`${selectId} option`).each((_, option) => {
                const text = $(option).text().toLowerCase();
                $(option).toggle(text.includes(filter));
            });
        };

        $('#searchDecalTexture').on('keyup', () => filterOptions("#texture_decal", "#searchDecalTexture"));
        $('#searchDecals').on('keyup', () => filterOptions("#crest_decal", "#searchDecals"));
        $('#searchPics').on('keyup', () => filterOptions("#picture_decal", "#searchPics"));
        $('#searchLights').on('keyup', () => filterOptions("#light_decal", "#searchLights"));
        $('#searchWall').on('keyup', () => filterOptions("#walltexture", "#searchWall"));
        $('#searchFloor').on('keyup', () => filterOptions("#floortexture", "#searchFloor"));
        $('#searchFrontPanorama').on('keyup', () => filterOptions("#frontPanorama", "#searchFrontPanorama"));
        $('#searchLeftPanorama').on('keyup', () => filterOptions("#leftPanorama", "#searchLeftPanorama"));
        $('#searchRightPanorama').on('keyup', () => filterOptions("#rightPanorama", "#searchRightPanorama"));
        $('#searchBackPanorama').on('keyup', () => filterOptions("#backPanorama", "#searchBackPanorama"));
        $('#searchArchPanorama').on('keyup', () => filterOptions("#archPanorama", "#searchArchPanorama"));
        $('#searchSkyPanorama').on('keyup', () => filterOptions("#skyPanorama", "#searchSkyPanorama"));
        $('#searchMasks').on('keyup', () => filterOptions("#mask_element", "#searchMasks"));
        $('#searchMasksDecals').on('keyup', () => filterOptions("#mask_decal", "#searchMasksDecals"));

        /** shortcuts */

        $(document).keydown((event) => {
            switch (event.key) {
                case 'F8':
                    GAME.randomPic();
                    GAME.randomCrest();
                    GAME.randomLight();
                    break;
                default:
                    break;
            }
        });

        /** noise functions */
        GAME.ensureTerrain();

        $("#dir_generate").click(function () {
            NOISE_FUNCTION.direction_noise_preview();
            GAME.render();
        });

        $("#width_generate").click(function () {
            NOISE_FUNCTION.width_noise_preview();
            GAME.render();
        });

        $("#slope_generate").click(function () {
            NOISE_FUNCTION.slope_noise_preview();
            GAME.render();
        });

        console.log("GAME SETUP completed");
    },
    getResolution(texture) {
        if (!texture) return null;
        return [texture.width, texture.height];
    },
    randomTexture(TextureList, id, canvas) {
        const texture = TextureList.chooseRandom();
        $(id).val(texture).change();
        ENGINE.drawToId(canvas, 0, 0, ENGINE.conditionalResize(TEXTURE[$(id)[0].value], 320));
    },
    randomLight() {
        const search_light = $('#searchLights').val().toLowerCase();
        const filtered_light_decals = LIGHT_DECALS.filter(decal => decal.toLowerCase().includes(search_light));
        const pic = filtered_light_decals.chooseRandom();
        if (!pic) return;
        $("#light_decal").val(pic).change();
        ENGINE.drawToId("lightcanvas", 0, 0, ENGINE.conditionalResize(SPRITE[$("#light_decal")[0].value], INI.CANVAS_RESOLUTION));
    },
    randomPic() {
        const search_pic = $('#searchPics').val().toLowerCase();
        const filtered_pics = DECAL_PAINTINGS.filter(decal => decal.toLowerCase().includes(search_pic));
        const pic = filtered_pics.chooseRandom();
        if (!pic) return;
        $("#picture_decal").val(pic).change();
        ENGINE.drawToId("picturecanvas", 0, 0, ENGINE.conditionalResize(SPRITE[$("#picture_decal")[0].value], INI.CANVAS_RESOLUTION));
    },
    randomCrest() {
        const search_crest = $('#searchDecals').val().toLowerCase();
        const filtered_crests = DECAL_CRESTS.filter(crest => crest.toLowerCase().includes(search_crest));
        const pic = filtered_crests.chooseRandom();
        if (!pic) return;
        $("#crest_decal").val(pic).change();
        ENGINE.drawToId("crestcanvas", 0, 0, ENGINE.conditionalResize(SPRITE[$("#crest_decal")[0].value], INI.CANVAS_RESOLUTION));
    },
    updateTextures(restart = true) {
        //if (!INI.USE_TEXTURES) return;

        const wallTexture = TEXTURE[$("#walltexture")[0].value];
        const floorTexture = TEXTURE[$("#floortexture")[0].value];
        const textureTexture = TEXTURE[$("#texture_decal")[0].value];

        ENGINE.resizeAndFill(LAYER.wallcanvas, wallTexture, INI.TEXTURE_RESOLUTION);
        ENGINE.resizeAndFill(LAYER.floorcanvas, floorTexture, INI.TEXTURE_RESOLUTION);
        ENGINE.resizeAndFill(LAYER.texturecanvas, textureTexture, INI.CANVAS_RESOLUTION);

        const frontPanorama = TEXTURE[$("#frontPanorama")[0].value];
        const leftPanorama = TEXTURE[$("#leftPanorama")[0].value];
        const rightPanorama = TEXTURE[$("#rightPanorama")[0].value];
        const backPanorama = TEXTURE[$("#backPanorama")[0].value];
        const archPanorama = TEXTURE[$("#archPanorama")[0].value];
        const skyPanorama = TEXTURE[$("#skyPanorama")[0].value];

        ENGINE.resizeAndFill(LAYER.frontPanoramaCanvas, frontPanorama, INI.TEXTURE_RESOLUTION);
        ENGINE.resizeAndFill(LAYER.leftPanoramaCanvas, leftPanorama, INI.TEXTURE_RESOLUTION);
        ENGINE.resizeAndFill(LAYER.rightPanoramaCanvas, rightPanorama, INI.TEXTURE_RESOLUTION);
        ENGINE.resizeAndFill(LAYER.backPanoramaCanvas, backPanorama, INI.TEXTURE_RESOLUTION);
        ENGINE.resizeAndFill(LAYER.archPanoramaCanvas, archPanorama, INI.TEXTURE_RESOLUTION);
        ENGINE.resizeAndFill(LAYER.skyPanoramaCanvas, skyPanorama, INI.TEXTURE_RESOLUTION);

        const ids = [
            "wall_resolution",
            "floor_resolution",
            "frontPanorama_resolution",
            "leftPanorama_resolution",
            "rightPanorama_resolution",
            "backPanorama_resolution",
            "archPanorama_resolution",
            "skyPanorama_resolution"
        ];

        const textures = [
            wallTexture,
            floorTexture,
            frontPanorama,
            leftPanorama,
            rightPanorama,
            backPanorama,
            archPanorama,
            skyPanorama
        ];

        for (const [i, pTexture] of textures.entries()) {
            const res = GAME.getResolution(pTexture);
            if (res) $(`#${ids[i]}`).html(`width: ${res[0]}, height: ${res[1]}`);
        }

        /*if (restart && GAME.started && $MAP.map?.GA) {
            GAME.levelStart();
        }*/
    },
    repaintTextures() {
        GAME.updateTextures();
    },
    updateWH() {
        if (isNaN(parseInt($("#verticalGrid").val(), 10))) $("#verticalGrid").val(32);
        if (isNaN(parseInt($("#horizontalGrid").val(), 10))) $("#horizontalGrid").val(24);
        if (isNaN(parseInt($("#depthGrid").val(), 10))) $("#depthGrid").val(1);
        if (isNaN(parseInt($("#gridsize").val(), 10))) $("#gridsize").val(32);
        if ($("#verticalGrid").val() > INI.MAXINT) $("#verticalGrid").val(INI.MAXINT);
        if ($("#verticalGrid").val() < INI.MININT) $("#verticalGrid").val(INI.MININT);
        if ($("#horizontalGrid").val() > INI.MAXINT) $("#horizontalGrid").val(INI.MAXINT);
        if ($("#horizontalGrid").val() < INI.MININT) $("#horizontalGrid").val(INI.MININT);

        if ($("#gridsize").val() < INI.MIN_GRID) $("#gridsize").val(INI.MIN_GRID);
        if ($("#gridsize").val() > INI.MAX_GRID) $("#gridsize").val(INI.MAX_GRID);

        ENGINE.INI.GRIDPIX = parseInt($("#gridsize").val(), 10);
        //change grids
        if ($("#horizontalGrid").val() * ENGINE.INI.GRIDPIX > INI.SPACE_X) {
            $("#horizontalGrid").val(Math.floor(INI.SPACE_X / ENGINE.INI.GRIDPIX));
        }
        if ($("#verticalGrid").val() * ENGINE.INI.GRIDPIX > INI.SPACE_Y) {
            $("#verticalGrid").val(Math.floor(INI.SPACE_Y / ENGINE.INI.GRIDPIX));
        }

        ENGINE.gameHEIGHT = $("#verticalGrid").val() * ENGINE.INI.GRIDPIX;
        ENGINE.gameWIDTH = $("#horizontalGrid").val() * ENGINE.INI.GRIDPIX;
        $("#ENGINEgameWIDTH").html(ENGINE.gameWIDTH);
        $("#ENGINEgameHEIGHT").html(ENGINE.gameHEIGHT);
        $("#spacex").html(INI.SPACE_X);
        $("#spacey").html(INI.SPACE_Y);
        GAME.resize();
    },
    resize() {
        $MAP.width = $("#horizontalGrid").val();
        $MAP.height = $("#verticalGrid").val();
    },
    mouseClick(event) {
        ENGINE.readMouse(event);
        let x = Math.floor(ENGINE.mouseX / ENGINE.gameWIDTH * $MAP.width);
        let y = Math.floor(ENGINE.mouseY / ENGINE.gameHEIGHT * $MAP.height);
        const dimension = 1;

        const radio = $("#paint input[name=painter]:checked").val();
        let GA = $MAP.map.GA;
        let dir, nameId, type, dirIndex, dirs, grid;

        grid = new Grid3D(x, y, GAME.floor);
        let currentValue = GA.getValue(grid);
        let gridIndex = GA.gridToIndex(grid);

        console.warn("mouseClick", grid, "radio", radio, "currentValue", currentValue, "gridIndex", gridIndex, "floor", GAME.floor);

        switch (radio) {

            case 'flip':
                if (GA.isWall(grid)) {
                    GA.carveDot(grid);
                } else {
                    GA.toWall(grid);
                }
                $("#error_message").html("All is fine");
                break;

            case "space":
                GA.carveDot(grid);
                if ($("input[name=floor_support]:checked").val()) {
                    if (grid.z > 0) {
                        grid.z--;
                        GA.toWall(grid);
                    }
                }
                $("#error_message").html("All is fine");
                break;

            case "wall":
                GA.toWall(grid);
                if ($("input[name=ceil_support]:checked").val()) {
                    console.log(grid, dimension);
                    if (grid.z < $MAP.map.depth - 1) {
                        grid.z++;
                        GA.carveDot(grid);
                        console.log("carving space above", grid);
                    }
                }
                $("#error_message").html("All is fine");
                break;

            case "hole":
                GAME.clearGrid(gridIndex);
                GA.toHole(grid);
                $("#error_message").html("All is fine");
                break;

            case "door":
                if (GA.notWall(grid)) {
                    GAME.clearGrid(gridIndex);
                    GA.toDoor(grid);
                    $MAP.map.doors.push(gridIndex);
                    $("#error_message").html("All is fine");
                } else {
                    $("#error_message").html("You can't make door in the wall!");
                }
                break;

            case "reserve":
                GAME.clearGrid(gridIndex);
                GA.iSetValue(gridIndex, 0);             // set to empty
                GA.reserve(grid);
                $("#error_message").html("All is fine");
                break;

            case "pillar":
                GA.toPillar(grid);
                $("#error_message").html("All is fine");
                break;

            case "decal":
                switch (currentValue) {
                    case MAPDICT.EMPTY:
                    case MAPDICT.BLOCKWALL:
                        dir = NOWAY;
                        [nameId, type] = GAME.getSelectedDecal();
                        break;
                    case MAPDICT.WALL:
                        dir = GAME.getSelectedDir();
                        if (dir.same(NOWAY)) {
                            $("#error_message").html("Wall decal needs direction");
                            return;
                        }
                        [nameId, type] = GAME.getSelectedDecal();
                        break;
                    default:
                        $("#error_message").html(`Decal placement not supported on value: ${currentValue}`);
                        return;
                }

                dirIndex = dir.toInt();
                $("#error_message").html("All is fine");
                GAME.assertUniqueDecalPosition(gridIndex, dirIndex, $MAP.map.decals);
                $MAP.map.decals.push(Array(gridIndex, dirIndex, nameId, type));
                break;

            case "light":
                console.log("light, value", currentValue, "grid", grid);
                switch (currentValue) {
                    case MAPDICT.HOLE:
                    case MAPDICT.WALL:
                        dir = GAME.getSelectedDir();
                        console.log(".dir", dir);
                        if (dir.same(NOWAY)) {
                            $("#error_message").html("Light decal needs direction");
                            return;
                        }
                        dirIndex = dir.toInt();
                        nameId = $("#light_decal")[0].value;
                        type = $("#lighttype")[0].value;
                        $MAP.map.lights.push(Array(gridIndex, dirIndex, nameId, type));
                        break;
                    default:
                        $("#error_message").html(`Light placement not supported on value: ${currentValue}`);
                        return;
                }
                $("#error_message").html("All is fine");
                break;

            case "cleargrid":
                GAME.clearGrid(gridIndex);
                $("#error_message").html("All is fine: grid cleared");
                break;

            case "start":
                switch (currentValue) {
                    case MAPDICT.EMPTY:
                    case MAPDICT.HOLE:
                        dir = GAME.getSelectedDir();
                        if (dir.same(NOWAY)) {
                            $("#error_message").html("Start needs direction");
                            return;
                        }
                        dirIndex = dir.toInt();
                        $MAP.map.start = [gridIndex, dirIndex];
                        break;
                    default:
                        $("#error_message").html(`Start placement not supported on value: ${currentValue}`);
                        return;
                }
                $("#error_message").html("All is fine");
                break;

            case "fill":
                if (GAME.stack.previousRadio === radio) {
                    GAME.stack.fillCount++;
                } else GAME.stack.fillCount = 1;

                if (GAME.stack.fillCount > 2) {
                    GAME.stack.fillCount = 1;
                    GAME.stack.elementBuilt = null;
                }

                const fill_value = $("#fill_value")[0].value;

                console.log("FILL,", grid, fill_value, "fill->", GAME.stack.fillCount);

                switch (GAME.stack.fillCount) {
                    case 1:
                        GAME.stack.startGrid = grid;
                        break;

                    case 2:
                        //success
                        GAME.stack.endGrid = grid;

                        const txt = GAME.fillArea(GAME.stack.startGrid, GAME.stack.endGrid, fill_value);
                        if (txt) $("#error_message").html(txt);

                        break;

                }
                break;

            case "maskpaint":
                switch (currentValue) {
                    case MAPDICT.MASK:
                        const elIndex = MASK_ELEMENTS.indexOf($("#mask_element")[0].value);
                        const rotation = parseInt($("#mask_rotation")[0].value, 10);
                        const image = $(`#maskcanvas`)[0].getContext("2d").canvas;
                        const flip = parseInt($("#mask_flip")[0].value, 10);
                        $MAP.mask_moves.push([gridIndex, rotation, elIndex, flip]);
                        $("#mask_moves_exp").html(JSON.stringify($MAP.mask_moves));
                        break;
                    default:
                        $("#error_message").html(`Mask not supported on value: ${currentValue}`);
                        return;
                }
                break;

            case "deletemask":
                for (let [index, mask] of $MAP.mask_moves.entries()) {
                    if (mask[0] === gridIndex) {
                        console.warn(`removing ${MASK_ELEMENTS[mask[2]]} at gridIndex ${gridIndex}.`);
                        $MAP.mask_moves.splice(index, 1);
                        break;
                    }
                }
                $("#mask_moves_exp").html(JSON.stringify($MAP.mask_moves));
                break;

            case "maskdecalpaint":
                console.warn("HERE");
                switch (currentValue) {
                    case MAPDICT.MASK:
                    case MAPDICT.WALL:
                    case MAPDICT.EMPTY:
                        const elIndex = MASK_DECALS.indexOf($("#mask_decal")[0].value);
                        const rotation = parseInt($("#mask_rotation")[0].value, 10);
                        const image = $(`#maskdecalcanvas`)[0].getContext("2d").canvas;
                        const flip = parseInt($("#mask_flip")[0].value, 10);
                        $MAP.mask_decal_moves.push([gridIndex, rotation, elIndex, flip]);
                        $("#mask_decal_moves_exp").html(JSON.stringify($MAP.mask_decal_moves));
                        break;
                    default:
                        $("#error_message").html(`Mask not supported on value: ${currentValue}`);
                        return;
                }
                break;

            case "deletemaskdecal":
                for (let [index, mask] of $MAP.mask_decal_moves.entries()) {
                    if (mask[0] === gridIndex) {
                        console.warn(`removing ${MASK_DECALS[mask[2]]} at gridIndex ${gridIndex}.`);
                        $MAP.mask_decal_moves.splice(index, 1);
                        break;
                    }
                }
                $("#mask_decal_moves_exp").html(JSON.stringify($MAP.mask_decal_moves));
                break;
        }

        GAME.stack.previousRadio = radio;
        GAME.render();
    },
    downloadMask() {
        const RoomID = $("#roomid")[0].value;
        const gs = parseInt($("#gridsize").val(), 10);
        if (gs !== 64) console.error("Image size usuitable for mask, gs", gs);
        ENGINE.mergeLayerStack(["paintedmask", "decals"], "final");
        ENGINE.saveCTXAsPNG(LAYER.mask, `mask_level_${RoomID}.png`);
        ENGINE.saveCTXAsPNG(LAYER.final, `final_level_${RoomID}.png`);
    },
    createMask() {
        const OK = confirm("Sure? Current mask will be lost.");
        if (!OK) return;
        console.warn("creating mask");
        $MAP.mask_moves.clear();
        $("#mask_moves_exp").html(JSON.stringify($MAP.mask_moves));
        ENGINE.BLOCKGRID3D.drawMask(LAYER.mask, $MAP.map);
    },
    maskVisibility() {
        if ($("input[name='mask']")[0].checked) {
            $("canvas[title = 'mask']").show();
        } else $("canvas[title = 'mask']").hide();
    },
    paintMask() {
        ENGINE.BLOCKGRID3D.drawMask(LAYER.mask, $MAP.map);
        const gs = parseInt($("#gridsize").val(), 10);
        const maskCanvasId = $("#ROOM canvas[title='mask']").attr("id");

        for (const [i, mask] of $MAP.mask_moves.entries()) {
            const gridIndex = mask[0];
            const rotation = mask[1];
            const element = MASK_ELEMENTS[mask[2]];
            const flip = mask[3];
            const grid = $MAP.map.GA.indexToGrid(gridIndex);
            const p = GRID.gridToCoord(grid, gs);
            const image = SPRITE[element];
            ENGINE.drawRotatedToId(maskCanvasId, p.x, p.y, image, rotation, false, flip, gs);
        }
    },
    paintMaskDecals() {
        const gs = parseInt($("#gridsize").val(), 10);
        const maskDecalCanvasId = $("#ROOM canvas[title='decals']").attr("id");

        for (const [i, mask] of $MAP.mask_decal_moves.entries()) {
            const gridIndex = mask[0];
            const rotation = mask[1];
            const element = MASK_DECALS[mask[2]];
            const flip = mask[3];
            const grid = $MAP.map.GA.indexToGrid(gridIndex);
            const p = GRID.gridToCoord(grid, gs);
            const image = SPRITE[element];
            ENGINE.drawRotatedToId(maskDecalCanvasId, p.x, p.y, image, rotation, false, flip, gs);
        }
    },
    render(refresh3D = true) {
        const radio = $("#selector input[name=renderer]:checked").val();

        switch (radio) {
            case "block":
                GAME.blockGrid3D();
                break;
        }

        if ($("input[name='grid']")[0].checked) {
            GRID.grid();
        }

        if ($("input[name='coord']")[0].checked) {
            GRID.paintCoord3D(
                "coord",
                $MAP.map,
                GAME.floor,
                $("input[name='all_coord']")[0].checked
            );
        }

        GAME.resizeGL_window();
        if (INI.USE_QUAD_MAP) GAME.renderQuadMap(true);
        if (INI.USE_MASK) {
            GAME.paintMask();
            GAME.paintMaskDecals();

        }

        // refresh3D !== false is intentional:
        // jQuery event objects passed by click/change handlers should still count as "true".

        /*if (refresh3D !== false && GAME.started && $MAP.map?.GA) {
            GAME.levelStart();
        }*/

    },
    stack: {
        fillCount: 0,
        elementBuilt: null,
        startGrid: null,
        endGrid: null,
    },
    fillArea(from, to, fillValue) {
        const W = to.x - from.x;
        const H = to.y - from.y;
        if (to.z !== from.z) return "Needs to be same slice depth.";
        if (H < 0 || W < 0) return "At least one dimension is negative!";
        console.info("fillArea", from.x, from.y, W, H, from.z, fillValue);
        $MAP.map.GA.fillArea(from.x, from.y, W, H, from.z, fillValue);
        return null;
    },
    clearGrid(gridIndex) {
        $MAP.combine();
        let GA = $MAP.map.GA;
        for (let arrType of $MAP.combined) {
            let iElementToRemove = [];
            for (let [index, element] of arrType.entries()) {
                if (element === gridIndex) {
                    iElementToRemove.push(index);
                } else if (element[0] === gridIndex) {
                    iElementToRemove.push(index);
                }
            }
            arrType.removeIfIndexInArray(iElementToRemove);
        }

    },
    assertUniqueDecalPosition(gridIndex, dirIndex, array) {
        for (let [index, element] of array.entries()) {
            if (element[0] === gridIndex) {
                if (element[1] === dirIndex) {
                    let remove = array.splice(index, 1);
                    $("#error_message").html("removed duplicate decal");
                    return;
                }
            }
        }
    },
    printMaterialDetails() {
        const material = MATERIAL[$("#materialtype")[0].value];
        const html = `
    <span style="background-color: ${colorVectorToRGB_String(material.ambientColor)}">Ambient: ${colorVectorToHex(material.ambientColor)}</span><br/>
    <span style="background-color: ${colorVectorToRGB_String(material.diffuseColor)}">Diffuse: ${colorVectorToHex(material.diffuseColor)}</span><br/>
    <span style="background-color: ${colorVectorToRGB_String(material.specularColor)}">Specular: ${colorVectorToHex(material.specularColor)}</span><br/>
    <span>Shininess: ${material.shininess}</span><br/>
    <span>Roughness: ${material.roughness}</span><br/>
    <span>Metallic: ${material.metallic}</span><br/>
    <span>FresnelStrength: ${material.fresnelStrength}</span><br/>
    `;
        $("#material-details").html(html);
    },
    printLightDetails() {
        const light = LIGHT_COLORS[$("#lighttype")[0].value];
        const html = `
      <span>R: ${light[0]}</span><br/>
      <span>G: ${light[1]}</span><br/>
      <span>B: ${light[2]}</span><br/>
    `;
        $("#light-details").html(html);
        const code = colorVectorToHex(light);
        $("#light-code").html(`<span style="background-color: ${colorVectorToRGB_String(light)}"> Code: ${code}</span>`);
    },
    getSelectedDecal() {
        const radio = $("#selector2 input[name=decalusage]:checked").val();
        switch (radio) {
            case "picture":
                return [$("#picture_decal")[0].value, radio];
            case "crest":
                return [$("#crest_decal")[0].value, radio];
            case "texture":
                return [$("#texture_decal")[0].value, radio];
            default:
                console.error("decalusage error");
                return [null, null];
        }
    },
    getSelectedDir() {
        const radio = $("#selector input[name=directions]:checked").val();
        return eval(radio);
    },
    init() {
        let OK = true;
        if (GAME.started) {
            OK = confirm("Sure?");
        }
        if (OK) {
            $MAP.width = parseInt($("#horizontalGrid").val(), 10);
            $MAP.height = parseInt($("#verticalGrid").val(), 10);
            $MAP.depth = 1;
            console.info("INIT", $MAP.width, $MAP.height);
            $MAP.map = FREE_MAP3D.create($MAP.width, $MAP.height, 1, null, MAP_TOOLS.INI.GA_BYTE_SIZE);
            $MAP.map.GA.fill(MAPDICT.EMPTY);
            $MAP.init();

            GAME.ensureTerrain();
            NOISE_FUNCTION.generate_terrain();

            console.log("GAME.init ->map:", $MAP.map);
            GAME.render();
        }
    },
    blockGrid3D() {
        let corr = $("input[name='corr']")[0].checked;
        ENGINE.resizeBOX("ROOM");

        $(ENGINE.gameWindowId).width(ENGINE.gameWIDTH + 4);
        ENGINE.BLOCKGRID.configure("pacgrid", "#FFF", "#000", "hint");
        console.log("GAME.blockGrid3D -> GAME.floor", GAME.floor);
        ENGINE.BLOCKGRID3D.draw($MAP.map, GAME.floor, corr);
    },
    export() {
        let rle = $MAP.map.GA.exportMap();
        console.log("Export", rle);
        let Export;

        Export = { width: $MAP.width, height: $MAP.height, depth: 1, map: rle };

        let RoomID = $("#roomid")[0].value;
        let RoomName = $("#roomname")[0].value;


        let roomExport = `${RoomID} : {
name: "${RoomName}",
data: '${JSON.stringify(Export)}',
wall: "${$("#walltexture")[0].value}",
`;

        if (INI.USE_TEXTURES) {
            `
wall: "${$("#walltexture")[0].value}",
floor: "${$("#floortexture")[0].value}",
`;
        }

        if (INI.USE_PANORAMA) {
            roomExport += `
frontPanorama: "${$("#frontPanorama")[0].value}",
leftPanorama: "${$("#leftPanorama")[0].value}",
rightPanorama: "${$("#rightPanorama")[0].value}",
backPanorama: "${$("#backPanorama")[0].value}",
archPanorama: "${$("#archPanorama")[0].value}",
skyPanorama: "${$("#skyPanorama")[0].value}",
`
        }
        for (let desc of $MAP.properties) {
            if ($MAP.map[desc].length > 0) {
                roomExport += `${desc}: '${JSON.stringify($MAP.map[desc])}',\n`;
            }
        }
        for (let list of $MAP.lists) {
            if ($MAP.map[list].length > 0) {
                roomExport += `${list}: '${JSON.stringify($MAP.map[list])}',\n`;
            }
        }

        if (INI.USE_TERRAIN) roomExport += `terrain: '${JSON.stringify($MAP.map.terrain)}',\n`;
        roomExport += `}`;
        $("#exp").val(roomExport);
    },
    import() {
        console.clear();
        const dimension = 1;
        $MAP.map.textureMap = null;
        const ImportText = $("#exp").val();
        console.info("ImportText", ImportText);
        const Import = JSON.parse(ImportText.extractGroup(/data:\s\'(.*)\'/));
        const roomId = ImportText.extractGroup(/^\s*(\w*)/);
        $("#roomid").val(roomId);
        const roomName = ImportText.extractGroup(new RegExp(`name:\\s"(.*)"`));
        $("#roomname").val(roomName);

        const SG = ImportText.extractGroup(/sg:\s(\d{1})/);
        $('#checkpoint').val(SG).trigger('change');

        const Textures = ["wall", "floor", "ceil"];
        for (const prop of Textures) {
            const pattern = new RegExp(`${prop}:\\s"(.*)"`);
            $(`#${prop}texture`).val(ImportText.extractGroup(pattern));
        }

        const Panoramas = ["frontPanorama", "leftPanorama", "rightPanorama", "backPanorama", "archPanorama", "skyPanorama"];
        for (const prop of Panoramas) {
            const pattern = new RegExp(`${prop}:\\s"(.*)"`);
            $(`#${prop}`).val(ImportText.extractGroup(pattern));
        }

        console.log("Import", Import);
        $MAP.map = FREE_MAP3D.import(Import, MAP_TOOLS.INI.GA_BYTE_SIZE);
        $MAP.init();
        WebGL.init_required_IAM($MAP.map, HERO);
        if (INI.USE_TEXTURES) GAME.updateTextures(false);

        for (const prop of [...$MAP.properties, ...$MAP.lists]) {
            const pattern = new RegExp(`${prop}:\\s'(.*)'`);
            let value = ImportText.extractGroup(pattern);
            $MAP.map[prop] = JSON.parse(value) || [];
        }

        GAME.setStartPositionFromStart($MAP.map);
        $MAP.width = Import.width;
        $MAP.height = Import.height;
        $MAP.depth = 1;
        $("#horizontalGrid").val(Import.width);
        $("#verticalGrid").val(Import.height);
        $("#horizontalGrid").trigger("change");
        $("#verticalGrid").trigger("change");

        if (INI.USE_TERRAIN) {
            const terrain = ImportText.extractGroup(/terrain\:\s?\'(.*)\'/);
            $MAP.map.terrain = JSON.parse(terrain);
            NOISE_FUNCTION.writeParsToForm();
            NOISE_FUNCTION.generate_terrain();
        }


        //imort masks
        if (INI.USE_MASK) {
            $MAP.mask_moves = JSON.parse($("#mask_moves_exp").val());
            $MAP.mask_decal_moves = JSON.parse($("#mask_decal_moves_exp").val());
        }

        GAME.updateWH();
        ENGINE.resizeBOX("ROOM");
        GAME.resizeGL_window();
        $(ENGINE.gameWindowId).width(ENGINE.gameWIDTH + 4);
        $MAP.map.textureMap = $MAP.map.GA.toTextureMap();
        GAME.render();

        console.info("IMPORT $MAP.map", $MAP.map);
    },
    copyToClipboard() {
        ENGINE.copyToClipboard("exp");
    },
    copyMaskToClipboard() {
        ENGINE.copyToClipboard("mask_moves_exp");
    },
    copyDecalMaskToClipboard() {
        ENGINE.copyToClipboard("mask_decal_moves_exp");
    },
    resizeGL_window() {
        $("#WEBGL_canvas_0").css("top", `${ENGINE.gameHEIGHT + 4 + 3 * 128 + 2 * 256 + 768 + 320}px`)
    },
    parseFloatSafe(value, fallback) {
        const n = parseFloat(value);
        return Number.isFinite(n) ? n : fallback;
    },
    parseIntSafe(value, fallback) {
        const n = parseInt(value, 10);
        return Number.isFinite(n) ? n : fallback;
    },
    roundValue(value, decimals = 3) {
        const scale = 10 ** decimals;
        return Math.round(value * scale) / scale;
    },
    getMapWidth() {
        if ($MAP && $MAP.width) {
            return parseInt($MAP.width, 10) || 128;
        }
        return parseInt($("#horizontalGrid").val(), 10) || 128;
    },
    getGridPx() {
        return parseInt($("#gridsize").val(), 10) || 16;
    },
    ensureTerrain() {
        if (!$MAP.map.terrain) {
            $MAP.map.terrain = {};
        }

        if (!$MAP.map.terrain.direction) {
            $MAP.map.terrain.direction = {};
        }

        if (!$MAP.map.terrain.width) {
            $MAP.map.terrain.width = {};
        }

        if (!$MAP.map.terrain.slope) {
            $MAP.map.terrain.slope = {};
        }
    },
    textureToMask() {
        ENGINE.applyTextureToMask(TEXTURE[$("#walltexture")[0].value], LAYER.mask, LAYER.paintedmask);
    },
};

const NOISE_FUNCTION = {
    DIRECTION_NOISE_DEFAULTS: {
        seed: 666,
        amplitude: 3.0,                                 // max deviation around bias, in degrees
        wavelength: 32,
        octaves: 3,
        persistence: 0.5,
        lacunarity: 2.0,
        biasDeg: 0.0,
        smooth: "smootherstep",
        minDeg: -120, //-45
        maxDeg: 120, //45
        decimals: 3
    },
    WIDTH_NOISE_DEFAULTS: {
        seed: 777,
        amplitude: 1.5,                                  // max deviation around bias, in width units
        wavelength: 16,
        octaves: 3,
        persistence: 0.5,
        lacunarity: 2.0,
        biasWidth: 1.0,
        smooth: "smootherstep",
        minWidth: 0.5,
        maxWidth: 3.0,
        decimals: 3
    },
    SLOPE_NOISE_DEFAULTS: {
        seed: 888,
        amplitude: 18.0,                                // max deviation around bias, in degrees
        wavelength: 16,
        octaves: 3,
        persistence: 0.65,
        lacunarity: 2.0,
        biasSlope: 18.0,
        smooth: "smootherstep",
        minSlope: 3.0,
        maxSlope: 60.0,
        decimals: 3
    },
    readSlopeParams() {
        const d = this.SLOPE_NOISE_DEFAULTS;

        const seed = GAME.parseIntSafe($("#slope_seed").val(), d.seed);
        const amplitude = GAME.parseFloatSafe($("#slope_amp").val(), d.amplitude);
        const wavelength = GAME.parseFloatSafe($("#slope_wl").val(), d.wavelength);
        const persistence = GAME.parseFloatSafe($("#slope_persist").val(), d.persistence);
        const lacunarity = GAME.parseFloatSafe($("#slope_lacunarity").val(), d.lacunarity);
        const biasSlope = GAME.parseFloatSafe($("#slope_bias").val(), d.biasSlope);
        const minSlope = GAME.parseFloatSafe($("#slope_min").val(), d.minSlope);
        const maxSlope = GAME.parseFloatSafe($("#slope_max").val(), d.maxSlope);
        const smooth = $("#slope_smooth").val() || d.smooth;
        const octaves = GAME.parseIntSafe($("#slope_octaves").val(), d.octaves);

        const safeMin = Math.clamp(Math.min(minSlope, maxSlope), 0.1, 44.9);
        const safeMax = Math.clamp(Math.max(minSlope, maxSlope), safeMin + 0.1, 60.0);

        return {
            seed: seed,
            amplitude: Math.clamp(amplitude, 0, 60),
            wavelength: Math.clamp(wavelength, 1, 512),
            octaves: Math.clamp(octaves, 1, 8),
            persistence: Math.clamp(persistence, 0, 1),
            lacunarity: Math.clamp(lacunarity, 1.01, 8),
            biasSlope: Math.clamp(biasSlope, safeMin, safeMax),
            smooth: smooth,
            minSlope: safeMin,
            maxSlope: safeMax,
            decimals: d.decimals
        };
    },
    readWidthParams() {
        const d = this.WIDTH_NOISE_DEFAULTS;

        const seed = GAME.parseIntSafe($("#width_seed").val(), d.seed);
        const amplitude = GAME.parseFloatSafe($("#width_amp").val(), d.amplitude);
        const wavelength = GAME.parseFloatSafe($("#width_wl").val(), d.wavelength);
        const persistence = GAME.parseFloatSafe($("#width_persist").val(), d.persistence);
        const lacunarity = GAME.parseFloatSafe($("#width_lacunarity").val(), d.lacunarity);
        const biasWidth = GAME.parseFloatSafe($("#width_bias").val(), d.biasWidth);
        const minWidth = GAME.parseFloatSafe($("#width_min").val(), d.minWidth);
        const maxWidth = GAME.parseFloatSafe($("#width_max").val(), d.maxWidth);
        const smooth = $("#width_smooth").val() || d.smooth;
        const octaves = GAME.parseIntSafe($("#width_octaves").val(), d.octaves);

        const safeMin = Math.max(0.1, Math.min(minWidth, maxWidth));
        const safeMax = Math.max(safeMin, Math.max(minWidth, maxWidth));

        return {
            seed: seed,
            amplitude: Math.clamp(amplitude, 0, 32),
            wavelength: Math.clamp(wavelength, 1, 512),
            octaves: Math.clamp(octaves, 1, 8),
            persistence: Math.clamp(persistence, 0, 1),
            lacunarity: Math.clamp(lacunarity, 1.01, 8),
            biasWidth: Math.clamp(biasWidth, safeMin, safeMax),
            smooth: smooth,
            minWidth: safeMin,
            maxWidth: safeMax,
            decimals: d.decimals
        };
    },
    readDirectionParams() {
        const d = this.DIRECTION_NOISE_DEFAULTS;
        const seed = GAME.parseIntSafe($("#dir_seed").val(), d.seed);
        const amplitude = GAME.parseFloatSafe($("#dir_amp").val(), d.amplitude);
        const wavelength = GAME.parseFloatSafe($("#dir_wl").val(), d.wavelength);
        const persistence = GAME.parseFloatSafe($("#dir_persist").val(), d.persistence);
        const lacunarity = GAME.parseFloatSafe($("#dir_lacunarity").val(), d.lacunarity);
        const biasDeg = GAME.parseFloatSafe($("#dir_bias").val(), d.biasDeg);
        const smooth = $("#dir_smooth").val() || d.smooth;
        const octaves = GAME.parseIntSafe($("#dir_octaves").val(), d.octaves);

        return {
            seed: seed,
            amplitude: Math.clamp(amplitude, 0, 90),
            wavelength: Math.clamp(wavelength, 1, 512),
            octaves: Math.clamp(octaves, 1, 8),
            persistence: Math.clamp(persistence, 0, 1),
            lacunarity: Math.clamp(lacunarity, 1.01, 8),
            biasDeg: Math.clamp(biasDeg, -120, 120),
            smooth: smooth,
            minDeg: d.minDeg,
            maxDeg: d.maxDeg,
            decimals: d.decimals
        };
    },
    rawToSlope(raw, params) {
        let slope = params.biasSlope + raw * 2 * params.amplitude;
        slope = Math.clamp(slope, params.minSlope, params.maxSlope);
        return GAME.roundValue(slope, params.decimals);
    },
    rawToWidth(raw, params) {
        let width = params.biasWidth + raw * 2 * params.amplitude;
        width = Math.clamp(width, params.minWidth, params.maxWidth);
        return GAME.roundValue(width, params.decimals);
    },
    rawToDegrees(raw, params) {
        let deg = params.biasDeg + raw * 2 * params.amplitude;
        deg = Math.clamp(deg, params.minDeg, params.maxDeg);
        return GAME.roundValue(deg, params.decimals);
    },
    generateDirectionValues(width = null, params = null) {
        const W = width || GAME.getMapWidth();
        const P = params || this.readDirectionParams();

        const raw = PERLIN.generateFractalNoise1D({
            width: W,
            seed: P.seed,
            wavelength: P.wavelength,
            octaves: P.octaves,
            persistence: P.persistence,
            lacunarity: P.lacunarity,
            smooth: P.smooth
        });

        return raw.map(v => this.rawToDegrees(v, P));
    },
    buildDirections(width = null, params = null) {
        const W = width || GAME.getMapWidth();
        const P = params || this.readDirectionParams();

        const values = this.generateDirectionValues(W, P);
        $MAP.map.terrain.direction.parameters = P;
        $MAP.map.terrain.direction.values = values;

        return {
            units: "degrees",
            parameters: P,
            values: values,
        };
    },
    buildWidths(width = null, params = null) {
        const W = width || GAME.getMapWidth();
        const P = params || this.readWidthParams();

        const values = this.generateWidthValues(W, P);
        $MAP.map.terrain.width.parameters = P;
        $MAP.map.terrain.width.values = values;

        return {
            units: "grid",
            min: P.minWidth,
            max: P.maxWidth,
            parameters: P,
            values: values
        };
    },
    buildSlopes(width = null, params = null) {
        const W = width || GAME.getMapWidth();
        const P = params || this.readSlopeParams();

        const values = this.generateSlopeValues(W, P);
        $MAP.map.terrain.slope.parameters = P;
        $MAP.map.terrain.slope.values = values;

        const slopeData = {
            units: "degrees_down",
            min: P.minSlope,
            max: P.maxSlope,
            parameters: P,
            values: values
        };

        return slopeData;
    },
    stats(values) {
        if (!values || values.length === 0) {
            return {
                min: 0,
                max: 0,
                avg: 0,
                absMax: 0
            };
        }

        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        let absMax = 0;

        for (const v of values) {
            min = Math.min(min, v);
            max = Math.max(max, v);
            sum += v;
            absMax = Math.max(absMax, Math.abs(v));
        }

        return {
            min: min,
            max: max,
            avg: sum / values.length,
            absMax: absMax
        };
    },
    updateDirectionStats(directionData) {
        if (!directionData || !directionData.values) {
            $("#dir_stats").html("No direction noise yet.");
            return;
        }

        const s = this.stats(directionData.values);

        $("#dir_stats").html(
            `min: ${s.min.toFixed(3)}&deg;, ` +
            `max: ${s.max.toFixed(3)}&deg;, ` +
            `avg: ${s.avg.toFixed(3)}&deg;, ` +
            `samples: ${directionData.values.length}`
        );
    },
    updateWidthStats(widthData) {
        if (!widthData || !widthData.values) {
            $("#width_stats").html("No width noise yet.");
            return;
        }

        const s = this.stats(widthData.values);

        $("#width_stats").html(
            `min: ${s.min.toFixed(3)}, ` +
            `max: ${s.max.toFixed(3)}, ` +
            `avg: ${s.avg.toFixed(3)}, ` +
            `samples: ${widthData.values.length}`
        );
    },
    drawBackground(layer, gridPx, W, H, midY, mapWidth) {
        const CTX = LAYER[layer];
        ENGINE.clearLayer(layer);
        ENGINE.fillLayer(layer, "#101010");

        const guideCol = "#444";
        ENGINE.drawLine(CTX, new Point(0, H * 0.15), new Point(W, H * 0.15), guideCol, 1);
        ENGINE.drawLine(CTX, new Point(0, H * 0.85), new Point(W, H * 0.85), guideCol, 1);
        ENGINE.drawLine(CTX, new Point(0, midY), new Point(W, midY), "#666", 1);

        const vGridCol = "#202020";

        for (let x = 0; x <= mapWidth; x++) {
            const px = x * gridPx;
            ENGINE.drawLine(CTX, new Point(px, 0), new Point(px, H), vGridCol, 1);
        }

    },
    drawDirections(directionData) {
        if (!directionData || !directionData.values) return;

        const CTX = LAYER.direction;
        const gridPx = GAME.getGridPx();
        const values = directionData.values;
        const mapWidth = values.length;
        const W = mapWidth * gridPx;
        const H = 128;
        const midY = Math.floor(H / 2);

        this.drawBackground("direction", gridPx, W, H, midY, mapWidth);

        const minDeg = directionData.min ?? -90;
        const maxDeg = directionData.max ?? 90;
        const legalAbs = Math.max(Math.abs(minDeg), Math.abs(maxDeg), 1);
        const s = this.stats(values);
        const maxAbs = Math.min(legalAbs, Math.max(s.absMax * 1.15, 1.0));                      // Auto-scale to the generated curve, but keep at least 1 degree visible range.

        // curve
        CTX.strokeStyle = "#2ACBE8";
        CTX.lineWidth = 1;
        CTX.beginPath();

        for (let i = 0; i < values.length; i++) {
            const x = i * gridPx + gridPx * 0.5;
            const y = midY - values[i] / maxAbs * (H * 0.42);
            if (i === 0) CTX.moveTo(x, y);
            else CTX.lineTo(x, y);
        }

        CTX.stroke();

        // dots
        CTX.fillStyle = "#FFFFFF";

        for (let i = 0; i < values.length; i++) {
            const x = i * gridPx + gridPx * 0.5;
            const y = midY - values[i] / maxAbs * (H * 0.42);
            CTX.pixelAt(x - 1, y - 1);
        }

        // labels
        CTX.fillStyle = "#DDD";
        CTX.font = "12px Consolas, monospace";
        CTX.fillText(`Direction: ${values.length} samples, preview scale +/-${maxAbs.toFixed(2)} deg`, 8, 14);
        CTX.fillText(`+${maxAbs.toFixed(2)} deg`, 8, 28);
        CTX.fillText(`0 deg`, 8, midY - 4);
        CTX.fillText(`-${maxAbs.toFixed(2)} deg`, 8, H - 8);
    },
    direction_noise_preview(width = null) {
        const direction = this.buildDirections(width);
        this.drawDirections(direction);
        this.updateDirectionStats(direction);
        return direction;
    },
    generateWidthValues(width = null, params = null) {
        const W = width || GAME.getMapWidth();
        const P = params || this.readWidthParams();

        const raw = PERLIN.generateFractalNoise1D({
            width: W,
            seed: P.seed,
            wavelength: P.wavelength,
            octaves: P.octaves,
            persistence: P.persistence,
            lacunarity: P.lacunarity,
            smooth: P.smooth
        });

        return raw.map(v => this.rawToWidth(v, P));
    },
    drawWidths(widthData) {
        if (!widthData || !widthData.values) return;

        const CTX = LAYER.width;
        const gridPx = GAME.getGridPx();
        const values = widthData.values;
        const mapWidth = values.length;
        const W = mapWidth * gridPx;
        const H = 128;
        const midY = Math.floor(H / 2);

        this.drawBackground("width", gridPx, W, H, midY, mapWidth);

        const minWidth = widthData.min ?? 1.5;
        const maxWidth = widthData.max ?? 6.0;
        const range = Math.max(maxWidth - minWidth, 0.001);

        // curve
        CTX.strokeStyle = "#A7F070";
        CTX.lineWidth = 1;
        CTX.beginPath();

        for (let i = 0; i < values.length; i++) {
            const x = i * gridPx + gridPx * 0.5;

            // max width at top, min width at bottom
            const normalized = (values[i] - minWidth) / range;
            const y = H * 0.85 - normalized * (H * 0.70);

            if (i === 0) CTX.moveTo(x, y);
            else CTX.lineTo(x, y);
        }

        CTX.stroke();

        // dots
        CTX.fillStyle = "#FFFFFF";

        for (let i = 0; i < values.length; i++) {
            const x = i * gridPx + gridPx * 0.5;
            const normalized = (values[i] - minWidth) / range;
            const y = H * 0.85 - normalized * (H * 0.70);

            CTX.pixelAt(x - 1, y - 1);
        }

        // labels
        CTX.fillStyle = "#DDD";
        CTX.font = "12px Consolas, monospace";
        CTX.fillText(`Width: ${values.length} samples`, 8, 14);
        CTX.fillText(`${maxWidth.toFixed(2)}`, 8, 28);
        CTX.fillText(`${((minWidth + maxWidth) * 0.5).toFixed(2)}`, 8, midY - 4);
        CTX.fillText(`${minWidth.toFixed(2)}`, 8, H - 8);
    },
    width_noise_preview(width = null) {
        const widthData = this.buildWidths(width);
        this.drawWidths(widthData);
        this.updateWidthStats(widthData);
        return widthData;
    },
    generateSlopeValues(width = null, params = null) {
        const W = width || GAME.getMapWidth();
        const P = params || this.readSlopeParams();

        const raw = PERLIN.generateFractalNoise1D({
            width: W,
            seed: P.seed,
            wavelength: P.wavelength,
            octaves: P.octaves,
            persistence: P.persistence,
            lacunarity: P.lacunarity,
            smooth: P.smooth
        });

        return raw.map(v => this.rawToSlope(v, P));
    },
    updateSlopeStats(slopeData) {
        if (!slopeData || !slopeData.values) {
            $("#slope_stats").html("No slope noise yet.");
            return;
        }

        const s = this.stats(slopeData.values);

        $("#slope_stats").html(
            `min: ${s.min.toFixed(3)}&deg;, ` +
            `max: ${s.max.toFixed(3)}&deg;, ` +
            `avg: ${s.avg.toFixed(3)}&deg;, ` +
            `samples: ${slopeData.values.length}`
        );
    },
    drawSlopes(slopeData) {
        if (!slopeData || !slopeData.values) return;

        const CTX = LAYER.slope;
        const gridPx = GAME.getGridPx();
        const values = slopeData.values;
        const mapWidth = values.length;
        const W = mapWidth * gridPx;
        const H = 128;
        const midY = Math.floor(H / 2);

        this.drawBackground("slope", gridPx, W, H, midY, mapWidth);

        const minSlope = slopeData.min ?? 3.0;
        const maxSlope = slopeData.max ?? 45.0;
        const range = Math.max(maxSlope - minSlope, 0.001);

        // curve
        CTX.strokeStyle = "#FFB347";
        CTX.lineWidth = 1;
        CTX.beginPath();

        for (let i = 0; i < values.length; i++) {
            const x = i * gridPx + gridPx * 0.5;

            // steep at top, shallow at bottom
            const normalized = (values[i] - minSlope) / range;
            const y = H * 0.85 - normalized * (H * 0.70);

            if (i === 0) CTX.moveTo(x, y);
            else CTX.lineTo(x, y);
        }

        CTX.stroke();

        // dots
        CTX.fillStyle = "#FFFFFF";

        for (let i = 0; i < values.length; i++) {
            const x = i * gridPx + gridPx * 0.5;
            const normalized = (values[i] - minSlope) / range;
            const y = H * 0.85 - normalized * (H * 0.70);

            CTX.pixelAt(x - 1, y - 1);
        }

        // labels
        CTX.fillStyle = "#DDD";
        CTX.font = "12px Consolas, monospace";
        CTX.fillText(`Slope: ${values.length} samples`, 8, 14);
        CTX.fillText(`${maxSlope.toFixed(2)} deg`, 8, 28);
        CTX.fillText(`${((minSlope + maxSlope) * 0.5).toFixed(2)} deg`, 8, midY - 4);
        CTX.fillText(`${minSlope.toFixed(2)} deg`, 8, H - 8);
    },
    slope_noise_preview(width = null) {
        const slopeData = this.buildSlopes(width);
        this.drawSlopes(slopeData);
        this.updateSlopeStats(slopeData);
        return slopeData;
    },
    writeDirectionParams(params) {
        if (!params) return;

        $("#dir_seed").val(params.seed);
        $("#dir_amp").val(params.amplitude);
        $("#dir_wl").val(params.wavelength);
        $("#dir_octaves").val(params.octaves);
        $("#dir_persist").val(params.persistence);
        $("#dir_lacunarity").val(params.lacunarity);
        $("#dir_bias").val(params.biasDeg);
        $("#dir_smooth").val(params.smooth);
    },
    writeWidthParams(params) {
        if (!params) return;

        $("#width_seed").val(params.seed);
        $("#width_amp").val(params.amplitude);
        $("#width_wl").val(params.wavelength);
        $("#width_octaves").val(params.octaves);
        $("#width_persist").val(params.persistence);
        $("#width_lacunarity").val(params.lacunarity);
        $("#width_bias").val(params.biasWidth);
        $("#width_min").val(params.minWidth);
        $("#width_max").val(params.maxWidth);
        $("#width_smooth").val(params.smooth);
    },
    writeSlopeParams(params) {
        if (!params) return;

        $("#slope_seed").val(params.seed);
        $("#slope_amp").val(params.amplitude);
        $("#slope_wl").val(params.wavelength);
        $("#slope_octaves").val(params.octaves);
        $("#slope_persist").val(params.persistence);
        $("#slope_lacunarity").val(params.lacunarity);
        $("#slope_bias").val(params.biasSlope);
        $("#slope_min").val(params.minSlope);
        $("#slope_max").val(params.maxSlope);
        $("#slope_smooth").val(params.smooth);
    },
    generate_terrain() {
        if (!INI.USE_TERRAIN) return;
        this.direction_noise_preview();
        this.width_noise_preview();
        this.slope_noise_preview();
    },
    writeParsToForm() {
        this.writeDirectionParams($MAP.map.terrain.direction.parameters);
        this.writeWidthParams($MAP.map.terrain.width.parameters);
        this.writeSlopeParams($MAP.map.terrain.slope.parameters);
    },
};

$(function () {
    PRG.INIT();
    PRG.setup();
    ENGINE.LOAD.preload();
});