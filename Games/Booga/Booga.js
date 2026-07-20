/*jshint browser: true */
/*jshint -W097 */
/*jshint -W117 */
/*jshint -W061 */
"use strict";

/////////////////////////////////////////////////
/*
      
TODO:
    * 
known bugs: 
    * i don't do bugs

retests:
    * all completed

 */
////////////////////////////////////////////////////

const DEBUG = {
    SETTING: true,
    FPS: true,
    VERBOSE: true,
    _2D_display: false,
    INVINCIBLE: false,
    keys: false,
    max17: false,
};

const INI = {
    SCREEN_BORDER: 64,
    MAX_LEVEL: 1,
    JUMP_POWER_INC: 1,          // not tuned
    MAX_JUMP_POWER: 100,        // not tuned
    JUMP_SPEED_FACTOR: 20,      // converts charged power into pixels/second
    GRAVITY: 500,               // pixels/second² 500
    FEET: 18,                   // px apart from ceter, for testing surface stability 
    MIN_SLIDE_SPEED: 500,       // minimal sliding speed when sliding
    PLANE_Y_TOLERANCE: 5,       // px difference still means flat
};

const PRG = {
    VERSION: "0.5.1",
    NAME: "Booga",
    YEAR: "2026",
    SG: "Booga",
    CSS: "color: #239AFF;",
    COLOR: "#239AFF",
    INIT() {
        console.star(PRG.COLOR);
        console.title(`${PRG.NAME} ${PRG.VERSION} by Lovro Selic, ${"\u00A9"} LaughingSkull ${PRG.YEAR} on ${navigator.userAgent}`);
        console.star(PRG.COLOR);
        $("#title").html(PRG.NAME);
        $("#version").html(`${PRG.NAME} V${PRG.VERSION} <span style='font-size:14px'>&copy</span> LaughingSkull ${PRG.YEAR}`);
        $("input#toggleAbout").val("About " + PRG.NAME);
        $("#about fieldset legend").append(" " + PRG.NAME + " ");

        ENGINE.autostart = true;
        ENGINE.start = PRG.start;
        ENGINE.readyCall = GAME.setup;
        ENGINE.setGridSize(64);
        ENGINE.setSpriteSheetSize(64);
        ENGINE.init();
    },
    setup() {

        $("#engine_version").html(ENGINE.VERSION);
        $("#grid_version").html(GRID.VERSION);
        $("#maze_version").html(DUNGEON.VERSION);
        $("#iam_version").html(IndexArrayManagers.VERSION);
        $("#lib_version").html(LIB.VERSION);
        $("#webgl_version").html(WebGL.VERSION);
        $("#maptools_version").html(MAP_TOOLS.VERSION);

        $("#toggleHelp").click(function () {
            $("#help").toggle(400);
        });
        $("#toggleAbout").click(function () {
            $("#about").toggle(400);
        });
        $("#toggleVersion").click(function () {
            $("#debug").toggle(400);
        });

        //boxes
        ENGINE.gameWIDTH = 960;
        ENGINE.titleWIDTH = ENGINE.gameWIDTH + 2 * INI.SCREEN_BORDER;
        ENGINE.sideWIDTH = INI.SCREEN_BORDER;
        ENGINE.gameHEIGHT = 768;
        ENGINE.titleHEIGHT = 96;
        ENGINE.bottomHEIGHT = 80;
        ENGINE.bottomWIDTH = ENGINE.titleWIDTH;
        MAP_TOOLS.INI.FOG = false;

        $("#bottom").css("margin-top", ENGINE.gameHEIGHT + ENGINE.titleHEIGHT + ENGINE.bottomHEIGHT);
        $(ENGINE.gameWindowId).width(ENGINE.gameWIDTH + 2 * ENGINE.sideWIDTH + 4);
        ENGINE.addBOX("TITLE", ENGINE.titleWIDTH, ENGINE.titleHEIGHT, ["title", "score", "level", "hiscore", "time", "jump"], null);
        ENGINE.addBOX("LSIDE", INI.SCREEN_BORDER, ENGINE.gameHEIGHT, ["Lsideback",], "side");
        ENGINE.addBOX("ROOM", ENGINE.gameWIDTH, ENGINE.gameHEIGHT, ["background", "grid", "coord", "3d_webgl", "fill", "info", "text", "FPS", "button", "click"], "side");
        ENGINE.addBOX("SIDE", ENGINE.sideWIDTH, ENGINE.gameHEIGHT, ["sideback"], "fside");
        ENGINE.addBOX("DOWN", ENGINE.bottomWIDTH, ENGINE.bottomHEIGHT, ["bottom", "bottomText", "subtitle", "lives",], null);

        MAP_TOOLS.use2D();

        /** dev settings */
        if (DEBUG.VERBOSE) {
            WebGL.VERBOSE = true;
            ENGINE.verbose = true;
            MAP_TOOLS.INI.VERBOSE = true;
        }
    },
    start() {
        console.star(PRG.COLOR);
        console.chapter(`${PRG.NAME} ${PRG.VERSION} STARTED!`);
        console.star(PRG.COLOR);
        $(ENGINE.topCanvas).off("mousemove", ENGINE.mouseOver);
        $(ENGINE.topCanvas).off("click", ENGINE.mouseClick);
        $(ENGINE.topCanvas).css("cursor", "");
        $("#startGame").addClass("hidden");
        ENGINE.disableDefaultKeys();
        TITLE.startTitle();
    }
};

