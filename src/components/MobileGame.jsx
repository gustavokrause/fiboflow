import React, { useState, useCallback, useMemo } from "react";
import styled from "@emotion/styled";

const MobileBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  background-color: ${(props) =>
    props.isValidTarget && !props.isHardMode
      ? "#e8f5e9"
      : props.isDragging
      ? "#e0e0ff"
      : props.isMerged
      ? "#d8f0d9"
      : "#f0f0f0"};
  font-size: ${props => {
    if (props.value >= 100000) return '14px';
    if (props.value >= 10000) return '16px';
    if (props.value >= 1000) return '18px';
    if (props.value >= 100) return '20px';
    return '28px';
  }};
  font-weight: bold;
  color: #333;
  user-select: none;
  border-radius: 8px;
  touch-action: none;
  -webkit-touch-callout: none;
  position: relative;
  z-index: ${(props) => (props.isDragging ? 2 : 1)};
  -webkit-user-drag: none;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.3s ease;
`;

const MobileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 70px);
  grid-template-rows: repeat(4, 70px);
  gap: 6px;
  padding: 8px;
  background-color: #e1e1e1;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  width: fit-content;
  box-sizing: border-box;
  position: relative;
  touch-action: none;
`;

function MobileGame({ isHardMode, onMerge, gridState, onGridStateChange }) {
  const [draggedTile, setDraggedTile] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  // Generate Fibonacci sequence dynamically based on the current grid state
  const fibonacciSequence = useMemo(() => {
    const fib = [1, 1];
    // Find the maximum possible sum in the current grid
    const maxPossibleSum = Math.max(...gridState.map(n => n.value)) * 2;
    while (fib[fib.length - 1] < maxPossibleSum) {
      fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
    }
    return fib;
  }, [gridState]);

  const isValidFibonacciMerge = useCallback(
    (num1, num2) => {
      const sum = num1 + num2;
      return fibonacciSequence.includes(sum);
    },
    [fibonacciSequence]
  );

  const vibrate = useCallback(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const handleTouchStart = useCallback(
    (e, id) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      
      setDraggedTile(id);
      setDragPosition({
        x: touch.clientX,
        y: touch.clientY
      });
      vibrate();

      onGridStateChange(prev => prev.map(num => {
        if (num.id === id) {
          return { ...num, isDragging: true };
        }
        return {
          ...num,
          isValidTarget: num.id !== id && isValidFibonacciMerge(num.value, prev.find(n => n.id === id).value)
        };
      }));
    },
    [isValidFibonacciMerge, vibrate, onGridStateChange]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (draggedTile === null) return;
      e.preventDefault();
      
      const touch = e.touches[0];
      setDragPosition({
        x: touch.clientX,
        y: touch.clientY
      });
    },
    [draggedTile]
  );

  const handleTouchEnd = useCallback(
    (e) => {
      if (draggedTile === null) return;
      e.preventDefault();

      const touch = e.changedTouches[0];
      const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
      const targetElement = elements.find(el => {
        const id = el.getAttribute("data-id");
        return id && parseInt(id) !== draggedTile;
      });

      if (targetElement) {
        const targetId = parseInt(targetElement.getAttribute("data-id"));
        const sourceNumber = gridState.find(n => n.id === draggedTile);
        const targetNumber = gridState.find(n => n.id === targetId);

        if (isValidFibonacciMerge(sourceNumber.value, targetNumber.value)) {
          const resultingNumber = sourceNumber.value + targetNumber.value;
          onMerge(resultingNumber);

          onGridStateChange(prev => {
            const newNumbers = [...prev];
            const sourceIndex = newNumbers.findIndex(n => n.id === draggedTile);
            const targetIndex = newNumbers.findIndex(n => n.id === targetId);

            newNumbers[targetIndex] = {
              ...newNumbers[targetIndex],
              value: resultingNumber,
              isValidTarget: false,
              isMerged: true
            };

            newNumbers[sourceIndex] = {
              ...newNumbers[sourceIndex],
              value: 1,
              isDragging: false
            };

            // Reset the merged state after animation
            setTimeout(() => {
              onGridStateChange(current => current.map(num => 
                num.id === targetId ? { ...num, isMerged: false } : num
              ));
            }, 300);

            return newNumbers;
          });
          vibrate();
        }
      }

      onGridStateChange(prev => prev.map(num => ({
        ...num,
        isDragging: false,
        isValidTarget: false
      })));
      setDraggedTile(null);
    },
    [draggedTile, gridState, isValidFibonacciMerge, vibrate, onMerge, onGridStateChange]
  );

  return (
    <MobileGrid
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {gridState.map((number) => (
        <React.Fragment key={number.id}>
          <MobileBox
            data-id={number.id}
            isDragging={false}
            isValidTarget={number.isValidTarget}
            isHardMode={isHardMode}
            isMerged={number.isMerged}
            value={number.value}
            onTouchStart={(e) => handleTouchStart(e, number.id)}
            style={{
              opacity: number.isDragging ? 0.5 : 1,
              gridColumn: Math.floor(number.id % 4) + 1,
              gridRow: Math.floor(number.id / 4) + 1,
            }}
          >
            {number.value}
          </MobileBox>
          {number.isDragging && (
            <div
              style={{
                position: "fixed",
                left: dragPosition.x,
                top: dragPosition.y,
                transform: "translate(-50%, -50%)",
                zIndex: 1000,
                pointerEvents: "none",
              }}
            >
              <MobileBox
                data-id={number.id}
                isDragging={true}
                isValidTarget={false}
                isHardMode={isHardMode}
                value={number.value}
              >
                {number.value}
              </MobileBox>
            </div>
          )}
        </React.Fragment>
      ))}
    </MobileGrid>
  );
}

export default MobileGame;
