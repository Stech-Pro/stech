// src/components/MagicPencil/MagicPencil.jsx

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, PencilBrush } from 'fabric';
import {
  FaPencilAlt,
  FaHighlighter,
  FaEraser,
  FaHandPaper,
  FaDownload,
  FaUndo,
  FaRedo,
  FaTrash,
} from 'react-icons/fa';
import './MagicPencil.css';

// Custom EraserBrush implementation
class EraserBrush {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = 10;
    this.color = 'rgba(0,0,0,1)';
    this._isErasing = false;
    this._eraserGroup = [];
  }

  onMouseDown(pointer) {
    this._isErasing = true;
    this._eraserGroup = [];
    this._prepareForErasing(pointer);
  }

  onMouseMove(pointer) {
    if (!this._isErasing) return;
    this._prepareForErasing(pointer);
  }

  onMouseUp() {
    this._isErasing = false;
    this._finalizeErasing();
  }

  _prepareForErasing(pointer) {
    const canvas = this.canvas;
    const objects = canvas.getObjects();
    const rect = {
      left: pointer.x - this.width / 2,
      top: pointer.y - this.width / 2,
      width: this.width,
      height: this.width
    };

    objects.forEach(obj => {
      if (this._isIntersecting(obj, rect)) {
        this._eraserGroup.push(obj);
      }
    });
  }

  _isIntersecting(obj, rect) {
    const objBounds = obj.getBoundingRect();
    return !(
      rect.left > objBounds.left + objBounds.width ||
      rect.left + rect.width < objBounds.left ||
      rect.top > objBounds.top + objBounds.height ||
      rect.top + rect.height < objBounds.top
    );
  }

  _finalizeErasing() {
    const canvas = this.canvas;
    this._eraserGroup.forEach(obj => {
      canvas.remove(obj);
    });
    canvas.renderAll();
    this._eraserGroup = [];
  }
}

