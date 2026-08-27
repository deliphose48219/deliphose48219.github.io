$(function () {
  // initialize canvas and context when able to
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  window.addEventListener("load", loadJson);

  function setup() {
    if (firstTimeSetup) {
      halleImage = document.getElementById("player");
      projectileImage = document.getElementById("projectile");
      cannonImage = document.getElementById("cannon");
      $(document).on("keydown", handleKeyDown);
      $(document).on("keyup", handleKeyUp);
      firstTimeSetup = false;
      //start game
      setInterval(main, 1000 / frameRate);
    }

    // Create walls - do not delete or modify this code
    createPlatform(-50, -50, canvas.width + 100, 50); // top wall
    createPlatform(
      -50,
      canvas.height - 10,
      canvas.width + 100,
      200,
      "rgb(0, 0, 0)",
    ); // bottom wall
    createPlatform(-50, -50, 50, canvas.height + 500); // left wall
    createPlatform(canvas.width, -50, 50, canvas.height + 100); // right wall

    //////////////////////////////////
    // ONLY CHANGE BELOW THIS POINT //
    //////////////////////////////////

    // TODO 1 - Enable the Grid
    toggleGrid();

    const createGoldGridLine = createFakePlatform;
    createFakePlatform = function (x, y, width, height) {
      createGoldGridLine(x, y, width, height, "gold");
    };

    const createHazardPlatform = createBadPlatform;
    createBadPlatform = function (x, y, width, height, color) {
      createHazardPlatform(x, y, width, height, color);
      createPlatform(x, y, width, height, color);
    };

    const checkBadPlatformCollision = badPlatformCollision;
    badPlatformCollision = function () {
      checkBadPlatformCollision();
      if (currentAnimationType === animationTypes.frontDeath) {
        return;
      }
      for (let hazard = 0; hazard < badPlatforms.length; hazard++) {
        const platform = badPlatforms[hazard];
        const touchingTop =
          player.y + hitBoxHeight >= platform.y &&
          player.y + hitBoxHeight <= platform.y + 2;
        const overlappingHorizontally =
          player.x + hitBoxWidth > platform.x &&
          player.x < platform.x + platform.width;
        if (touchingTop && overlappingHorizontally) {
          currentAnimationType = animationTypes.frontDeath;
          frameIndex = 0;
          return;
        }
      }
    };

    const backgroundStyle = document.createElement("style");
    backgroundStyle.textContent = `
      @import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

      @keyframes platformerBackgroundMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      #canvas.moving-background {
        background: linear-gradient(120deg, #f7f7f7, #c7ab0f, #f7f7f7, #c7ab0f);
        background-size: 300% 300%;
        animation: platformerBackgroundMove 3s ease infinite;
      }
    `;
    document.head.appendChild(backgroundStyle);
    canvas.classList.add("moving-background");

    const originalDeathOfPlayer = deathOfPlayer;
    deathOfPlayer = function () {
      originalDeathOfPlayer();
      if (keyPress.any) {
        return;
      }
      ctx.clearRect(
        canvas.width / 4,
        canvas.height / 6,
        canvas.width / 2,
        canvas.height / 2,
      );
      const animationTime = Date.now() / 1000;
      const titleX = canvas.width / 2;
      const titleY = canvas.height / 3;
      const pulse = 1 + Math.sin(animationTime * 4) * 0.08;

      ctx.save();
      ctx.translate(titleX, titleY - 22);
      ctx.rotate(animationTime * 0.6);
      ctx.strokeStyle = "#ffd84d";
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.45;
      for (let ray = 0; ray < 8; ray++) {
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(78, 0);
        ctx.lineTo(118, 0);
        ctx.stroke();
      }
      ctx.restore();

      ctx.fillStyle = "#ffd84d";
      ctx.textAlign = "center";
      ctx.font = "76px 'Press Start 2P', monospace";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 4;
      ctx.save();
      ctx.translate(titleX, titleY);
      ctx.scale(pulse, pulse);
      ctx.strokeText("GAME OVER", 0, 0);
      ctx.fillText("GAME OVER", 0, 0);
      ctx.restore();
      ctx.font = "16px 'Press Start 2P', monospace";
      ctx.fillText(
        "PRESS ANY KEY TO RESTART",
        canvas.width / 2,
        canvas.height / 2,
      );
      ctx.textAlign = "start";
    };

    winGame = function () {
      if (keyPress.any) {
        keyPress.any = false;
        window.location.reload();
        return;
      }

      const animationTime = Date.now() / 1000;
      const titleX = canvas.width / 2;
      const titleY = canvas.height / 3;
      const pulse = 1 + Math.sin(animationTime * 4) * 0.08;

      ctx.save();
      ctx.translate(titleX, titleY - 28);
      ctx.rotate(animationTime * 0.6);
      ctx.strokeStyle = "#fff176";
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.7;
      for (let ray = 0; ray < 10; ray++) {
        ctx.rotate(Math.PI / 5);
        ctx.beginPath();
        ctx.moveTo(110, 0);
        ctx.lineTo(155, 0);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.translate(titleX, titleY);
      ctx.scale(pulse, pulse);
      ctx.textAlign = "center";
      ctx.font = "76px 'Press Start 2P', monospace";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 5;
      ctx.fillStyle = "#ffd84d";
      ctx.strokeText("YOU WIN!", 0, 0);
      ctx.fillText("YOU WIN!", 0, 0);
      ctx.restore();
      ctx.fillStyle = "white";
      ctx.font = "16px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        "PRESS ANY KEY TO RESTART",
        canvas.width / 2,
        canvas.height / 2,
      );
      ctx.textAlign = "start";
    };

    // TODO 2 - Create Platforms
    createBadPlatform(
      -50,
      canvas.height - 10,
      canvas.width + 100,
      200,
      "orangered",
    );

    createPlatform(70, 650, 100, 10, "black");
    createPlatform(320, 570, 100, 10, "black");
    createPlatform(570, 490, 100, 10, "black");
    createPlatform(820, 410, 100, 10, "black");
    createPlatform(1080, 330, 100, 10, "black");
    createPlatform(900, 220, 160, 10, "black", 900, 900, 0, 160, 300, 2);
    createPlatform(1120, 120, 100, 10, "black");

    createBadPlatform(250, 650, 70, 10, "gold");
    createBadPlatform(500, 570, 70, 10, "gold");
    createBadPlatform(750, 490, 70, 10, "gold");
    createBadPlatform(1000, 410, 80, 10, "gold");
    createBadPlatform(310, 570, 10, 80, "gold");
    createBadPlatform(560, 490, 10, 80, "gold");
    createBadPlatform(810, 410, 10, 80, "gold");
    createBadPlatform(1070, 330, 10, 80, "gold");

    // TODO 3 - Create Collectables
    createCollectable("diamond", 140, 610);
    createCollectable("database", 390, 530);
    createCollectable("grace", 640, 450);
    createCollectable("max", 890, 370);
    createCollectable("steve", 1140, 290);
    createCollectable("kennedi", 960, 160);
    createCollectable("diamond", 1200, 80);

    // TODO 4 - Create Cannons
    createCannon("bottom", 160, 1000, 26, 26);
    createCannon("bottom", 410, 1500, 26, 26);
    createCannon("bottom", 660, 1000, 26, 26);
    createCannon("bottom", 910, 1500, 26, 26);
    createCannon("bottom", 1170, 1000, 26, 26);
    createCannon("left", 250, 1800, 26, 26, 120, 600, 2);
    createCannon("right", 500, 1800, 26, 26, 120, 600, 2);

    //////////////////////////////////
    // ONLY CHANGE ABOVE THIS POINT //
    //////////////////////////////////
  }

  registerSetup(setup);
});