const HERO = {
    construct() {
        this.player = null;
        this.dead = false;
        this.jumpPower = 0;
        this.setMode();

        //binds
        this.handleFinishedJump = this.handleFinishedJump.bind(this);
    },
    setMode(mode = "idle", dir = UP) {
        /**
         * idle
         * side, idle but with attitude
         * jumping
         * sliding, idle but rotation
         * falling, idle but straight
         */
        if (mode === this.mode) return;
        this.mode = mode;

        switch (this.mode) {
            case "idle":
                this.player?.sprite.setAsset("FleaIdle");
                this.player?.sprite.setDirRef(UP);
                break;
            case "falling":
            case "sliding":
                this.player?.sprite.setAsset("FleaIdle");
                this.player?.sprite.setDirRef(dir);
                break;
            case "jumping":
                this.player?.sprite.setAsset("FleaJump");
                break;
            case "side":
                this.player?.sprite.setAsset("FleaSide");
                this.player?.sprite.setDirRef(dir);
                break;
            default: throw new Error(`Hero mode not suported: ${this.mode}`)
        }

        this.player?.sprite.update(dir);
    },
    concludeAction() {

    },
    die() {
        if (DEBUG.VERBOSE) {
            console.red("HERO.die");
            //console.trace();
        }

        if (HERO.dead) return;
        HERO.dead = true;

    },
    async death() {
        if (DEBUG.VERBOSE) console.red("HERO.death");
        ENGINE.GAME.ANIMATION.stop();
        GAME.lives--;

        //await AUDIO_TOOLS.waitUntilEnded(AUDIO.Splash);
        //await AUDIO_TOOLS.playAndWait(AUDIO.Death);
        HERO.finalDeath();
    },
    finalDeath() {
        console.red("HERO.finalDeath");
        if (GAME.lives > 0) return GAME.continueLevel();
        GAME.checkScore();
        TITLE.hiscore();
        TITLE.startTitle();
    },
    manage(lapsedTime) {
        GRID.translateSpritePosition(HERO.player, lapsedTime, HERO.handleFinishedJump, true, true);
    },
    completeLevel() {
        if (DEBUG.VERBOSE) console.ok("level completed");
        //AUDIO.LevelUp.play();
        GAME.level = Math.min(INI.MAX_LEVEL, ++GAME.level);
        GAME.levelStart();
    },
    playerSetUp() {
        const map = MAP[GAME.level].map;
        const start_dir = map.startPosition.vector;
        const start_grid = Grid.toClass(map.startPosition.grid);
        HERO.player = new $2D_player(start_grid, start_dir, HERO_TYPE.Booga, map.GA, map, true);
        //HERO.player.addDeathTexture(SPRITE.DeadFrog);
        if (GAME.time) GAME.time.unregister();
        if (DEBUG.VERBOSE) console.note("playerSetUp, HERO set to start grid");
    },
    handleHoleMove(grid) {
        //not applicable
    },
    getWho(grid) {
        const map = MAP.main.map;
        const IA = map.enemyIA;
        const who = IA.unroll(grid)[0] || null;     //expected only one
        return who;
    },
    handleEmptyMove(grid) {
        //not applicable
    },
    handleReservedMove(grid) {
        const GA = this.player.GA;
        GA.toWall(grid);
        ENGINE.drawToGrid("fill", grid, SPRITE.FroggessFilled);
        GAME.score += INI.SCORE_GOAL;
        GAME.score += this.accumulatedBonus;
        this.accumulatedBonus = 0;
        TITLE.score();
        HERO.player.sprite.hide();
        GAME.time.stop();
        GAME.time.deactivate();
        ENGINE.GAME.pauseBlock();
        ENGINE.GAME.paused = true;
        ENGINE.GAME.ANIMATION.next(GAME.goalReachedRun);
    },
    checkForwardProgress() {
        const currentRow = this.player.moveState.startGrid.y;
        if (currentRow < this.row) {
            this.row = currentRow;
            GAME.score += INI.SCORE_ROW;
            TITLE.score();
        }
    },
    handleOutOfBounds() {
        //not applicable
    },
    handleCarry() {
        //not applicable
    },
    handleMove(dir) {
        if (dir.y !== 0) return;                                    // x-only
        if (!["idle", "side"].includes(this.mode)) return;          // only selected modes

        this.jumpPower += INI.JUMP_POWER_INC;
        this.jumpPower = Math.min(this.jumpPower, INI.MAX_JUMP_POWER);
        if (!this.jumpDir) this.jumpDir = dir;
        this.setMode("side", this.jumpDir);
    },
    handleNothingWasPressed() {
        //console.warn("handleNothingWasPressed");
        if (this.mode !== "side") return;
        if (this.jumpPower <= 0) return;

        this.performJump();

        //cleanup
        this.jumpPower = 0;
        this.jumpDir = null;
    },
    performJump() {
        if (this.player.motion.active) return;
        console.error("jumping, power", this.jumpPower, "dir", this.jumpDir);
        const speed = this.jumpPower * INI.JUMP_SPEED_FACTOR;
        const component = speed * Math.SQRT1_2;                     // cos(45°) and sin(45°)
        const mode = "jumping";
        this.setMode(mode, this.jumpDir);
        this.player.motion.setType(mode);                           // no importance, but aligned with mode, just in case
        this.player.motion.setVelocity({ x: this.jumpDir.x * component, y: -component });
        this.player.motion.setAcceleration({ x: 0, y: INI.GRAVITY });
        this.player.motion.activate();

        console.info(
            "Jump started:",
            "power", this.jumpPower,
            "velocity", this.player.motion.velocity
        );
    },
    handlePositionCollision(context) {
        const entity = context.entity;
        const motion = entity.motion;
        const maskdata = entity.map.maskdata;
        let contact = Point.rounded(context.collision.contact);
        const gs2 = (ENGINE.INI.GRIDPIX >>> 1) * GRID.SETTING.WALL_COLLISION_TOLERANCE;
        let origin = Point.rounded(context.currentPos.translate(DOWN, gs2));
        let candidate = Point.rounded(context.candidatePos.translate(DOWN, gs2));
        console.warn("Position collision", context, "contact", contact);

        const type = context.collision.type;

        switch (type) {
            case "blocked":
                console.info(".blocked");
                motion.velocity.x = 0;                                                                      // stop side movement
                motion.velocity.y = Math.abs(motion.velocity.y);                                            // keep speed down or revert from up
                this.setMode("falling", DOWN);
                motion.setType("falling");
                motion.setAcceleration({ x: 0, y: INI.GRAVITY });
                return { finished: false, pos: context.currentPos, };

            case "unsupported":
                console.info(".unsupported");
                motion.velocity.x = 0;
                motion.velocity.y = Math.abs(motion.velocity.y);
                this.setMode("falling", DOWN);
                motion.setType("falling");
                motion.setAcceleration({ x: 0, y: INI.GRAVITY });
                return { finished: false, pos: context.candidatePos, };

            case "surface":
                contact = ENGINE.adjustYToWallEdge(maskdata, contact);                                     // adjust
                const feet = [
                    ENGINE.adjustYToWallEdge(maskdata, contact.translate(LEFT, INI.FEET)),
                    ENGINE.adjustYToWallEdge(maskdata, contact.translate(RIGHT, INI.FEET))
                ];

                console.info(".surface, contact", contact, "feet", feet);
                const Y = [feet[0].y, contact.y, feet[1].y];
                const lined = (Math.max(...Y) - Math.min(...Y)) <= INI.PLANE_Y_TOLERANCE;               //tolerance, set to INI
                console.info("..Y", Y, "lined", lined);


                if (lined) {
                    // this is a stable ground
                    console.log("... stable");
                    this.setMode("idle", UP);
                    origin = ENGINE.adjustYToWallEdge(maskdata, origin);
                    origin.y--;                                                 //one px up, out of wall
                    const finalSafePos = Point.rounded(origin.translate(UP, gs2));
                    //console.info("....origin untransformed", origin, "transformed", finalSafePos);
                    this.paintLanding([contact, ...feet]); //debug

                    return { finished: true, pos: finalSafePos, };
                } else {
                    //not stable ground
                    console.log("... unstable");

                    let slideDir;
                    if (feet[0].y < feet[1].y) {
                        slideDir = RIGHT;
                    } else if (feet[0].y > feet[1].y) {
                        slideDir = LEFT;
                    } else slideDir = [LEFT, RIGHT].chooseRandom();         // Symmetrical or ambiguous surface: choose a direction.

                    motion.velocity.y = Math.max(Math.abs(motion.velocity.y), INI.MIN_SLIDE_SPEED);
                    motion.velocity.x = motion.velocity.y * slideDir.x;
                    motion.setAcceleration({ x: 0, y: 0 });

                    if (
                        (
                            feet[0].y < contact.y &&
                            Math.abs(contact.y - feet[1].y) <= INI.PLANE_Y_TOLERANCE
                        ) ||
                        (
                            feet[1].y < contact.y &&
                            Math.abs(contact.y - feet[0].y) <= INI.PLANE_Y_TOLERANCE
                        )
                    ) {
                        motion.velocity.y = 0;                              // slide horizontally
                    }

                    this.setMode("sliding", slideDir);
                    motion.setType("sliding");
                    this.paintLanding([contact, ...feet]); //debug
                    return { finished: false, pos: context.candidatePos, };
                }

            default: throw new Error(`handlePositionCollision wrong event type ${type}`);
        }
    },
    paintLanding(points) {
        ENGINE.clearLayer("fill");
        const CTX = LAYER.fill;
        CTX.fillStyle = "#FFF";
        for (const point of points) {
            let p = point.toViewportCopy()
            CTX.pixelAtPoint(p, 3);
        }
    },
    handleFinishedJump(result) {
        console.error("handleFinishedJump", result);
        /**
         * TODO
         * clean movestate, 
         *  - monster might use it for hunting
         * and whatever I forgot
         */
    }
};

