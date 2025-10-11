import React, { useEffect, useRef, useState } from 'react';
import { Canvas, PencilBrush, FabricImage } from 'fabric';
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

const MagicPencil = ({ videoElement, isVisible, onClose }) => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const [currentTool, setCurrentTool] = useState('pencil');
  const [brushColor, setBrushColor] = useState('#FF0000');
  const [brushSize, setBrushSize] = useState(3);
  const [eraserSize, setEraserSize] = useState('medium');
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const colorPresets = ['#FF0000', '#0066FF', '#FFD700', '#00FF00', '#FF8C00', '#9400D3', '#000000', '#FFFFFF'];
  const eraserSizes = { small: 10, medium: 20, large: 40 };

  const saveToHistory = (canvas) => {
    const currentState = JSON.stringify(canvas.toJSON());
    setHistory((prev) => [...prev.slice(0, historyStep + 1), currentState]);
    setHistoryStep((prev) => prev + 1);
  };

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: videoElement?.offsetWidth || 800,
      height: videoElement?.offsetHeight || 450,
      backgroundColor: 'transparent',
    });
    fabricRef.current = canvas;

    if (videoElement) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = videoElement.videoWidth;
      tempCanvas.height = videoElement.videoHeight;
      const ctx = tempCanvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0);
      const dataURL = tempCanvas.toDataURL();

      FabricImage.fromURL(dataURL).then((img) => {
        img.scaleToWidth(canvas.width);
        img.scaleToHeight(canvas.height);
        canvas.backgroundImage = img;
        canvas.renderAll();
        saveToHistory(canvas);
      });
    }

    const handleAction = () => saveToHistory(canvas);
    canvas.on('path:created', handleAction);
    canvas.on('object:modified', handleAction);

    return () => {
      canvas.off('path:created', handleAction);
      canvas.off('object:modified', handleAction);
      canvas.dispose();
    };
  }, [isVisible, videoElement]);

  // ▼▼▼ 신규 추가: ESC 키로 닫기 기능 ▼▼▼
  useEffect(() => {
    // 키보드 이벤트 핸들러 함수
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose(); // Escape 키가 눌리면 onClose 함수 호출
      }
    };

    // 컴포넌트가 보일 때만 이벤트 리스너 추가
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // 클린업 함수: 컴포넌트가 사라지면 이벤트 리스너 제거
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onClose]); // isVisible 또는 onClose 함수가 변경될 때마다 effect 재실행
  // ▲▲▲ END OF NEW CODE ▲▲▲

  const selectTool = (tool) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    setCurrentTool(tool);
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.forEachObject((obj) => { obj.selectable = false; obj.evented = false; });
    switch (tool) {
      case 'pencil':
        canvas.isDrawingMode = true;
        const pencilBrush = new PencilBrush(canvas);
        pencilBrush.width = brushSize; pencilBrush.color = brushColor;
        canvas.freeDrawingBrush = pencilBrush; break;
      case 'highlighter':
        canvas.isDrawingMode = true;
        const highlighter = new PencilBrush(canvas);
        highlighter.width = brushSize * 4; highlighter.color = brushColor + '60';
        canvas.freeDrawingBrush = highlighter; break;
      case 'eraser':
        canvas.isDrawingMode = true;
        const eraser = new PencilBrush(canvas);
        eraser.width = eraserSizes[eraserSize]; eraser.color = 'rgba(0,0,0,1)';
        canvas.freeDrawingBrush = eraser;
        canvas.freeDrawingBrush.globalCompositeOperation = 'destination-out'; break;
      case 'select':
        canvas.selection = true;
        canvas.forEachObject((obj) => { obj.selectable = true; obj.evented = true; }); break;
      default: break;
    }
  };

  const changeColor = (color) => {
    setBrushColor(color);
    const canvas = fabricRef.current;
    if (canvas?.freeDrawingBrush && currentTool !== 'eraser') {
      canvas.freeDrawingBrush.color = currentTool === 'highlighter' ? color + '60' : color;
    }
  };

  const changeBrushSize = (size) => {
    setBrushSize(size);
    const canvas = fabricRef.current;
    if (canvas?.freeDrawingBrush && currentTool !== 'eraser') {
      canvas.freeDrawingBrush.width = currentTool === 'highlighter' ? size * 4 : size;
    }
  };

  const changeEraserSize = (size) => {
    setEraserSize(size);
    const canvas = fabricRef.current;
    if (canvas?.freeDrawingBrush && currentTool === 'eraser') {
      canvas.freeDrawingBrush.width = eraserSizes[size];
    }
  };

  const undo = () => {
    const canvas = fabricRef.current;
    if (!canvas || historyStep <= 0) return;
    const newStep = historyStep - 1;
    const state = JSON.parse(history[newStep]);
    canvas.loadFromJSON(state, () => {
      canvas.renderAll();
      setHistoryStep(newStep);
    });
  };

  const redo = () => {
    const canvas = fabricRef.current;
    if (!canvas || historyStep >= history.length - 1) return;
    const newStep = historyStep + 1;
    const state = JSON.parse(history[newStep]);
    canvas.loadFromJSON(state, () => {
      canvas.renderAll();
      setHistoryStep(newStep);
    });
  };

  const clearCanvas = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const objects = canvas.getObjects();
    objects.forEach((obj) => canvas.remove(obj));
    canvas.renderAll();
    saveToHistory(canvas);
  };

  const saveAsPNG = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `video-analysis-${timestamp}.png`;
    link.href = dataURL;
    link.click();
  };

  useEffect(() => {
    if (fabricRef.current && isVisible) selectTool('pencil');
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="magicPencilOverlay">
      <button className="mpCloseBtn" onClick={onClose}>✕</button>
      <div className="magicPencilContainer">
        <div className="magicPencilTools">
          
          <div className="mpToolGroup">
            <button className={`mpTool ${currentTool === 'select' ? 'active' : ''}`} onClick={() => selectTool('select')} title="선택/이동"><FaHandPaper /></button>
            <button className={`mpTool ${currentTool === 'pencil' ? 'active' : ''}`} onClick={() => selectTool('pencil')} title="펜"><FaPencilAlt /></button>
            <button className={`mpTool ${currentTool === 'highlighter' ? 'active' : ''}`} onClick={() => selectTool('highlighter')} title="형광펜"><FaHighlighter /></button>
            <button className={`mpTool ${currentTool === 'eraser' ? 'active' : ''}`} onClick={() => selectTool('eraser')} title="지우개"><FaEraser /></button>
          </div>

          <div className="mpColorGroup">
            {colorPresets.map((color) => <button key={color} className={`mpColor ${brushColor === color ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => changeColor(color)} />)}
          </div>

          {currentTool !== 'select' && currentTool !== 'eraser' && (
            <div className="mpSizeGroup">
              <label>굵기: {brushSize}px</label>
              <input type="range" min="1" max="20" value={brushSize} onChange={(e) => changeBrushSize(Number(e.target.value))} />
            </div>
          )}

          {currentTool === 'eraser' && (
            <div className="mpEraserSize">
              <label>지우개 크기</label>
              <div className="mpEraserSize-buttons">
                <button className={eraserSize === 'small' ? 'active' : ''} onClick={() => changeEraserSize('small')}>소</button>
                <button className={eraserSize === 'medium' ? 'active' : ''} onClick={() => changeEraserSize('medium')}>중</button>
                <button className={eraserSize === 'large' ? 'active' : ''} onClick={() => changeEraserSize('large')}>대</button>
              </div>
            </div>
          )}

          <div className="mpActionGroup">
            <button onClick={undo} title="실행 취소" disabled={historyStep <= 0}><FaUndo /></button>
            <button onClick={redo} title="다시 실행" disabled={historyStep >= history.length - 1}><FaRedo /></button>
            <button onClick={clearCanvas} title="전체 지우기"><FaTrash /></button>
            <button onClick={saveAsPNG} className="mpSaveBtn" title="PNG로 저장"><FaDownload /></button>
          </div>

        </div>
        <canvas ref={canvasRef} className="magicPencilCanvas" />
      </div>
    </div>
  );
};

export default MagicPencil;