const MagicPencil = ({ videoElement, isVisible, onClose }) => {
  const canvasContainerRef = useRef(null);
  const fabricRef = useRef(null);
  const [currentTool, setCurrentTool] = useState('pencil');
  const [brushColor, setBrushColor] = useState('#FF0000');
  const [brushSize, setBrushSize] = useState(3);
  const [eraserSize, setEraserSize] = useState('medium');
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const eraserBrushRef = useRef(null);

  const colorPresets = ['#FF0000', '#0066FF', '#FFD700', '#00FF00', '#FF8C00', '#9400D3', '#000000', '#FFFFFF'];
  const eraserSizes = { small: 10, medium: 20, large: 40 };

  const saveToHistory = (canvas) => {
    const currentState = JSON.stringify(canvas.toJSON());
    if (history[historyStep] === currentState) return;
    setHistory((prev) => [...prev.slice(0, historyStep + 1), currentState]);
    setHistoryStep((prev) => prev + 1);
  };

  useEffect(() => {
    if (!isVisible || !canvasContainerRef.current || !videoElement) return;
    
    const container = canvasContainerRef.current;
    
    // Manually create the canvas element for Fabric.js to manage
    const canvasEl = document.createElement('canvas');
    container.appendChild(canvasEl);

    const canvas = new Canvas(canvasEl, {
      backgroundColor: 'transparent',
      isDrawingMode: true,
    });
    fabricRef.current = canvas;

    const resizeCanvas = () => {
      if (videoElement && canvas) {
        canvas.setWidth(videoElement.offsetWidth);
        canvas.setHeight(videoElement.offsetHeight);
        canvas.renderAll();
      }
    };

    resizeCanvas();
    selectTool(currentTool);
    saveToHistory(canvas);

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(videoElement);
    
    const handleAction = () => saveToHistory(canvas);
    canvas.on('mouse:up', handleAction);

    return () => {
      resizeObserver.disconnect();
      canvas.off('mouse:up', handleAction);
      canvas.dispose();
      // Clean up the container manually
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
      fabricRef.current = null;
    };
  }, [isVisible, videoElement]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Escape 키만 처리하고 나머지는 통과시킴
      if (event.key === 'Escape') {
        onClose();
        event.stopPropagation(); // Escape만 전파 중단
      }
      // 다른 키들은 부모 컴포넌트로 전달되도록 함
    };
    if (isVisible) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onClose]);

  const selectTool = (tool) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    setCurrentTool(tool);
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.forEachObject((obj) => { 
      obj.selectable = false; 
      obj.evented = false; 
    });

    // Clean up eraser brush event handlers if switching from eraser
    if (eraserBrushRef.current && tool !== 'eraser') {
      canvas.off('mouse:down');
      canvas.off('mouse:move');
      canvas.off('mouse:up');
      eraserBrushRef.current = null;
    }

    switch (tool) {
      case 'pencil':
        canvas.isDrawingMode = true;
        const pencilBrush = new PencilBrush(canvas);
        pencilBrush.width = brushSize;
        pencilBrush.color = brushColor;
        canvas.freeDrawingBrush = pencilBrush;
        break;
        
      case 'highlighter':
        canvas.isDrawingMode = true;
        const highlighter = new PencilBrush(canvas);
        highlighter.width = brushSize * 4;
        highlighter.color = brushColor + '80'; // Add transparency
        canvas.freeDrawingBrush = highlighter;
        break;
        
      case 'eraser':
        // Option 1: Simple eraser using white color
        // (Works best on non-transparent backgrounds)
        /*
        canvas.isDrawingMode = true;
        const whiteEraser = new PencilBrush(canvas);
        whiteEraser.width = eraserSizes[eraserSize];
        whiteEraser.color = '#FFFFFF';
        canvas.freeDrawingBrush = whiteEraser;
        */
        
        // Option 2: Custom eraser that removes objects on click
        canvas.isDrawingMode = false;
        eraserBrushRef.current = new EraserBrush(canvas);
        eraserBrushRef.current.width = eraserSizes[eraserSize];
        
        canvas.on('mouse:down', (e) => {
          if (eraserBrushRef.current) {
            eraserBrushRef.current.onMouseDown(canvas.getPointer(e.e));
          }
        });
        
        canvas.on('mouse:move', (e) => {
          if (eraserBrushRef.current) {
            eraserBrushRef.current.onMouseMove(canvas.getPointer(e.e));
          }
        });
        
        canvas.on('mouse:up', () => {
          if (eraserBrushRef.current) {
            eraserBrushRef.current.onMouseUp();
            saveToHistory(canvas);
          }
        });
        break;
        
      case 'select':
        canvas.selection = true;
        canvas.forEachObject((obj) => { 
          obj.selectable = true; 
          obj.evented = true; 
        });
        break;
        
      default: 
        break;
    }
  };

  const changeColor = (color) => {
    setBrushColor(color);
  };
  
  const changeBrushSize = (size) => {
    setBrushSize(size);
  };
  
  const changeEraserSize = (size) => {
    setEraserSize(size);
  };

  // Update brush settings when state changes
  useEffect(() => {
    selectTool(currentTool);
  }, [brushColor, brushSize, eraserSize]);

  const undo = () => {
    const canvas = fabricRef.current;
    if (!canvas || historyStep <= 0) return;
    const newStep = historyStep - 1;
    canvas.loadFromJSON(history[newStep], () => {
      canvas.renderAll();
      setHistoryStep(newStep);
    });
  };

  const redo = () => {
    const canvas = fabricRef.current;
    if (!canvas || historyStep >= history.length - 1) return;
    const newStep = historyStep + 1;
    canvas.loadFromJSON(history[newStep], () => {
      canvas.renderAll();
      setHistoryStep(newStep);
    });
  };

  const clearCanvas = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = 'transparent';
    saveToHistory(canvas);
  };

  const saveAsPNG = () => {
    const canvas = fabricRef.current;
    if (!canvas || !videoElement) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = videoElement.videoWidth;
    tempCanvas.height = videoElement.videoHeight;
    const ctx = tempCanvas.getContext('2d');
    
    // Draw video frame
    ctx.drawImage(videoElement, 0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw fabric canvas content on top
    const fabricCanvasElement = canvas.getElement();
    ctx.drawImage(fabricCanvasElement, 0, 0, tempCanvas.width, tempCanvas.height);

    // Download as PNG
    const dataURL = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `video-analysis-${timestamp}.png`;
    link.href = dataURL;
    link.click();
  };

  if (!isVisible) return null;

  return (
    <>
      <div ref={canvasContainerRef} className="magicPencilCanvasContainer" />

      <div className="magicPencilToolsContainer">
        <div className="magicPencilTools">
          <button className="mpCloseBtn" onClick={onClose}>✕</button>
          
          <div className="mpToolGroup">
            <button 
              className={`mpTool ${currentTool === 'select' ? 'active' : ''}`} 
              onClick={() => selectTool('select')} 
              title="선택/이동"
            >
              <FaHandPaper />
            </button>
            <button 
              className={`mpTool ${currentTool === 'pencil' ? 'active' : ''}`} 
              onClick={() => selectTool('pencil')} 
              title="펜"
            >
              <FaPencilAlt />
            </button>
            <button 
              className={`mpTool ${currentTool === 'highlighter' ? 'active' : ''}`} 
              onClick={() => selectTool('highlighter')} 
              title="형광펜"
            >
              <FaHighlighter />
            </button>
            <button 
              className={`mpTool ${currentTool === 'eraser' ? 'active' : ''}`} 
              onClick={() => selectTool('eraser')} 
              title="지우개"
            >
              <FaEraser />
            </button>
          </div>

          <div className="mpColorGroup">
            {colorPresets.map((color) => (
              <button 
                key={color} 
                className={`mpColor ${brushColor === color ? 'active' : ''}`} 
                style={{ backgroundColor: color }} 
                onClick={() => changeColor(color)} 
              />
            ))}
          </div>

          {(currentTool === 'pencil' || currentTool === 'highlighter') && (
            <div className="mpSizeGroup">
              <label>굵기: {brushSize}px</label>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={brushSize} 
                onChange={(e) => changeBrushSize(Number(e.target.value))} 
              />
            </div>
          )}

          {currentTool === 'eraser' && (
            <div className="mpEraserSize">
              <label>지우개 크기</label>
              <div className="mpEraserSize-buttons">
                <button 
                  className={eraserSize === 'small' ? 'active' : ''} 
                  onClick={() => changeEraserSize('small')}
                >
                  소
                </button>
                <button 
                  className={eraserSize === 'medium' ? 'active' : ''} 
                  onClick={() => changeEraserSize('medium')}
                >
                  중
                </button>
                <button 
                  className={eraserSize === 'large' ? 'active' : ''} 
                  onClick={() => changeEraserSize('large')}
                >
                  대
                </button>
              </div>
            </div>
          )}

          <div className="mpActionGroup">
            <button 
              onClick={undo} 
              title="실행 취소" 
              disabled={historyStep <= 0}
            >
              <FaUndo />
            </button>
            <button 
              onClick={redo} 
              title="다시 실행" 
              disabled={historyStep >= history.length - 1}
            >
              <FaRedo />
            </button>
            <button 
              onClick={clearCanvas} 
              title="전체 지우기"
            >
              <FaTrash />
            </button>
            <button 
              onClick={saveAsPNG} 
              className="mpSaveBtn" 
              title="PNG로 저장"
            >
              <FaDownload />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MagicPencil;