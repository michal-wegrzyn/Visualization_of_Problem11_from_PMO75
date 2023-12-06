let c;
let ctx;
let n;

let board = [];
var SIZE = 800;
let a;
let graph = [];

let SQRT3 = Math.sqrt(3);

function hexagonId(row, col) {
    return (row * (row + 1)) / 2 + col;
}

function vertexId(row, col, dir) {
    return hexagonId(row, col) * 6 + dir;
}

function isCycle() {
    if (n == 1) return true;
    let cycle = [0];
    while (graph[graph[cycle[cycle.length - 1]][0]][1] != 0) {
        cycle.push(graph[graph[cycle[cycle.length - 1]][0]][1]);
    }
    res = cycle.length == ((n - 1) * n * 3) / 2;
    if (res) {
        $("#cycle").text("Cycle");
        $("#cycle").css("background-color", "green");
        $("#cycle").css("color", "white");
    } else {
        $("#cycle").text("Not a cycle");
        $("#cycle").css("background-color", "white");
        $("#cycle").css("color", "black");
    }
    return res;
}

function setN(value) {
    n = value;
    a = SIZE / n / SQRT3;
    board = [];
    graph = [];
    for (let i = 1; i <= ((n - 1) * n) / 2; i++) {
        board.push(1);
        for (let cnt = 0; cnt < 6; cnt++) graph.push([-1, 0]);
    }

    if (n == 1) {
        drawBoard();
        return;
    }

    for (let row = 0; row < n - 1; row++) {
        for (let col = 0; col <= row; col++) {
            if (row > 0) {
                graph[vertexId(row, col, 0)][0] = vertexId(row - 1, col, 3);
                graph[vertexId(row - 1, col, 3)][0] = vertexId(row, col, 0);
            }
            if (col < row) {
                graph[vertexId(row, col, 1)][0] = vertexId(row, col + 1, 4);
                graph[vertexId(row, col + 1, 4)][0] = vertexId(row, col, 1);
            }
            if (row < n - 2) {
                graph[vertexId(row, col, 2)][0] = vertexId(row + 1, col + 1, 5);
                graph[vertexId(row + 1, col + 1, 5)][0] = vertexId(row, col, 2);
            }
        }
    }

    graph[vertexId(0, 0, 0)][0] = vertexId(0, 0, 5);
    graph[vertexId(0, 0, 5)][0] = vertexId(0, 0, 0);
    graph[vertexId(n - 2, 0, 3)][0] = vertexId(n - 2, 0, 4);
    graph[vertexId(n - 2, 0, 4)][0] = vertexId(n - 2, 0, 3);
    graph[vertexId(n - 2, n - 2, 1)][0] = vertexId(n - 2, n - 2, 2);
    graph[vertexId(n - 2, n - 2, 2)][0] = vertexId(n - 2, n - 2, 1);

    for (let row = 0; row < n - 2; row++) {
        graph[vertexId(row, 0, 4)][0] = vertexId(row + 1, 0, 5);
        graph[vertexId(row + 1, 0, 5)][0] = vertexId(row, 0, 4);
    }
    for (let row = 0; row < n - 2; row++) {
        graph[vertexId(row, row, 1)][0] = vertexId(row + 1, row + 1, 0);
        graph[vertexId(row + 1, row + 1, 0)][0] = vertexId(row, row, 1);
    }
    for (let col = 0; col < n - 2; col++) {
        graph[vertexId(n - 2, col, 2)][0] = vertexId(n - 2, col + 1, 3);
        graph[vertexId(n - 2, col + 1, 3)][0] = vertexId(n - 2, col, 2);
    }

    drawBoard(n);
}

function hexagonCoords(row, col, id) {
    // -1 center
    // 0 - 5 vertices
    // 6 - 11 edge centers

    let center = [
        a * SQRT3 * col + (SQRT3 / 2) * (n - row) * a,
        2 * a + row * a * 1.5,
    ];

    if (id == -1) return center;

    if (id < 6) {
        return [
            center[0] + a * Math.sin((Math.PI / 3) * id),
            center[1] - a * Math.cos((Math.PI / 3) * id),
        ];
    } else {
        return [
            center[0] +
                ((a * SQRT3) / 2) * Math.sin((Math.PI / 3) * id + Math.PI / 6),
            center[1] -
                ((a * SQRT3) / 2) * Math.cos((Math.PI / 3) * id + Math.PI / 6),
        ];
    }
}

