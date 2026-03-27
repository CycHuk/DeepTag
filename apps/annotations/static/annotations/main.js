// Global state
let selectedTool;
let labels;

function init() {
    // Tool
    selectedTool = document.querySelector('input[name="tool"]:checked').value;

    // Labels
    labels = JSON.parse(document.getElementById('labels-data').textContent);
    const selectedLabel = document.querySelector('input[name="label"]:checked').value;

    function getLabel(id) {
        return labels.find(label => label.id === id);
    }

    // Konva
    Konva.dragButtons = [2];
    const container = document.getElementById('container');

    const stage = new Konva.Stage({
        container: 'container',
        width: container.offsetWidth,
        height: container.offsetHeight,
        draggable: true
    });

    stage.on('contextmenu', (e) => e.evt.preventDefault());

    // Resize
    new ResizeObserver(entries => {
        for (let entry of entries) {
            stage.width(entry.contentRect.width);
            stage.height(entry.contentRect.height);
        }
    }).observe(container);

    // Zoom
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

        stage.position({
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale
        });

        stage.batchDraw();
    });

    // Layers
    const imageLayer = new Konva.Layer();
    const annotationLayer = new Konva.Layer();
    const transformerLayer = new Konva.Layer();

    stage.add(imageLayer);
    stage.add(annotationLayer);
    stage.add(transformerLayer);

    // Transformer
    const transformer = new Konva.Transformer({
        rotateEnabled: false,
        enabledAnchors: [
            'top-left', 'top-center', 'top-right',
            'middle-left', 'middle-right',
            'bottom-left', 'bottom-center', 'bottom-right'
        ],
    });

    transformerLayer.add(transformer);

    let activeRect = null;

    // IMAGE
    const imageObj = new Image();
    imageObj.src = document.getElementById('image').src;

    let konvaImage;

    // Data
    const annotationData = JSON.parse(document.getElementById('formset-data').textContent);

    // Utils
    function hexToRgba(hex, alpha = 0.25) {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function createAnnotationRect(bbox, label) {
        const [x1, y1, x2, y2] = bbox.split(' ').map(Number);

        const rect = new Konva.Rect({
            x: konvaImage.x() + x1 * konvaImage.width(),
            y: konvaImage.y() + y1 * konvaImage.height(),
            width: (x2 - x1) * konvaImage.width(),
            height: (y2 - y1) * konvaImage.height(),
            fill: hexToRgba(label.color),
            stroke: label.color,
            strokeWidth: 2,
            draggable: false
        });

        // Двойной клик только в edit
        rect.on('dblclick dbltap', () => {
            if (selectedTool !== 'edit') return;

            rect.moveToBottom();
            annotationLayer.batchDraw();

            if (activeRect === rect) {
                transformer.nodes([]);
                rect.draggable(false);
                activeRect = null;
                transformerLayer.draw();
                annotationEdit.classList.add('hidden');
            }
        });

        // События трансформации
        rect.on('transformend', () => {
            if (selectedTool === 'edit') {
                rect.width(rect.width() * rect.scaleX());
                rect.height(rect.height() * rect.scaleY());
                rect.scaleX(1);
                rect.scaleY(1);

                const bbox = getRectBBox(rect);
                applyBBoxToRect(rect, bbox)
                const annItem = annotationData.find(item => item._rect === rect);
                if (annItem) annItem.bbox = bbox;

                annotationLayer.draw();
            }
        });

        rect.on('dragend', (e) => {
            if (selectedTool === 'edit' && e.evt.button === 2) {
                const bbox = getRectBBox(rect);

                applyBBoxToRect(rect, bbox);

                const annItem = annotationData.find(item => item._rect === rect);
                if (annItem) annItem.bbox = bbox;

                annotationLayer.draw();
            }
        });

        return rect;
    }

    function applyBBoxToRect(rect, bbox) {
        // bbox — строка вида "x1 y1 x2 y2"
        const [x1, y1, x2, y2] = bbox.split(' ').map(Number);

        // Преобразуем в абсолютные координаты относительно изображения
        const absX = konvaImage.x() + x1 * konvaImage.width();
        const absY = konvaImage.y() + y1 * konvaImage.height();
        const absWidth = (x2 - x1) * konvaImage.width();
        const absHeight = (y2 - y1) * konvaImage.height();

        // Применяем к прямоугольнику
        rect.position({ x: absX, y: absY });
        rect.size({ width: absWidth, height: absHeight });
        rect.scaleX(1);
        rect.scaleY(1);

        annotationLayer.draw();
    }

    function getRectBBox(rect) {
        const x1 = rect.x();
        const y1 = rect.y();
        const x2 = x1 + rect.width();
        const y2 = y1 + rect.height();

        const nx1 = Math.max(0, Math.min(1, (x1 - konvaImage.x()) / konvaImage.width()));
        const ny1 = Math.max(0, Math.min(1, (y1 - konvaImage.y()) / konvaImage.height()));
        const nx2 = Math.max(0, Math.min(1, (x2 - konvaImage.x()) / konvaImage.width()));
        const ny2 = Math.max(0, Math.min(1, (y2 - konvaImage.y()) / konvaImage.height()));

        return [nx1, ny1, nx2, ny2].map(v => Math.round(v * 100) / 100).join(' ');
    }

    function drawAnnotations(data) {
        data.forEach(item => {
            if (item.DELETE) return;

            const rect = createAnnotationRect(item.bbox, getLabel(item.label));
            annotationLayer.add(rect);
            item._rect = rect;
        });

        annotationLayer.draw();
    }

    const annotationEdit = document.getElementById('annotation_edit');
    const editLabelSelect = document.getElementById('edit-label');
    const deleteRectBtn = document.getElementById('delete-rect');

    labels.forEach(label => {
        const option = document.createElement('option');
        option.value = label.id;
        option.textContent = label.name;
        editLabelSelect.appendChild(option);
    });

    annotationLayer.on('click tap', (e) => {
        if (selectedTool !== 'edit') return;
        if (!(e.target instanceof Konva.Rect)) return;

        if (activeRect) activeRect.draggable(false);

        activeRect = e.target;
        activeRect.draggable(true);

        transformer.nodes([activeRect]);
        transformerLayer.draw();

        annotationEdit.classList.remove('hidden');

        const annItem = annotationData.find(item => item._rect === activeRect);
        if (annItem) editLabelSelect.value = annItem.label;
    });

    stage.on('click tap', (e) => {
        if (selectedTool !== 'edit') return;

        if (!(e.target instanceof Konva.Rect)) {
            transformer.nodes([]);
            if (activeRect) activeRect.draggable(false);
            activeRect = null;
            transformerLayer.draw();
            annotationEdit.classList.add('hidden');
        }
    });

    editLabelSelect.addEventListener('change', () => {
        if (!activeRect) return;
        const newLabelId = editLabelSelect.value;
        const label = getLabel(newLabelId);

        activeRect.fill(hexToRgba(label.color));
        activeRect.stroke(label.color);
        annotationLayer.draw();

        const annItem = annotationData.find(item => item._rect === activeRect);
        if (annItem) annItem.label = newLabelId;
    });

    deleteRectBtn.addEventListener('click', () => {
        if (!activeRect) return;
        const annItem = annotationData.find(item => item._rect === activeRect);
        if (annItem) annItem.DELETE = true;

        activeRect.visible(false);
        transformer.nodes([]);
        activeRect = null;
        annotationEdit.classList.add('hidden');
        annotationLayer.draw();
    });

    // Drawing helpers
    function normalizeCoordinate(v) {
        return Math.round(Math.max(0, Math.min(1, v)) * 100) / 100;
    }

    function getPointerRelativeToStage() {
        const p = stage.getPointerPosition();
        const s = stage.scaleX();
        return {
            x: (p.x - stage.x()) / s,
            y: (p.y - stage.y()) / s
        };
    }

    // Drawing
    let isDrawing = false;
    let newRect = null;
    let startX, startY;

    stage.on('mousedown', (e) => {
        if (selectedTool !== 'create' || e.evt.button !== 0) return;

        isDrawing = true;

        const pos = getPointerRelativeToStage();
        startX = pos.x;
        startY = pos.y;

        const label = getLabel(selectedLabel);

        newRect = new Konva.Rect({
            x: startX,
            y: startY,
            width: 0,
            height: 0,
            stroke: label.color,
            dash: [4,2]
        });

        annotationLayer.add(newRect);
    });

    stage.on('mousemove', () => {
        if (!isDrawing || !newRect) return;

        const pos = getPointerRelativeToStage();

        newRect.width(pos.x - startX);
        newRect.height(pos.y - startY);

        annotationLayer.batchDraw();
    });

    stage.on('mouseup', () => {
        if (!isDrawing) return;

        isDrawing = false;

        const bbox = [
            normalizeCoordinate((newRect.x() - konvaImage.x()) / konvaImage.width()),
            normalizeCoordinate((newRect.y() - konvaImage.y()) / konvaImage.height()),
            normalizeCoordinate((newRect.x() + newRect.width() - konvaImage.x()) / konvaImage.width()),
            normalizeCoordinate((newRect.y() + newRect.height() - konvaImage.y()) / konvaImage.height())
        ].join(' ');

        const label = getLabel(selectedLabel);
        const rect = createAnnotationRect(bbox, label);

        annotationLayer.add(rect);
        newRect.destroy();

        annotationData.push({
            label: label.id,
            bbox,
            DELETE: false,
            _rect: rect
        });

        newRect = null;
        annotationLayer.draw();
    });

    document.body.addEventListener('htmx:configRequest', function(evt) {
        evt.detail.parameters['annotations-TOTAL_FORMS'] = annotationData.length;
        evt.detail.parameters['annotations-INITIAL_FORMS'] = annotationData.filter(a => a.id !== undefined).length;
        evt.detail.parameters['image_id'] = document.getElementById('image_id').value;

        annotationData.forEach((item, index) => {
            if (item.id !== undefined) {
                evt.detail.parameters[`annotations-${index}-id`] = item.id;
            }
            evt.detail.parameters[`annotations-${index}-label`] = item.label;
            evt.detail.parameters[`annotations-${index}-bbox`] = item.bbox;
            evt.detail.parameters[`annotations-${index}-DELETE`] = item.DELETE ? 'on' : '';
        });
    });

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

        drawAnnotations(annotationData);
    };
}