const GAME = {
    time: null,
    realSpeed: null,
    highSpeed: null,
    restarted: false,
    timerRunning: false,
    levelComplete: false,
    start() {
        if (DEBUG.VERBOSE) console.log("GAME started");
        if (AUDIO.Title) {
            AUDIO.Title.pause();
            AUDIO.Title.currentTime = 0;
        }
        $(ENGINE.topCanvas).off("mousemove", ENGINE.mouseOver);
        $(ENGINE.topCanvas).off("click", ENGINE.mouseClick);
        $(ENGINE.topCanvas).css("cursor", "");
        ENGINE.hideMouse();
        ENGINE.GAME.pauseBlock();
        ENGINE.GAME.paused = true;

        let GameRD = new RenderData("Booga", 60, "#fF2010", "text", "#444444", 2, 2, 2);
        ENGINE.TEXT.setRD(GameRD);
        ENGINE.watchVisibility(ENGINE.GAME.lostFocus);
        ENGINE.GAME.setGameLoop(GAME.run);
        ENGINE.GAME.start(16);
        GAME.extraLife = SCORE.extraLife.clone();
        GAME.level = 1; //1
        GAME.lives = 3; //3
        GAME.score = 0;

        GAME.fps = new FPS_short_term_measurement(300);
        if (DEBUG._2D_display) GRID.grid();

        GAME.levelStart();
    },
    WebGL_settings() {
        WebGL.INI.BACKGROUND_ALPHA = 0.0;
    },
    levelStart() {
        if (DEBUG.VERBOSE) console.log("Starting level", GAME.level);
        GAME.prepareForRestart();
        HERO.construct();
        this.levelComplete = false;
        GAME.initLevel(GAME.level);
        GAME.continueLevel();
    },
    continueLevel() {
        if (DEBUG.VERBOSE) console.log("Continue level", GAME.level);
        HERO.dead = false;
        HERO.playerSetUp();
        GAME.setCameraView();
        GAME.setWorld();
        GAME.levelExecute();
    },
    levelExecute() {
        if (DEBUG.VERBOSE) {
            console.line();
            console.log("\nExecute level", GAME.level, "\n\n");
            console.line();
        }

        ENGINE.VIEWPORT.reset();
        ENGINE.VIEWPORT.check(HERO.player.actor.pos);
        ENGINE.VIEWPORT.alignToPosition(HERO.player.actor.pos, HERO.player.actor.vPos);
        //ENGINE.VIEWPORT.report();

        GAME.time = new Timer("main");
        GAME.drawFirstFrame(GAME.level);
        ENGINE.GAME.resume();
    },
    setCameraView() {
        WebGL.hero.camera2D = new $2D_Camera(ENGINE.gameWIDTH, ENGINE.gameHEIGHT);
        WebGL.camera = WebGL.hero.camera2D;
    },
    initLevel(level) {
        if (DEBUG.VERBOSE) console.info("init level", level);
        this.newDungeon(level);
        this.buildWorld(level);
        ENGINE.VIEWPORT.setMax({ x: MAP[level].pw, y: MAP[level].ph });
        this.createBitmaps(level);
        this.addMask(level);
    },
    async createBitmaps(level) {
        await BITMAP.store(TEXTURE[`final_level_${level}`], "screen");
        //await BITMAP.store(TEXTURE[`mask_level_${level}`], "screen"); //debug
    },
    addMask(level) {
        MAP[level].map.maskdata = ENGINE.imgToBinaryMask(TEXTURE[`mask_level_${level}`]);
    },
    setWorld() {
        WebGL.init2D('webgl');
    },
    buildWorld(level) {
        if (DEBUG.VERBOSE) console.info(" ******** building world, room/dungeon/level:", level);
        WebGL.init_required_IAM(MAP[level].map, HERO);
        //spawn from here - not yet implemented
    },
    newDungeon(level) {
        MAP_TOOLS.unpack(level);
        MAP[level].unpacked = false;
    },
    prepareForRestart() {
        let clear = ["background", "text", "FPS", "button", "bottomText", "fill"];
        ENGINE.clearManylayers(clear);
        TITLE.blackBackgrounds();
        ENGINE.TIMERS.clear();
    },
    async setup() {
        console.log("GAME SETUP started");
        $("#conv").remove();
        GAME.WebGL_settings();
        WebGL.setContext('webgl');
        await ASSET.convertToTextures();
    },
    setTitle() {
        const text = GAME.generateTitleText();
        const RD = new RenderData("Booga", 24, "#0E0", "bottomText");
        const SQ = new RectArea(0, 0, LAYER.bottomText.canvas.width, LAYER.bottomText.canvas.height);
        GAME.movingText = new MovingText(text, 4, RD, SQ);
    },
    generateTitleText() {
        let text = `${PRG.NAME} ${PRG.VERSION
            }, a game by Lovro Selič, ${"\u00A9"} LaughingSkull ${PRG.YEAR
            }. 
             
            Music: 'Expect No Mercy' written and performed by LaughingSkull, ${"\u00A9"
            } 2009 Lovro Selič. `;
        text += "     ENGINE, SPEECH, GRID, MAZE, Burrows-Wheeler RLE Compression, WebGL, shaders and GAME code by Lovro Selič using JavaScript and GLSL. ";
        text += "     glMatrix library by Brandon Jones and Colin MacKenzie IV. Thanks. ";
        text = text.split("").join(String.fromCharCode(8202));
        return text;
    },
    runTitle() {
        if (ENGINE.GAME.stopAnimation) return;
        GAME.movingText.process();
        GAME.titleFrameDraw();
    },
    titleFrameDraw() {
        GAME.movingText.draw();
    },
    drawFirstFrame(level) {
        if (DEBUG.VERBOSE) console.log("drawing first frame");
        if (DEBUG._2D_display) GRID.paintCoord("coord", MAP.main.map);
        TITLE.firstFrame();
    },
    run(lapsedTime) {
        if (ENGINE.GAME.stopAnimation) return;
        const date = Date.now();
        GAME.respond(lapsedTime);
        ENGINE.TIMERS.update();
        HERO.manage(lapsedTime);
        //PLANE_GRID1D.manage(lapsedTime);
        GAME.frameDraw(lapsedTime);
        HERO.concludeAction(lapsedTime);
        if (HERO.dead) IAM.checkIfProcessesComplete([EXPLOSION3D], HERO.death);
        if (GAME.completed) GAME.won();
    },
    frameDraw(lapsedTime) {
        GAME.updateVieport();
        WebGL.render2DScene(MAP[GAME.level].map);
        TITLE.time();
        TITLE.jumpPower();
        if (DEBUG.FPS) {
            GAME.FPS(lapsedTime);
        }
    },
    updateVieport() {
        if (!ENGINE.VIEWPORT.changed) return;
        ENGINE.VIEWPORT.change(BITMAP.screen, "background");
        ENGINE.VIEWPORT.changed = false;
    },
    respond(lapsedTime) {
        if (HERO.dead) return;
        if (GAME.levelComplete) return;

        HERO.player.respond(lapsedTime);
        WebGL.GAME.respond(lapsedTime);
        ENGINE.GAME.respond(lapsedTime);

        const map = ENGINE.GAME.keymap;

        //debug
        if (map[ENGINE.KEY.map.F7]) {
            if (!DEBUG.keys) return;
        }
        if (map[ENGINE.KEY.map.F8]) {
            if (!DEBUG.keys) return;

            ENGINE.GAME.keymap[ENGINE.KEY.map.F8] = false;

            console.log("\nDEBUG:");
            console.log("#######################################################");

            console.log("#######################################################");
        }
        if (map[ENGINE.KEY.map.F9]) {
            ENGINE.GAME.keymap[ENGINE.KEY.map.F9] = false;

            if (!DEBUG.keys) return;

            console.log("\nDEBUG:");
            console.log("#######################################################");

            console.log("#######################################################");
        }

        return;
    },
    FPS(lapsedTime) {
        let CTX = LAYER.FPS;
        CTX.fillStyle = "white";
        ENGINE.clearLayer("FPS");
        let fps = 1000 / lapsedTime || 0;
        GAME.fps.update(fps);
        CTX.fillText(GAME.fps.getFps(), 5, 10);
    },
    gameOverRun(lapsedTime) {
        if (ENGINE.GAME.stopAnimation) return;
        if (ENGINE.GAME.keymap[ENGINE.KEY.map.enter]) {
            ENGINE.GAME.ANIMATION.waitThen(TITLE.startTitle);
        }
        const date = Date.now();
        WebGL.GAME.setThirdPerson();
        EXPLOSION3D.manage(date);
        ENTITY3D.manage(lapsedTime, date, [HERO.invisible, HERO.dead]);
        GAME.lifeLostFrameDraw(lapsedTime);
    },
    checkScore() {
        SCORE.checkScore(GAME.score);
        SCORE.hiScore();
    },
    /*goalReachedRun() {
        if (ENGINE.GAME.stopAnimation) return;
        GAME.time.decrease(1);
        GAME.score += INI.SCORE_PER_SECOND;
        const remains = GAME.time.remains();
        if (remains <= 0) {
            HERO.to_fill--;
            if (HERO.to_fill === 0) return HERO.completeLevel();
            HERO.playerSetUp();
            ENGINE.GAME.resume();
        }

        GAME.goalReachedFrameDraw();
    },*/
    /*goalReachedFrameDraw() {
        TITLE.time();
        TITLE.score();
    }*/
};

