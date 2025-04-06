import React, { useState, useMemo } from "react";
import styled from "@emotion/styled";

const Box = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background-color: ${props => 
    props.isValidTarget && props.isHardMode ? '#e8f5e9' : 
    props.isDragging ? '#e0e0ff' : 
    '#f0f0f0'
  };
  font-size: ${props => props.value >= 10 ? '24px' : '32px'};
  font-weight: bold;
  color: #333;
  transition: all 0.2s ease;
  cursor: pointer;
  user-select: none;
  border-radius: 8px;
  transform: ${props => props.isDragging ? 'scale(1.05)' : 'scale(1)'};
  box-shadow: ${props => 
    props.isDragging ? 
    '0 4px 12px rgba(0, 0, 0, 0.2)' : 
    'none'
  };

  @media (max-width: 480px) {
    width: 70px;
    height: 70px;
    font-size: ${props => props.value >= 10 ? '20px' : '28px'};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 80px);
  grid-template-rows: repeat(4, 80px);
  gap: 8px;
  padding: 12px;
  background-color: #e1e1e1;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    grid-template-columns: repeat(4, 70px);
    grid-template-rows: repeat(4, 70px);
    gap: 6px;
    padding: 8px;
  }
`;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
`;

const ModeSwitch = styled.button`
  margin-top: 40px;
  padding: 8px 16px;
  background-color: ${props => props.isHardMode ? '#e8f5e9' : '#f0f0f0'};
  border: 2px solid #333;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: bold;
  color: #333;
  margin: 0 0 40px;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

function App() {
  const [isHardMode, setIsHardMode] = useState(false);
  const [numbers, setNumbers] = useState(Array(16).fill(null).map((_, i) => ({ 
    id: i, 
    value: 1,
    isDragging: false,
    isValidTarget: false
  })));
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
    const sourceNumber = numbers.find(n => n.id === sourceId);
    const targetNumber = numbers.find(n => n.id === targetId);
    
    if (isValidFibonacciMerge(sourceNumber.value, targetNumber.value)) {
      setNumbers(prev => {
        const newNumbers = [...prev];
        const sourceIndex = newNumbers.findIndex(n => n.id === sourceId);
        const targetIndex = newNumbers.findIndex(n => n.id === targetId);
        
        newNumbers[targetIndex] = {
          ...newNumbers[targetIndex],
          value: newNumbers[sourceIndex].value + newNumbers[targetIndex].value,
          isValidTarget: false
        };
        
        newNumbers[sourceIndex] = { 
          ...newNumbers[sourceIndex], 
          value: 1,
          isValidTarget: false 
        };
        
        return newNumbers;
      });
      return true;
    }
    return false;
  };

  const handleDragStart = (id) => {
    setDraggedId(id);
    setNumbers(prev => prev.map(num => {
      if (num.id === id) {
        return { ...num, isDragging: true };
      }
      // Show valid merge targets
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
    setNumbers(prev => prev.map(num => ({ 
      ...num, 
      isDragging: false,
      isValidTarget: false 
    })));
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setNumbers(prev => prev.map(num => ({ 
      ...num, 
      isDragging: false,
      isValidTarget: false 
    })));
  };

  return (
    <Container>
      <Title>FiboFlow</Title>
      <Grid>
        {numbers.map((number) => (
          <Box 
            key={number.id}
            data-id={number.id}
            isDragging={number.isDragging}
            isValidTarget={number.isValidTarget}
            isHardMode={isHardMode}
            draggable="true"
            onDragStart={() => handleDragStart(number.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, number.id)}
            onDragEnd={handleDragEnd}
          >
            {number.value}
          </Box>
        ))}
      </Grid>
      <ModeSwitch 
        isHardMode={isHardMode}
        onClick={() => setIsHardMode(!isHardMode)}
      >
        {!isHardMode ? 'Hard Mode' : 'Easy Mode'}
      </ModeSwitch>
    </Container>
  );
}

export default App;
