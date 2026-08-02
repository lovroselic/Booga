<!DOCTYPE html>
<?php include_once $_SERVER['DOCUMENT_ROOT'] . '/Include/globals.php';?>
<html lang="en">

<head>
    <?php include_once $GL_root . $GL_path . '/Include/head_includes.php';?>

    <meta name="description"
        content="Play Booga, a retro browser-game tribute to Boogaboo the Flea. Charge your jumps, dodge cave creatures, and survive multiple levels of calculated panic." />
    <meta name="keywords"
        content="Booga, Boogaboo clone, arcade game, retro game, browser game, HTML5 game, WebGL game, LaughingSkull" />

    <link rel="canonical" href="https://www.laughingskull.org/Games/Booga/Booga.php">
    <title>Froggess</title>
</head>

<body>
    <?php include_once $GL_root . $GL_path . '/Include/header.php';?>
    <?php include_once $GL_root . $GL_path . '/Include/resolutionAlert.php';?>
    <?php include_once $GL_root . $GL_path . '/Games/Booga/Booga.html.php';?>
    <?php include_once $GL_root . $GL_path . '/Include/footer.php';?>

    <!-- JS -->
    <script src="/Code/JS/Library/Engine/Prototype_5_04.js" type="text/javascript"></script>
    <script src="/Code/JS/Library/Engine/ENGINE_5_04.js" type="text/javascript"></script>
    <script src="/Code/JS/Library/Engine/GRID_4_05.js" type="text/javascript"></script>
    <script src="/Code/JS/Library/Engine/MAZE_5_00.js" type="text/javascript"></script>
    <script src="/Code/JS/Library/Engine/BWT_1_00.js" type="text/javascript"></script>
    <script src='/Code/JS/Library/Engine/IndexArrayManagers_4_03.js'></script>
    <script src='/Code/JS/Library/Engine/AI_3_02.js'></script>
    <script src="/Code/JS/Library/Engine/WebGL_2_04.js" type="text/javascript"></script>
    <script src="/Assets/Definitions/Booga/assets_Booga.js" type="text/javascript"></script>
    <script src="/Assets/Definitions/Booga/MAP_Booga.js" type="text/javascript"></script>
    <script src="/Assets/Definitions/Booga/Monsters_Booga.js" type="text/javascript"></script>
    <script src="/Code/JS/Library/Engine/MAP and SPAWN tools_3_00.js" type="text/javascript"></script>
    <script src="/Code/JS/Library/Misc/score_1_05.js" type="text/javascript"></script>
    <script src="/Games/Booga/Booga.js" type="text/javascript"></script>
</body>

</html>