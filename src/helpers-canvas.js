'use strict';

export function drawLine(ctx, start, end, {color = '#fff', dashed = [], lineWidth = 1}) {
  ctx.beginPath();
  ctx.setLineDash(dashed);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.lineCap = 'square';
  ctx.translate(0.5, 0.5);
  ctx.moveTo(...start);
  ctx.lineTo(...end);
  ctx.stroke();
  ctx.translate(-0.5, -0.5);
}

export function drawText(ctx, str, coordinates, {color = '#fff'}) {
  ctx.font = '24px Arial, Helvetica, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(str, ...coordinates);
}

export function drawTriangle(ctx, targetXY, width, height, {color = '#fff'}) {
  ctx.beginPath();
  ctx.moveTo(targetXY[0] - width, targetXY[1] - (height / 2));
  ctx.lineTo(targetXY[0], targetXY[1]);
  ctx.lineTo(targetXY[0] - width, targetXY[1] + (height / 2));
  ctx.lineCap = 'square';
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawShape(ctx, coordinates, {color = '#fff', fillOpacity = 'ff'}) {

  const path = new Path2D();
  path.moveTo(coordinates[0][0], coordinates[0][1]);
  for (const point of coordinates) {
    path.lineTo(point[0], point[1]);
  }
  path.closePath();

  ctx.fillStyle = `${color}${fillOpacity}`;
  ctx.lineCap = 'square';
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.translate(0.5, 0.5); // offsetting to deal with blurry odd stroke widths
  ctx.stroke(path);
  ctx.translate(-0.5, -0.5); // offset back
  ctx.fill(path);

}
