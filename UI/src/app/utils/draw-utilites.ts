import { IRow } from '@models/row';

function middleHeightOfLine(line: any) {
  const {middleY} = line.attributes;

  return middleY.nodeValue;
}

function areaOffset(source, target) {
  const offset = (Math.max(source, target) - Math.min(source, target)) / 2;
  return source > target ? -offset : offset;
}

function getSVGPoint(row: IRow, canvas: any) {
  if (!(row.htmlElement && row.htmlElement.id)) {
    return;
  }

  const clientRect = row.htmlElement.getBoundingClientRect();
  const { height, width } = clientRect;

  if (height === 0 || width === 0) {
    return;
  }

  let x: number;
  switch (row.area) {
    case 'source': {
      x = clientRect.right;
      break;
    }
    case 'target': {
      x = clientRect.left;
      break;
    }
    default: {
      return null;
    }
  }

  const y = clientRect.bottom - height / 2;
  const pt = canvas.createSVGPoint();
  pt.x = x;
  pt.y = y;

  return pt.matrixTransform(canvas.getScreenCTM().inverse());
}

export {
  middleHeightOfLine,
  areaOffset,
  getSVGPoint
};