document.addEventListener('change', (e) => {
    if (e.target.name === 'tool') {
        selectedTool = e.target.value;

        // Reset edit state when switching tools
        if (selectedTool !== 'edit') {
            const transformer = Konva.stages[0] && Konva.stages[0].findOne('Transformer');
            const annotationEdit = document.getElementById('annotation_edit');
            if (transformer) transformer.nodes([]);
            annotationEdit.classList.add('hidden');
        }
    }

    if (e.target.name === 'label') {
    }
});

init();

function initHintsToggle() {
    const toggle = document.getElementById('toggle-hints');
    const hintsBlock = document.getElementById('hints_block');

    if (!toggle || !hintsBlock) return;

    const hintsVisible = localStorage.getItem('hintsVisible');

    if (hintsVisible !== null) {
        if (hintsVisible === 'true') {
            hintsBlock.classList.remove('hidden');
            toggle.checked = true;
        } else {
            hintsBlock.classList.add('hidden');
            toggle.checked = false;
        }
    } else {
        const isHidden = hintsBlock.classList.contains('hidden');
        toggle.checked = !isHidden;
    }

    toggle.addEventListener('change', () => {
        const show = toggle.checked;
        if (show) {
            hintsBlock.classList.remove('hidden');
        } else {
            hintsBlock.classList.add('hidden');
        }
        localStorage.setItem('hintsVisible', show);
    });
}

document.body.addEventListener('htmx:afterRequest', function(evt) {
    init();
    initHintsToggle();

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        const selectedRadio = document.querySelector(`.theme-controller[value="${savedTheme}"]`);
        if (selectedRadio) selectedRadio.checked = true;
    }

    if (window.HSDropdown) {
        setTimeout(() => {
            // Close any open dropdowns to reset state
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                const toggle = dropdown.querySelector('.dropdown-toggle');
                if (toggle) {
                    // Remove open classes to close dropdowns
                    dropdown.classList.remove('open');
                    if (toggle.classList.contains('dropdown-open')) {
                        toggle.classList.remove('dropdown-open');
                    }
                }
            });
            
            // Reinitialize dropdowns
            HSDropdown.autoInit();
        }, 100);
    }
});

document.addEventListener('DOMContentLoaded', initHintsToggle);