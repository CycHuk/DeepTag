// Tool
let selectedTool = document.querySelector('input[name="tool"]:checked').value;
console.log('Выбранный инструмент:', selectedTool);

document.addEventListener('change', (e) => {
    if (e.target.name === 'tool') {
        selectedTool = e.target.value
        console.log('Выбран новый инструмент:', selectedTool);
    }
});

// Labels
const labels = JSON.parse(document.getElementById('labels-data').textContent);
console.log('Список классов:', labels);
let selectedLabel = document.querySelector('input[name="label"]:checked').value;

console.log('ID:', selectedLabel);

function getLabel(id) {
    return labels.find(label => label.id === id);
}

document.addEventListener('change', (e) => {
    if (e.target.name === 'label') {
        selectedLabel = e.target.value
        console.log('Выбран класс:', selectedLabel, getLabel(selectedLabel));
    }
});

// Konva
Konva.dragButtons = [2];
const container = document.getElementById('container')

const stage = new Konva.Stage({
    container: 'container',
    width: container.offsetWidth,
    height: container.offsetHeight,
    draggable: true
});

stage.on('contextmenu', (e) => {
  e.evt.preventDefault();
});

// Resize
const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        const {width, height} = entry.contentRect;

        stage.width(width);
        stage.height(height);
    }
});

resizeObserver.observe(container);

// Scale
const scaleBy = 1.05;

stage.on('wheel', (e) => {
  e.evt.preventDefault();

  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition();

  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale
  };

  const direction = e.evt.deltaY > 0 ? -1 : 1;
  const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

  stage.scale({ x: newScale, y: newScale });

  const newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale
  };
  stage.position(newPos);
  stage.batchDraw();
});

// Image Layer
const imageLayer = new Konva.Layer();
stage.add(imageLayer)

const imageObj = new Image();
imageObj.src = document.getElementById('image').src;

let konvaImage;
imageObj.onload = () => {
    konvaImage = new Konva.Image({
        x: (stage.width() - imageObj.width) / 2,
        y: (stage.height() - imageObj.height) / 2,
        image: imageObj,
        width: imageObj.width,
        height: imageObj.height
    });

    imageLayer.add(konvaImage);
    imageLayer.draw();

    drawAnnotations(annotationData, annotationLayer);

};

// Annotation Data
const annotationData = JSON.parse(document.getElementById('formset-data').textContent);
const annotationsTotalForms = document.getElementById('id_annotations-TOTAL_FORMS');
console.log(annotationsTotalForms.value);

const formsetAnnotationsList = document.getElementById('formset-annotations-list');

// Annotation Layer
const annotationLayer = new Konva.Layer();
stage.add(annotationLayer);

const transformer = new Konva.Transformer({
  rotateEnabled: false,
  keepRatio: false,
  enabledAnchors: ['top-left','top-right','bottom-left','bottom-right'],
  anchorStroke: 'black',
  anchorFill: 'white',
  anchorSize: 8
});

annotationLayer.add(transformer);

function hexToRgba(hex, alpha = 0.25) {
  hex = hex.replace('#', '');

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createAnnotationRect(bbox, label) {
  const [x1, y1, x2, y2] = bbox.split(' ').map(Number);

  const absX1 = konvaImage.x() + x1 * konvaImage.width();
  const absY1 = konvaImage.y() + y1 * konvaImage.height();
  const absX2 = konvaImage.x() + x2 * konvaImage.width();
  const absY2 = konvaImage.y() + y2 * konvaImage.height();

  const rect = new Konva.Rect({
    x: absX1,
    y: absY1,
    width: absX2 - absX1,
    height: absY2 - absY1,
    fill: hexToRgba(label.color, 0.25),
    stroke: label.color,
    strokeWidth: 2,
    strokeScaleEnabled: true
  });

  transformer.nodes([rect]);
  annotationLayer.draw();

  return rect
}

function drawAnnotations(annotationData, annotationLayer) {
  for (const item of annotationData) {
    if (item.DELETE) continue;

    const label = getLabel(item.label);

    const rect = createAnnotationRect(item.bbox, label);
    annotationLayer.add(rect);

    item._rect = rect;
  }

  annotationLayer.draw();
}

function normalizeCoordinate(value) {
  let v = Math.max(0, Math.min(1, value));
  return Math.round(v * 100) / 100;
}

function getPointerRelativeToStage() {
  const pointer = stage.getPointerPosition();
  const scale = stage.scaleX();
  return {
    x: (pointer.x - stage.x()) / scale,
    y: (pointer.y - stage.y()) / scale
  };
}

let isDrawing = false;
let newRect = null;
let startX = 0;
let startY = 0;

stage.on('mousedown touchstart', (e) => {
  if (e.evt.button !== 0) return;
  if (selectedTool !== 'create') return;
  console.log('Начали рисовать по изображению!');

  isDrawing = true;
  const pos = getPointerRelativeToStage();
  startX = pos.x;
  startY = pos.y;

  const label = getLabel(selectedLabel)

  newRect = new Konva.Rect({
    x: startX,
    y: startY,
    width: 0,
    height: 0,
    stroke: label.color,
    strokeWidth: 2,
    dash: [4, 2],
    strokeScaleEnabled: true
  });

  annotationLayer.add(newRect);
});

stage.on('mousemove touchmove', (e) => {
  if (selectedTool !== 'create') return;
  if (e.evt.button !== 0) return;
  if (!isDrawing || !newRect) return;


  const pos = getPointerRelativeToStage();;
  newRect.width(pos.x - startX);
  newRect.height(pos.y - startY);

  annotationLayer.batchDraw();
});

stage.on('mouseup touchend', (e) => {
  if (selectedTool !== 'create') return;
  if (e.evt.button !== 0) return;
  if (!isDrawing) return;

  isDrawing = false;

  const relX1 = normalizeCoordinate((newRect.x() - konvaImage.x()) / konvaImage.width());
  const relY1 = normalizeCoordinate((newRect.y() - konvaImage.y()) / konvaImage.height());
  const relX2 = normalizeCoordinate((newRect.x() + newRect.width() - konvaImage.x()) / konvaImage.width());
  const relY2 = normalizeCoordinate((newRect.y() + newRect.height() - konvaImage.y()) / konvaImage.height());

  const bbox = `${relX1} ${relY1} ${relX2} ${relY2}`;
  const label = getLabel(selectedLabel)

  const rect = createAnnotationRect(bbox, label)

  annotationLayer.add(rect);
  newRect.destroy();
  annotationLayer.draw();

  annotationData.push({
    label: label.id,
    bbox: bbox,
    DELETE: false,
    _rect: rect
  });

  newRect = null;
  console.log(annotationData);
});

