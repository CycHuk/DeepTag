export function initKonva() {
  const container = document.getElementById('container');
  if (!container) return;

  if (window.stage) {window.stage.destroy()}

  const stage = new Konva.Stage({
    container: 'container',
    width: container.offsetWidth,
    height: container.offsetHeight,
  });
  window.stage = stage;

  createImageLayer(stage);

  window.addEventListener('resize', () => resizeStage(stage));
}

export function createImageLayer(stage) {
  const layer = new Konva.Layer();
  stage.add(layer);

  const imgEl = document.getElementById('image');
  if (!imgEl) return;

  const konvaImg = new Image();
  konvaImg.src = imgEl.src;

  konvaImg.onload = function () {
    drawCenteredImage(stage, layer, konvaImg);
  };
}

function drawCenteredImage(stage, layer, konvaImg) {
  layer.destroyChildren();
  const stageWidth = stage.width();
  const stageHeight = stage.height();

  const konvaImage = new Konva.Image({
    image: konvaImg,
    width: konvaImg.width ,
    height: konvaImg.height ,
    x: (stageWidth - konvaImg.width) / 2,
    y: (stageHeight - konvaImg.height) / 2,
  });

  layer.add(konvaImage);
  layer.draw();
}

export function resizeStage(stage) {
  const container = document.getElementById('container');
  if (!container || !stage) return;

  stage.width(container.offsetWidth);
  stage.height(container.offsetHeight);

  const layer = stage.getChildren()[0];
  if (!layer) return;

  const konvaImage = layer.getChildren()[0];
  if (konvaImage && konvaImage.image()) {
    const img = konvaImage.image();
    drawCenteredImage(stage, layer, img);
  }
}