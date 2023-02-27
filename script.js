const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const infoBox = document.getElementById("info-box");
const infoButton = document.getElementById("info-button");
const intersectionBox = document.getElementById("intersection");

canvas.width = window.innerWidth;
canvas.height = 750;

let x = 0;
let y = 0;
let centers = [];
let radius = [];
let borderPoints = [];
let coordinateDifferences = [];
let intersection = [];
let mouseIsDown = false;
let isClickOnCenter = null;
let onClickBorderPoint = null;
let infoText = "This program allows you to draw two circles based on 4 points you set." +
    "To draw a circle, you simply place two points in the drawing area. " +
    "Also, by holding down the right mouse button on one of the points, you can shift the center (the point on the circle will also move)" +
    ", or change the radius of the circle (by clicking on the point on the circle). You can also clear the drawing area using the 'Reset'" +
    " button or change the order of drawing circles using the 'Change the top circle' button. ";

const colors = new Array(
    "blue",
    "yellow",
)

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

canvas.addEventListener("click", function (event) {
    let x = event.offsetX,
        y = event.offsetY;

    if (borderPoints.length < 2) {
        borderPoints.length === centers.length || centers.length === 0
            ? centers.push(new Point(x, y))
            : borderPoints.push(new Point(x, y));

        printPoint(new Point(x, y));;

        if (borderPoints.length === centers.length) {
            setCirclesRadius();
            printCircles();
        }
    }

});

canvas.addEventListener('mousedown', function (event) {
    mouseIsDown = true;
    isClickOnCenter = isClickInsidePoint(new Point(event.offsetX, event.offsetY), centers);
    onClickBorderPoint = isClickInsidePoint(new Point(event.offsetX, event.offsetY), borderPoints);

    coordinateDifferences = isClickOnCenter !== null
        ? getCoordinateDifferences(centers[isClickOnCenter], borderPoints[isClickOnCenter])
        : [];

    mouseDownInterval = setInterval(function () {
        if (mouseIsDown && (isClickOnCenter != null || onClickBorderPoint !== null)) {
            printCircles();
        }

    }, 200);
});

canvas.addEventListener('mousemove', function (event) {
    x = event.pageX;
    y = event.pageY;

    if (mouseIsDown) {
        if (isClickOnCenter !== null) {
            centers[isClickOnCenter] = new Point(x, y)
            showIntersectionCoordinate();
            resetBorderPoint(isClickOnCenter);
            setCirclesRadius();
        }
        else if (onClickBorderPoint !== null) {
            borderPoints[onClickBorderPoint] = new Point(x, y);
            showIntersectionCoordinate();
            setCirclesRadius();
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        printCircles();
    }
})

canvas.addEventListener('mouseup', function () {
    mouseIsDown = false;

    clearInterval(mouseDownInterval);
});

function printCircles() {
    for (let index = 0; index < centers.length; index++) {
        ctx.beginPath();
        ctx.arc(centers[index].x, centers[index].y, radius[index], 0, 2 * Math.PI);
        ctx.fillStyle = colors[index];
        ctx.fill();

        printPoint(borderPoints[index])
        printPoint(centers[index])
    }
}

function printPoint(point) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
}

function getDistanceBetweenPoints(firstPoint, secondPoint) {
    return Math.round(Math.sqrt(Math.pow(secondPoint.x - firstPoint.x, 2) + Math.pow(secondPoint.y - firstPoint.y, 2)));
}

function setCirclesRadius() {
    radius = [];

    for (let i = 0; i < borderPoints.length; i++) {
        radius.push(getDistanceBetweenPoints(centers[i], borderPoints[i]));
    }
}

function reset() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    centers = [];
    radius = [];
    borderPoints = [];
}

function findCircleIntersection() {
    const distance = getDistanceBetweenPoints(centers[0], centers[1]);

    if (distance > radius[0] + radius[1]) {
        return null;
    }

    if (distance < radius[0] - radius[1]) {
        return null;
    }

    const a = (radius[0] ** 2 - radius[1] ** 2 + distance ** 2) / (2 * distance);
    const h = Math.sqrt(radius[0] ** 2 - a ** 2);
    const x2 = centers[0].x + a * (centers[1].x - centers[0].x) / distance;
    const y2 = centers[0].y + a * (centers[1].y - centers[0].y) / distance;

    const intersect1 = new Point(
        x2 + h * (centers[1].y - centers[0].y) / distance,
        y2 - h * (centers[1].x - centers[0].x) / distance)

    const intersect2 = new Point(
        x2 - h * (centers[1].y - centers[0].y) / distance,
        y2 + h * (centers[1].x - centers[0].x) / distance)

    return [intersect1, intersect2];
}

function isClickInsidePoint(Point, points) {
    for (let index = 0; index < points.length; index++) {
        const distance = getDistanceBetweenPoints(Point, points[index]);

        if (distance <= 5) {
            return index;
        }
    }

    return null;
}

function getCoordinateDifferences(point1, point2) {
    const xDifference = point1.x - point2.x;
    const yDifference = point1.y - point2.y;

    return [xDifference, yDifference];
}

function resetBorderPoint(index) {
    let newX = centers[index].x - coordinateDifferences[0];
    let newY = centers[index].y - coordinateDifferences[1];

    borderPoints[index] = new Point(newX, newY);
}

function revert() {
    centers.reverse();
    radius.reverse();
    borderPoints.reverse();
    colors.reverse();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    printCircles();
}

function about() {
    infoBox.innerText = !!infoBox.innerText === false
        ? infoText
        : infoBox.innerText;

    infoBox.style.display = infoBox.style.display === "block"
        ? "none"
        : "block";

    infoButton.innerText = infoBox.style.display === "block"
        ? "Hide About Section"
        : "About";
}

function showIntersectionCoordinate(){
    intersection =  findCircleIntersection();

    if (intersection) {
        intersectionBox.innerText = "The intersection point is (" + Math.round(intersection[0].x) + ", " + Math.round(intersection[0].y) + ")";
        intersectionBox.style.display = "block";
    }
    else{
        intersectionBox.style.display = "none";
    }
}