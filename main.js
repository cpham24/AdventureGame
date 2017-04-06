// Helper functions

// translate 1D value to 2D coordinate
function translate(n, width, height) {
  var x = Math.floor(n % width);
  var y = Math.floor(n / width);
  return {n:n, x:x, y:y};
};

// generate a random number that has not appeared before in array a
function generateRandom(r, a) {
  var match = true, n;
  while (match) {
    n = Math.round(Math.random() * r);
    if (a[n]) match = true;
    else match = false;
  }
  return n;
};

// shuffle elements in an array
function shuffleArray(a) {
  var n, t;
  for (var i=0; i<a.length; i++) {
    n = Math.floor(Math.random() * a.length-1);
    t = a[n1];
    a[n1] = a[a.length-1];
    a[a.length-1] = t;
  }
}

/*
 *  Name constants
 *
 */

const PRIZES = [
  "Eye of Agamoto",
  "Cloak of Levitation",
  "Staff of Polar Power",
  "Dagger of Life",
  "Vaulting Boots of Valtorr",
  "Seed of Creation",
  "Dorr's Ring",
  "Galdharf's Blessing",
  "Mermaid Tear",
  "Letter of Azarus"
];

const CHALLENGES = [
  "Kiron the Immortal Dragon",
  "Supreme Sorcerer Sinak",
  "Keeper of Space and Time",
  "the Pit of Fire",
  "the Ocean of Death",
  "the Stairway to Hell",
  "the Frozen Stone"
];

const CHALLENGE_HP = [
  5,
  5,
  5,
  3,
  3,
  3,
  3  
];

/*
 *  Game objects
 *
 */

function createGame(width, height) {
  var player = {
    name: "Player",
    hp: 10,
    prizes: [],
    x: -1,
    y: -1
  }
  var map = [];
  var history = [];
  for (var x=0; x<width; x++) {
    map[x] = [];
    history[x] = [];
    for (var y=0; y<height; y++) {
      map[x][y] = "NOTHING";
      history[x][y] = "Unexplored";
    }
  }
  return {
    running: true,
    fog: true,
    inputEnabled: true,
    player: player,
    width: width,
    height: height,
    map: map,
    history: history,
    currentMsg: "Ahead is darkness, and you have no idea where you are."
  };
}

function createChallenge(name, hp, prize, x, y, funct) {
  return {
    name: name,
    hp: hp,
    prize: prize,
    x: x,
    y: y,
    activate: funct
  };
};

function setup() {
  var m = createGame(8, 8);

  var p_loc = translate(Math.round(Math.random() * 63), 8, 8);
  m.player.x = p_loc.x;
  m.player.y = p_loc.y;
  m.history[p_loc.x][p_loc.y] = "Start";

  var a = [];
  a[p_loc.n] = true;

  var exit = translate(generateRandom(63, a), 8, 8);
  m.map[exit.x][exit.y] = createChallenge("EXIT", 0, null, exit.x, exit.y,
    function() {
      if (m.player.prizes.length >= 2) {
        m.currentMsg = "You have reached <span style=\"color:c00000;\">the Gate</span> with enough prizes.\nCongratulations!";
        m.running = false;
      }
      else
        m.currentMsg = "You have reached <span style=\"color:c00000;\">the Gate</span>.\nIt seems you need to <span style=\"color:c00000;\">insert 2 prizes</span> to open it.\n";
    }
  );
  a[exit.n] = true;

  for (var i=0; i<16; i++) {
    var wall = translate(generateRandom(63, a), 8, 8);
    m.map[wall.x][wall.y] = "WALL";
    a[wall.n] = true;
  }

  var b = [];
  var c = [];
  var scope = this;
  for (var i=0; i<7; i++) {
    var challenge = translate(generateRandom(63, a), 8, 8);
    var n = generateRandom(CHALLENGES.length-1, b);
    var k = generateRandom(PRIZES.length-1, c);
    m.map[challenge.x][challenge.y] = createChallenge(CHALLENGES[n], CHALLENGE_HP[n], PRIZES[k], challenge.x, challenge.y,
      function() {
        m.currentMsg = "Would you challenge <span style=\"color:c00000;\">" + this.name + "</span>? <button class=\"btn-yes\" onclick=\"btnYes()\">YES</button> <button class=\"btn-no\" onclick=\"btnNo()\">NO</button>";
        m.inputEnabled = false;
        var ch = this;
        scope.btnYes = function() {
          if(Math.round(Math.random() * 100) >= 50) {
            m.currentMsg = "You bravely overcame <span style=\"color:c00000;\">" + ch.name + "</span> and received <span style=\"color:c00000;\">" + ch.prize + "</span> as a reward.";
            m.history[ch.x][ch.y] = "You challenged " + ch.name + " here on won " + ch.prize + ".";
            m.player.prizes.push(ch.prize);
          }
          else {
            m.player.hp -= ch.hp;
            m.currentMsg = "Your efforts were in vain. You took <span style=\"color:c00000;\">" + ch.hp + "HP</span> damage from <span style=\"color:c00000;\">" + ch.name + "</span>.";
            m.history[ch.x][ch.y] = "You challenged " + ch.name + " here and took " + ch.hp + " HP damage.";
          }
          m.map[ch.x][ch.y] = "NOTHING";
          m.player.x = ch.x;
          m.player.y = ch.y;
          m.inputEnabled = true;

          if (m.player.hp <= 0) {
            m.currentMsg += "<br/>You <span style=\"color:c00000;\">ran out of HP</span> and fainted. Game over! (refresh to restart)";
            m.running = false;
          }

          print(m);
        }
        scope.btnNo = function() {
          m.currentMsg = "You gave up on challenging <span style=\"color:c00000;\">" + ch.name + "</span>.";
          m.inputEnabled = true;
          print(m);
        }
      }
    );
    a[challenge.n] = true;
    b[n] = true;
    c[k] = true;
  }

  for (var i=0; i<2; i++) {
    var treasure = translate(generateRandom(63, a), 8, 8);
    var n = generateRandom(PRIZES.length-1, c);
    m.map[treasure.x][treasure.y] = PRIZES[n];
    a[treasure.n] = true;
    c[n] = true;
  }

  return m;
};