function drawHexagon(row, col) {
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(...hexagonCoords(row, col, 0));
    for (let i = 1; i < 6; i++) {
        ctx.lineTo(...hexagonCoords(row, col, i));
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#f00";

    if (board[hexagonId(row, col)] == 1) {
        for (let i = 0; i < 6; i += 2) {
            ctx.beginPath();
            ctx.moveTo(...hexagonCoords(row, col, i + 6));
            ctx.lineTo(...hexagonCoords(row, col, i + 7));
            ctx.closePath();
            ctx.stroke();
            graph[vertexId(row, col, i)][1] = vertexId(row, col, i + 1);
            graph[vertexId(row, col, i + 1)][1] = vertexId(row, col, i);
        }
    } else {
        for (let i = 1; i < 6; i += 2) {
            ctx.beginPath();
            ctx.moveTo(...hexagonCoords(row, col, (i % 6) + 6));
            ctx.lineTo(...hexagonCoords(row, col, (i % 6) + 7));
            ctx.closePath();
            ctx.stroke();
            graph[vertexId(row, col, i)][1] = vertexId(row, col, (i + 1) % 6);
            graph[vertexId(row, col, (i + 1) % 6)][1] = vertexId(row, col, i);
        }
    }
}

function drawBoard() {
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.clearRect(0, 0, c.width, c.height);

    ctx.beginPath();
    ctx.moveTo(...hexagonCoords(-1, -1, 1));
    ctx.lineTo(...hexagonCoords(n - 1, 0, 5));
    ctx.lineTo(...hexagonCoords(n - 1, n - 1, 1));

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(...hexagonCoords(-1, -1, 1));
    ctx.lineTo(...hexagonCoords(-1, -1, 2));
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(...hexagonCoords(n - 1, 0, 5));
    ctx.lineTo(...hexagonCoords(n - 1, 0, 0));

    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(...hexagonCoords(n - 1, n - 1, 1));
    ctx.lineTo(...hexagonCoords(n - 1, n - 1, 0));

    ctx.closePath();
    ctx.stroke();

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j <= i; j++) {
            drawHexagon(i, j);
        }
    }

    ctx.strokeStyle = "#f00";
    for (let i = -1; i < n - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(...hexagonCoords(i, i + 1, 10));
        ctx.lineTo(...hexagonCoords(i, i + 1, 9));
        ctx.closePath();
        ctx.stroke();
    }

    for (let i = -1; i < n - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(...hexagonCoords(i, -1, 7));
        ctx.lineTo(...hexagonCoords(i, -1, 8));
        ctx.closePath();
        ctx.stroke();
    }

    for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.moveTo(...hexagonCoords(n - 1, i, 11));
        ctx.lineTo(...hexagonCoords(n - 1, i, 6));
        ctx.closePath();
        ctx.stroke();
    }

    isCycle();
}

$(function () {
    let width = window.innerWidth - 40;
    let height = window.innerHeight - 80;
    SIZE = Math.min(width, (height / SQRT3) * 2);
    $("canvas").attr("width", SIZE + 5);
    $("canvas").attr("height", (SIZE * SQRT3) / 2 + 5);
    c = document.getElementById("c");
    ctx = c.getContext("2d");
    setN(5);
});

$(window).on("resize", function () {
    let width = window.innerWidth - 80;
    let height = window.innerHeight - 70;
    SIZE = Math.min(width, (height / SQRT3) * 2);
    $("canvas").attr("width", SIZE + 5);
    $("canvas").attr("height", (SIZE * SQRT3) / 2 + 5);
    drawBoard();
});

$("#n").on("input", function () {
    console.log($("#n").val());
    if ($("#n").val() == n) $("#submit").attr("value", "Reset");
    else $("#submit").attr("value", "Set n");
});

$("#form").submit(function (e) {
    e.preventDefault();
    $("#submit").attr("value", "Reset");
    setN($("#n").val());
});

$("#download").click(function () {
    var link = document.createElement("a"),
        e;
    link.download =
        "n_" + n + "_" + (isCycle() ? "Cycle" : "NotACycle") + ".png";
    link.href = c.toDataURL("image/png;base64");
    link.click();
});

$("#c").click(function (e) {
    let rect = c.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    let row, col;
    let center;
    for (
        row = Math.floor((y - 1.5 * a) / (1.5 * a));
        row <= Math.floor((y - a) / (1.5 * a));
        row++
    ) {
        if (row < 0 || row >= n - 1) continue;
        col = Math.floor((x - hexagonCoords(row, 0, 5)[0]) / (a * SQRT3));
        if (col < 0 || col > row) continue;
        center = hexagonCoords(row, col, -1);
        center[0] = Math.abs(center[0] - x);
        center[1] = Math.abs(center[1] - y);
        if (center[0] / SQRT3 + center[1] < a && center[0] < (a * SQRT3) / 2) {
            board[hexagonId(row, col)] = 3 - board[hexagonId(row, col)];
            drawHexagon(row, col);
            isCycle();
            return;
        }
    }
});
