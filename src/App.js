import { useEffect, useState } from 'react';
import './style.css';
import sudokuGrid from './utils/sudokuSolver';
import '@fortawesome/fontawesome-free/css/all.min.css';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const createEmptyGrid = () => Array.from({ length: 9 }, () => Array(9).fill({ value: null, isEditable: true }));

function App() {
  const [boxes, setBoxes] = useState(createEmptyGrid());
  const [activeValue, setActiveValue] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [currentValue, setCurrentValue] = useState(0);
  const [isGameCompleted, setIsGameCompleted] = useState(false);
  const [highlighted, setHighlighted] = useState({ row: null, col: null, box: null, number: null });
  const [message, setMessage] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);

  const fillRandomValues = () => {
    const emptyBox = createEmptyGrid();
    let count = 0;
    while (count < 40) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (emptyBox[row][col].value === null) {
        emptyBox[row][col] = { value: sudokuGrid[row][col], isEditable: false };
        count++;
      }
    }
    setBoxes(emptyBox);
  };

  const handleInputValue = (value) => setActiveValue(activeValue === value ? 0 : value);

  const handleSquareChange = (rowIndex, colIndex, value) => {
    if (isGameCompleted) return;

    const newValue = parseInt(value) || null;

    if (newValue !== null && countOccurrences(newValue) >= 9) {
      setActiveValue(null)
      setMessage("You can't place the number more than 9 times. Choose a different number.");
      return;
    } else {
      setMessage('')
    }

    setBoxes((prevBoxes) => {
      const newBoxes = [...prevBoxes];
      newBoxes[rowIndex] = [...newBoxes[rowIndex]];
      newBoxes[rowIndex][colIndex] = { value: newValue, isEditable: prevBoxes[rowIndex][colIndex].isEditable };
      setCurrentValue(newValue !== null ? newValue : 0);

      if (isGridFilled(newBoxes)) {
        if (checkGridCompletion(newBoxes)) {
          setIsGameCompleted(true);
          setMessage("Congratulations, you've completed the Sudoku!");
        } else {
          setMessage("Grid complete, but incorrect. Keep trying!");
        }
      }
      return newBoxes;
    });
  };

  const handleClearValue = () => {
    if (selectedSquare) {
      const { rowIndex, colIndex } = selectedSquare;
      if (boxes[rowIndex][colIndex].isEditable) {
        handleSquareChange(rowIndex, colIndex, null);
      }
    }
  };

  const handleShowAnswer = () => setShowAnswer(!showAnswer);

  const handleSquareClick = (rowIndex, colIndex) => {
    const square = boxes[rowIndex][colIndex];
    setCurrentValue(square.value !== null ? square.value : 0);
    setSelectedSquare({ rowIndex, colIndex });
    setHighlighted({
      row: rowIndex,
      col: colIndex,
      box: getBoxIndex(rowIndex, colIndex),
    });

    if (square.isEditable && activeValue !== 0 && !isGameCompleted) {
      handleSquareChange(rowIndex, colIndex, activeValue);
    }
  };

  const handleGiveHint = () => {
    if (hintsRemaining > 0 && selectedSquare) {
      const { rowIndex, colIndex } = selectedSquare;
      if (boxes[rowIndex][colIndex].value === null) {
        setHintsRemaining(hintsRemaining - 1);
        handleSquareChange(rowIndex, colIndex, sudokuGrid[rowIndex][colIndex]);
      }
    }
  };

  const isGridFilled = (grid) => grid.every(row => row.every(cell => cell.value !== null));

  const checkGridCompletion = (grid) => grid.every((row, rowIndex) =>
    row.every((cell, colIndex) => cell.value === sudokuGrid[rowIndex][colIndex])
  );

  const countOccurrences = (value) => boxes.flat().filter((box) => box.value === value).length;

  const getBoxIndex = (row, col) => Math.floor(row / 3) * 3 + Math.floor(col / 3);

  useEffect(() => {
    fillRandomValues();
  }, []);

  return (
    <div className="container">
      <h1 className="text-center">Play Sudoku</h1>
      <div className="box-container">
        {boxes.map((row, rowIndex) => (
          <div className="board-row" key={rowIndex}>
            {row.map((cell, colIndex) => (
              <Square
                key={colIndex}
                value={showAnswer ? sudokuGrid[rowIndex][colIndex] : cell.value}
                isEditable={cell.isEditable && !isGameCompleted && !showAnswer}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                onChange={(e) => handleSquareChange(rowIndex, colIndex, e.target.value)}
                isHighlighted={{
                  row: rowIndex === highlighted.row,
                  col: colIndex === highlighted.col,
                  box: getBoxIndex(rowIndex, colIndex) === highlighted.box,
                  number: cell.value === currentValue
                }}
                isWrongValue={!showAnswer && sudokuGrid[rowIndex][colIndex] !== cell.value}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="row d-flex justify-content-start mt-4 mb-4">
        <ActionButton icon="eraser" tooltip="Erase Number" onClick={handleClearValue} disabled={!selectedSquare} />
        <ActionButton icon="eye" tooltip="Show Answers" onClick={handleShowAnswer} active={showAnswer} />
        <ActionButton
          icon="lightbulb"
          tooltip="Use Hint"
          onClick={handleGiveHint}
          disabled={hintsRemaining <= 0 || !selectedSquare}
          hintCount={hintsRemaining}
        />
      </div>

      {/* Number Buttons */}
      <div className="d-flex justify-content-between flex-wrap gap-2">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            className={`btn custom-btn ${activeValue === num ? 'active' : ''}`}
            onClick={() => handleInputValue(num)}
            disabled={countOccurrences(num) >= 9}
          >
            {num}
          </button>
        ))}
      </div>

      {message && (
        <div className={`alert ${isGameCompleted ? 'alert-success' : 'alert-danger'} mt-4`} role="alert">
          {message}
        </div>
      )}
    </div>
  );
}

// ActionButton Component for common buttons
function ActionButton({ icon, tooltip, onClick, active, disabled, hintCount }) {
  return (
    <div className="col-auto position-relative">
      <OverlayTrigger placement="bottom" overlay={<Tooltip>{tooltip}</Tooltip>}>
        <button
          className={`btn custom-btn mx-2 ${active ? 'active' : ''}`}
          onClick={onClick}
          disabled={disabled}
        >
          <i className={`fas fa-${icon}`}></i>
          {hintCount > 0 && icon === 'lightbulb' && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {hintCount}
            </span>
          )}
        </button>
      </OverlayTrigger>
    </div>
  );
}

// Square Component for each individual cell
function Square({ value, isEditable, onChange, onClick, isHighlighted, isWrongValue }) {
  const highlightClass = `${isHighlighted.row ? 'highlight-row ' : ''}${isHighlighted.col ? 'highlight-col ' : ''}${isHighlighted.box ? 'highlight-box ' : ''}${isHighlighted.number ? 'highlight-number ' : ''}${isWrongValue ? 'wrong-input ' : ''}`.trim();

  const isSmallDevice = window.innerWidth < 768;

  return (
    <input
      type="text"
      className={`square ${highlightClass}`}
      value={value !== null ? value : ""}
      onChange={onChange}
      onClick={onClick}
      readOnly={!isEditable || isSmallDevice} // Combine both conditions here
      maxLength="1"
    />
  );
}

export default App;
