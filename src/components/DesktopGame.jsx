import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';

const DesktopBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background-color: ${props => 
    props.isValidTarget && !props.isHardMode ? '#e8f5e9' : 
    props.isDragging ? '#e0e0ff' : 
    props.isMerged ? '#d8f0d9' :
    '#f0f0f0'
  };
  font-size: ${props => {
    if (props.value >= 100000) return '16px';
    if (props.value >= 10000) return '18px';
    if (props.value >= 1000) return '20px';
    if (props.value >= 100) return '24px';
    return '32px';
  }};
  font-weight: bold;
  color: #333;
  transition: all 0.3s ease;
  cursor: pointer;
  user-select: none;
  border-radius: 8px;
  transform: ${props => props.isDragging ? 'scale(1.05)' : 'scale(1)'};
  box-shadow: ${props => 
    props.isDragging ? 
    '0 4px 12px rgba(0, 0, 0, 0.2)' : 
    'none'
  };
`;

const DesktopGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 80px);
  grid-template-rows: repeat(4, 80px);
  gap: 8px;
  padding: 12px;
  background-color: #e1e1e1;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

function DesktopGame({ isHardMode, onMerge, gridState, onGridStateChange }) {
  const [draggedId, setDraggedId] = useState(null);

  // Generate Fibonacci sequence up to 1000 for validation
  const fibonacciSequence = useMemo(() => {
    const fib = [1, 1];
    while (fib[fib.length - 1] < 1000) {
      fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
    }
    return fib;
  }, []);

  const isValidFibonacciMerge = (num1, num2) => {
    const sum = num1 + num2;
    return fibonacciSequence.includes(sum);
  };

  const mergeTiles = (sourceId, targetId) => {
    const sourceNumber = gridState.find(n => n.id === sourceId);
    const targetNumber = gridState.find(n => n.id === targetId);
    
    if (isValidFibonacciMerge(sourceNumber.value, targetNumber.value)) {
      const resultingNumber = sourceNumber.value + targetNumber.value;
      onMerge(resultingNumber);

      onGridStateChange(prev => {
        const newNumbers = [...prev];
        const sourceIndex = newNumbers.findIndex(n => n.id === sourceId);
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
          isValidTarget: false 
        };
        
        // Reset the merged state after animation
        setTimeout(() => {
          onGridStateChange(current => current.map(num => 
            num.id === targetId ? { ...num, isMerged: false } : num
          ));
        }, 300);
        
        return newNumbers;
      });
      return true;
    }
    return false;
  };

  const handleDragStart = (id) => {
    setDraggedId(id);
    onGridStateChange(prev => prev.map(num => {
      if (num.id === id) {
        return { ...num, isDragging: true };
      }
      const sourceNumber = prev.find(n => n.id === id);
      return { 
        ...num, 
        isValidTarget: num.id !== id && isValidFibonacciMerge(sourceNumber.value, num.value)
      };
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (draggedId !== null && draggedId !== targetId) {
      mergeTiles(draggedId, targetId);
    }
    setDraggedId(null);
    onGridStateChange(prev => prev.map(num => ({ 
      ...num, 
      isDragging: false,
      isValidTarget: false 
    })));
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    onGridStateChange(prev => prev.map(num => ({ 
      ...num, 
      isDragging: false,
      isValidTarget: false 
    })));
  };

  return (
    <DesktopGrid>
      {gridState.map((number) => (
        <DesktopBox 
          key={number.id}
          data-id={number.id}
          isDragging={number.isDragging}
          isValidTarget={number.isValidTarget}
          isHardMode={isHardMode}
          isMerged={number.isMerged}
          draggable="true"
          onDragStart={() => handleDragStart(number.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, number.id)}
          onDragEnd={handleDragEnd}
          value={number.value}
        >
          {number.value}
        </DesktopBox>
      ))}
    </DesktopGrid>
  );
}

export default DesktopGame; 