function adjacentToPlayer(m, x, y) {
  if ((Math.abs(x - m.player.x) == 1 && y == m.player.y) || (x == m.player.x && Math.abs(y - m.player.y) == 1))
    return true;
  return false;
}

function outputCSS() {
  var css = ".div-table {\n"
          + "  display:table;\n"
          + "  width:512px;\n"
          + "  height:512px;\n"
          + "}\n"
          + ".div-row {\n"
          + "  display:table-row;\n"
          + "  height:64px;\n"
          + "}\n"
          + ".div-cell {\n"
          + "  cursor: default;\n"
          + "  -webkit-touch-callout: none;\n"
          + "  -webkit-user-select: none;\n"
          + "  -khtml-user-select: none;\n"
          + "  -moz-user-select: none;\n"
          + "  -ms-user-select: none;\n"
          + "  user-select: none;\n"
          + "  display:table-cell;\n"
          + "  vertical-align:middle;\n"
          + "  text-align:center;\n"
          + "  width:64px;\n"
          + "  height:64px;\n"
          + "  font-size:54px;\n"
          + "}\n"
          + ".div-clickable {\n"
          + "  cursor: pointer;\n"
          + "}\n"
          + ".btn-yes {\n"
          + "  color: 00a000;\n"
          + "  font-weight: bolder;\n"
          + "}\n"
          + ".btn-no {\n"
          + "  color: ffa000;\n"
          + "  font-weight: bolder;\n"
          + "}\n";
  var style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = css;
  document.head.appendChild(style);
}

function createCell(m, x, y, color, bg_color, text, title) {
  return "<div " + ((m.running && m.inputEnabled && adjacentToPlayer(m, x, y)) ? ("onclick=\"clickEvent(" + x + "," + y + ")\"") : "") + " class=\"div-cell" + ((m.running && m.inputEnabled && adjacentToPlayer(m, x, y)) ? " div-clickable" : "") + "\" style=\"color:" + color + ";" + ((bg_color != null) ? " background-color:" + bg_color + ";" : "") + "\" title=\"" + title + "\">" + text + "</div>\n";
};

function setupClickEvent(m) {
  this.clickEvent = function(x, y) {
    if (adjacentToPlayer(m, x, y)) {
      movePlayer(m, x, y);
      print(m);
    }
  }
}