const TITLE = {
    startTitle() {
        if (DEBUG.VERBOSE) console.log("TITLE started");
        //if (AUDIO.Title) AUDIO.Title.play(); //dev

        ENGINE.GAME.pauseBlock();
        TITLE.clearAllLayers();
        TITLE.blackBackgrounds();
        TITLE.titlePlot();
        ENGINE.draw("background", (ENGINE.gameWIDTH - TEXTURE.Title.width) / 2, (ENGINE.gameHEIGHT - TEXTURE.Title.height) / 2, TEXTURE.Title);
        $("#DOWN")[0].scrollIntoView();
        ENGINE.topCanvas = ENGINE.getCanvasName("ROOM");
        TITLE.drawButtons();
        GAME.setTitle();
        ENGINE.GAME.start(16);
        ENGINE.GAME.ANIMATION.next(GAME.runTitle);
    },
    clearAllLayers() {
        ENGINE.layersToClear = new Set(["text",
            "sideback", "button", "title", "FPS", "info", "subtitle",
            "score", "level", "hiscore",
            "lives", "time", "jump",
            "fill",
            "grid", "coord",
            "bottomText"]);
        ENGINE.clearLayerStack();
        WebGL.transparent();
    },
    blackBackgrounds() {
        this.topBackground();
        this.bottomBackground();
        this.sideBackground();
        ENGINE.fillLayer("background", "#000");
    },
    topBackground() {
        const CTX = LAYER.title;
        CTX.fillStyle = "#000";
        CTX.roundRectLegacy(0, 0, ENGINE.titleWIDTH, ENGINE.titleHEIGHT, { upperLeft: 20, upperRight: 20, lowerLeft: 0, lowerRight: 0 }, true, true);
    },
    bottomBackground() {
        const CTX = LAYER.bottom;
        CTX.fillStyle = "#000";
        CTX.roundRectLegacy(0, 0, ENGINE.bottomWIDTH, ENGINE.bottomHEIGHT, { upperLeft: 0, upperRight: 0, lowerLeft: 20, lowerRight: 20 }, true, true);
    },
    sideBackground() {
        ENGINE.fillLayer("sideback", "#000");
        ENGINE.fillLayer("Lsideback", "#000");
    },
    makeGrad(CTX, x, y, w, h) {
        const grad = CTX.createLinearGradient(x, y, x + w, y + h);
        //const grad = CTX.createLinearGradient(x, y, w, h);

        grad.addColorStop(0.000, "#3A0000");
        grad.addColorStop(0.025, "#510000");
        grad.addColorStop(0.050, "#690000");
        grad.addColorStop(0.075, "#810000");
        grad.addColorStop(0.100, "#990000");

        grad.addColorStop(0.125, "#B00000");
        grad.addColorStop(0.150, "#C80000");
        grad.addColorStop(0.175, "#DD1200");
        grad.addColorStop(0.200, "#EF2A00");
        grad.addColorStop(0.225, "#FF4400");

        grad.addColorStop(0.250, "#FF6000");
        grad.addColorStop(0.275, "#FF7A00");
        grad.addColorStop(0.300, "#FF9500");
        grad.addColorStop(0.325, "#FFB000");
        grad.addColorStop(0.350, "#FFD000");

        grad.addColorStop(0.375, "#EFFF00");
        grad.addColorStop(0.400, "#CFFF00");
        grad.addColorStop(0.425, "#AAFF00");
        grad.addColorStop(0.450, "#82F800");
        grad.addColorStop(0.475, "#5CEB00");

        grad.addColorStop(0.500, "#32D900");
        grad.addColorStop(0.525, "#18C800");
        grad.addColorStop(0.550, "#00B800");
        grad.addColorStop(0.575, "#00A828");
        grad.addColorStop(0.600, "#00994A");

        grad.addColorStop(0.625, "#008C66");
        grad.addColorStop(0.650, "#007F7F");
        grad.addColorStop(0.675, "#007399");
        grad.addColorStop(0.700, "#0068B0");
        grad.addColorStop(0.725, "#005FC8");

        grad.addColorStop(0.750, "#0056DD");
        grad.addColorStop(0.775, "#004CEF");
        grad.addColorStop(0.800, "#0040FF");
        grad.addColorStop(0.825, "#0034E8");
        grad.addColorStop(0.850, "#002BD0");

        grad.addColorStop(0.875, "#0023B8");
        grad.addColorStop(0.900, "#001C9F");
        grad.addColorStop(0.925, "#001688");
        grad.addColorStop(0.950, "#001171");
        grad.addColorStop(0.975, "#000C59");
        grad.addColorStop(1.000, "#000842");

        return grad;
    },
    titlePlot() {
        const CTX = LAYER.title;
        const fs = 64;
        CTX.font = fs + "px Booga";
        CTX.textAlign = "center";
        let txt = CTX.measureText(PRG.NAME);
        let x = ENGINE.titleWIDTH / 2;
        let y = fs;
        let gx = x - txt.width / 2;
        let gy = y - fs;
        let grad = this.makeGrad(CTX, gx, gy + 10, gx, gy + fs);
        CTX.fillStyle = grad;
        GAME.grad = grad;
        CTX.shadowColor = "#666666";
        CTX.shadowOffsetX = 2;
        CTX.shadowOffsetY = 2;
        CTX.shadowBlur = 3;
        CTX.fillText(PRG.NAME, x, y);
    },
    smalTitle() {
        const CTX = LAYER.title;
        const fs = 20;
        CTX.font = fs + "px Booga";
        CTX.textAlign = "center";
        let txt = CTX.measureText(PRG.NAME);
        let x = ENGINE.titleWIDTH / 2;
        let y = fs + 2;
        let gx = x - txt.width / 2;
        let gy = y - fs;
        let grad = this.makeGrad(CTX, gx, gy + 10, gx, gy + fs);
        CTX.fillStyle = grad;
        GAME.grad = grad;
        CTX.shadowColor = "#666666";
        CTX.shadowOffsetX = 1;
        CTX.shadowOffsetY = 1;
        CTX.shadowBlur = 1;
        CTX.fillText(PRG.NAME, x, y);
    },
    drawButtons() {
        ENGINE.clearLayer("button");
        FORM.BUTTON.POOL.clear();
        let x = 8;
        const w = 100;
        const h = 24;
        const F = 1.5;
        let y = 768 - 3 * (F * h);

        const buttonColors = new ColorInfo("#F00", "#A00", "#222", "#666", 13);
        const musicColors = new ColorInfo("#0E0", "#090", "#222", "#666", 13);

        y += F * h;
        FORM.BUTTON.POOL.push(new Button("Start game", new Area(x, y, w, h), buttonColors, GAME.start));

        y += F * h;
        FORM.BUTTON.POOL.push(new Button("Title music", new Area(x, y, w, h), musicColors, TITLE.music));

        FORM.BUTTON.draw();
        $(ENGINE.topCanvas).on("mousemove", { layer: ENGINE.topCanvas }, ENGINE.mouseOver);
        $(ENGINE.topCanvas).on("click", { layer: ENGINE.topCanvas }, ENGINE.mouseClick);
    },
    firstFrame() {
        TITLE.score();
        TITLE.stage();
        TITLE.hiscore();
        TITLE.lives();
        TITLE.time();
        TITLE.jumpPower();
        TITLE.smalTitle();
    },
    music() {
        AUDIO.Title.play();
    },
    jumpPower() {
        const CTX = LAYER.time;
        ENGINE.clearLayer("jump");
        const x = 64;
        const h = 12;
        const y = ENGINE.titleHEIGHT - h - 1 - 16;
        const w = ENGINE.gameWIDTH;
        const fraction = HERO.jumpPower / INI.MAX_JUMP_POWER;
        ENGINE.percentBar(fraction, y, CTX, w, ["green", "yellow", "red"], h, x, 0);
    },
    time() {
        const CTX = LAYER.time;
        ENGINE.clearLayer("time");
        const x = 400 + 32;
        const fs = 18;
        const y = ENGINE.titleHEIGHT / 2 + fs / 4;
        CTX.font = fs + "px Booga";
        CTX.textAlign = "left";
        CTX.fillStyle = "rgb(11, 239, 11)";
        CTX.shadowColor = "#24843a";
        CTX.shadowOffsetX = 1;
        CTX.shadowOffsetY = 1;
        CTX.shadowBlur = 1;
        const time = GAME.time.time();
        CTX.fillText(`Time: ${time.m.toString().padStart(2, "0")}:${time.s.toString().padStart(2, "0")}`, x, y);

    },
    score() {
        ENGINE.clearLayer("score");
        const CTX = LAYER.score;
        const fs = 18;
        const x = 64;
        const y = ENGINE.titleHEIGHT / 2 + fs / 4;
        CTX.font = fs + "px Booga";
        CTX.textAlign = "left";
        CTX.fillStyle = "rgb(10, 149, 10)";
        CTX.shadowColor = "#666";
        CTX.shadowOffsetX = 1;
        CTX.shadowOffsetY = 1;
        CTX.shadowBlur = 1;
        CTX.fillText(`Score: ${GAME.score.toString().padStart(5, "0")}`, x, y);
        if (GAME.score >= GAME.extraLife[0]) {
            GAME.lives++;
            GAME.extraLife.shift();
            TITLE.lives();
            AUDIO.ExtraLife.play();
        }
    },
    stage() {
        ENGINE.clearLayer("level");
        const CTX = LAYER.level;
        const fs = 18;
        const x = 240 + 32;
        const y = ENGINE.titleHEIGHT / 2 + fs / 4;
        CTX.font = fs + "px Booga";
        CTX.textAlign = "left";
        CTX.fillStyle = "#146dfb";
        CTX.shadowColor = "#666";
        CTX.shadowOffsetX = 1;
        CTX.shadowOffsetY = 1;
        CTX.shadowBlur = 1;
        CTX.fillText(`Stage: ${GAME.level.toString().padStart(1, "0")}`, x, y);
    },
    hiscore() {
        ENGINE.clearLayer("hiscore");
        const CTX = LAYER.hiscore;
        const fs = 18;
        const x = ENGINE.gameWIDTH + INI.SCREEN_BORDER;;
        const y = ENGINE.titleHEIGHT / 2 + fs / 4;
        CTX.font = fs + "px Booga";
        CTX.textAlign = "right";
        CTX.fillStyle = "#dc0d0d";
        CTX.shadowColor = "#666";
        CTX.shadowOffsetX = 1;
        CTX.shadowOffsetY = 1;
        CTX.shadowBlur = 1;
        let HS;
        const index = SCORE.SCORE.name[0].indexOf("&nbsp");
        if (index > 0) {
            HS = SCORE.SCORE.name[0].substring(0, SCORE.SCORE.name[0].indexOf("&nbsp"));
        } else {
            HS = SCORE.SCORE.name[0];
        }
        const text = "HISCORE: " + SCORE.SCORE.value[0].toString().padStart(5, "0") + " by " + HS;
        CTX.fillText(text, x, y);
    },
    lives() {
        ENGINE.clearLayer("lives");
        if (GAME.lives < 1) return;
        const CTX = LAYER.lives;
        const cX = ENGINE.bottomWIDTH / 2;
        const y = ENGINE.bottomHEIGHT / 2;
        const spread = ENGINE.spreadAroundCenter(GAME.lives - 1, cX, 72);
        for (let x of spread) {
            ENGINE.spriteDraw("lives", x, y, SPRITE.Lives);
        }
    }
};

// -- main --
$(() => {
    PRG.INIT();
    PRG.setup();
    ENGINE.LOAD.preload();
    UNIFORM.setup();
    SCORE.init("SC", "BOOGA", 10, 1000);
    SCORE.loadHS();
    SCORE.hiScore();
    SCORE.extraLife = [Infinity];
});