function print(m) {
  var doc, row;
  if (document.body != null)
    document.body.innerHTML = "";
  doc = "<h4 style=\"font-family: sans-serif\"><small style=\"color:606060\">HP:</small>" + m.player.hp + " <small style=\"color:606060\">Prizes:</small>" + m.player.prizes.length + " <small style=\"color:606060\">(click adjacent to move, hover to see details)</small></h4>\n";
  doc += "<div style=\"font-family: sans-serif; font-size: 14; font-weight: bold;\">" + m.currentMsg + "</div>\n<br/>\n";
  doc += "<div class=\"div-table\" style=\"font-family: monospace; font-size: 20; border: 1px solid black; border-collapse: collapse; background-color: c0c0c0;\">\n";
  for (var y=0; y<8; y++) {
    row = "<div class=\"div-row\">\n";
    for (var x=0; x<8; x++) {
      if (m.player.x == x && m.player.y == y) {
        if (!m.running && m.map[m.player.x][m.player.y].name == "EXIT")
          row += createCell(m, x, y, "40d000", "e8e8e8", "&#x25a1;", "You reached the Gate here.");
        else if (!m.running)
          row += createCell(m, x, y, "e06040", "e8e8e8", "&#x25c9;", "This is your avatar.");
        else if (!m.fog)
          row += createCell(m, x, y, "ff2000", "e8e8e8", "&#x25c9;", "This is your avatar.");
        else
          row += createCell(m, x, y, "ff2000", "ffffff", "&#x25c9;", "This is your avatar.");
      }
      else if (m.fog && m.history[x][y] == "Unexplored" && (!adjacentToPlayer(m, x, y) || !m.running)) {
        row += createCell(m, x, y, "ffffff", "202020", "&nbsp;", "Unexplored");
      }
      else {
        if (m.map[x][y] == "NOTHING") {
          if (!m.fog || m.history[x][y] == "Unexplored" || (adjacentToPlayer(m, x, y) && m.running)) {
            if (m.history[x][y].substring(0, 9) == "You found")
              row += createCell(m, x, y, "ffa000", "e8e8e8", "&#x25c7;", m.history[x][y]);
            else if (m.history[x][y].substring(0, 9) == "You chall")
              row += createCell(m, x, y, "0080d0", "e8e8e8", "&#x25cc;", m.history[x][y]);
            else if (!m.running && m.history[x][y].substring(0, 5) == "Start")
              row += createCell(m, x, y, "e03020", "e8e8e8", "&#x25cc;", "You started here.");
            else
              row += createCell(m, x, y, "ffffff", "e8e8e8", "&nbsp;", m.history[x][y]);
          }
          else if (m.history[x][y].substring(0, 9) == "You found")
            row += createCell(m, x, y, "ffa000", null, "&#x25c7;", m.history[x][y]);
          else if (m.history[x][y].substring(0, 9) == "You chall")
            row += createCell(m, x, y, "0080d0", null, "&#x25cc;", m.history[x][y]);
          else if (!m.running && m.history[x][y].substring(0, 5) == "Start")
            row += createCell(m, x, y, "e03020", null, "&#x25cc;", "You started here.");
          else
            row += createCell(m, x, y, "ffffff", null, "&nbsp;", m.history[x][y]);
        }
        else if (m.map[x][y] == "WALL") {
          row += createCell(m, x, y, "ffffff", "606060", "&nbsp;", "It's a solid blackness!\nNot even light reflects off of it.");
        }
        else {
          var matched = false;
          for (var i=0; i<PRIZES.length; i++) {
            if (m.map[x][y] == PRIZES[i]) matched = true;
          }
          if (matched) {
            row += createCell(m, x, y, "ffa000", "e8e8e8", "&#x25c8;", "Something catches your eyes.\nIt seems to be valuable.");
          }
          else {
            if (m.map[x][y].name == "EXIT") {
              if (!m.fog || m.history[x][y] == "Unexplored" || (adjacentToPlayer(m, x, y) && m.running))
                row += createCell(m, x, y, "40d000", "e8e8e8", "&#x25a9;", "The Gate to the next level.");
              else
                row += createCell(m, x, y, "40d000", null, "&#x25a9;", "The Gate to the next level.");
            }
            else {
              row += createCell(m, x, y, "00d0ff", "e8e8e8", "&#x25c9;", "Something ominous lurks in the dark.\nYou have a bad feeling about it.");
            }
          }
        }
      }
    }
    row += "</div>\n";
    doc += row;
  }
  doc += "</div>\n";
  document.body.innerHTML = doc;
};

function movePlayer(m, x, y) {
  if (x < 0 || y < 0 || x > 7 || y > 7) {
    m.currentMsg = "Something was blocking your path. You needed to find <span style=\"color:c00000;\">another way</span>.";
    return;
  }

  switch(m.map[x][y]) {
    case "NOTHING":
      m.player.x = x;
      m.player.y = y;
      if (m.history[x][y].substring(0, 10) == "Unexplored")
        m.history[x][y] = "Explored";
      break;
    case "WALL":
      m.currentMsg = "Something was blocking your path. You needed to find <span style=\"color:c00000;\">another way</span>.";
      break;
    default:
      var matched = false;
      for (var i=0; i<PRIZES.length; i++) {
        if (m.map[x][y] == PRIZES[i]) matched = true;
      }
      if (matched) {
        m.currentMsg = "You found a prize! It's the <span style=\"color:c00000;\">" + m.map[x][y] + "</span>!";
        m.player.x = x;
        m.player.y = y;
        m.history[x][y] = "You found a treasure chest here. It contained " + m.map[x][y] + ".";
        m.player.prizes.push(m.map[x][y]);
        m.map[x][y] = "NOTHING";
      }
      else {
        if (m.map[x][y].name == "EXIT") {
          m.player.x = x;
          m.player.y = y;
          m.history[x][y] = "Explored";
          m.map[x][y].activate();
        }
        else {
          m.map[x][y].activate();
        }
      }
      break;
  }
}
