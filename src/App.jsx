import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import DesktopGame from "./components/DesktopGame";
import MobileGame from "./components/MobileGame";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const ScoreContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Score = styled.div`
  font-size: 0.9rem;
  font-weight: bold;
  color: #333;
`;

const Multiplier = styled.div`
  font-size: 0.7rem;
  color: #666;
  padding: 4px 8px;
  background-color: #e8f5e9;
  border-radius: 4px;
`;

const ModeSwitch = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

const ModeButton = styled.button`
  padding: 8px 16px;
  background-color: ${(props) => (props.active ? "#e8f5e9" : "#f0f0f0")};
  border: 2px solid #333;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const HelpButton = styled.button`
  display: block;
  text-align: center;
  margin-top: 20px;
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
  background-color: #f0f0f0;
  border: 2px solid #333;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const HelpModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 1000;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const HelpContent = styled.div`
  text-align: center;

  p {
    margin: 10px 0;
    font-size: 16px;
    line-height: 1.6;
  }

  .sequence {
    font-family: monospace;
    font-size: 18px;
    color: #333;
    margin: 10px 0 0;
  }

  img {
    max-width: 100%;
    height: auto;
    margin: 20px 0 5px;
  }

  .caption {
    font-size: 14px;
    color: #666;
    margin: 0 0 20px;
    span {
      display: block;
      font-weight: bold;
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;

  &:hover {
    color: #333;
  }
`;

const Credits = styled.aside`
  margin-top: 20px;
  text-align: center;
  font-size: 0.7rem;
  color: #666;

  p {
    margin: 5px 0;
  }

  a {
    display: inline-block;
    margin-top: 5px;
  }
`;

function App() {
  const [isHardMode, setIsHardMode] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [score, setScore] = useState(0);
  const [gridState, setGridState] = useState(
    Array(16)
      .fill(null)
      .map((_, i) => ({
        id: i,
        value: 1,
        isDragging: false,
        isValidTarget: false,
        isMerged: false,
      }))
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMerge = (resultingNumber) => {
    const points = resultingNumber * (isHardMode ? 2 : 1);
    setScore((prevScore) => prevScore + points);
  };

  const handleModeChange = (newMode) => {
    setIsHardMode(newMode);
  };

  return (
    <Container>
      <Title>FiboFlow</Title>
      <ModeSwitch>
        <ModeButton active={isHardMode} onClick={() => handleModeChange(true)}>
          Hard Mode
        </ModeButton>
        <ModeButton
          active={!isHardMode}
          onClick={() => handleModeChange(false)}
        >
          Easy Mode
        </ModeButton>
      </ModeSwitch>
      <ScoreContainer>
        <Score>Score: {score}</Score>
        <Multiplier>Multiplier: {isHardMode ? "2x" : "1x"}</Multiplier>
      </ScoreContainer>
      {isMobile ? (
        <MobileGame
          isHardMode={isHardMode}
          onMerge={handleMerge}
          gridState={gridState}
          onGridStateChange={setGridState}
        />
      ) : (
        <DesktopGame
          isHardMode={isHardMode}
          onMerge={handleMerge}
          gridState={gridState}
          onGridStateChange={setGridState}
        />
      )}
      <HelpButton onClick={() => setShowHelp(true)}>?</HelpButton>

      <Credits>
        <p>Created by Gustavo Krause © 2025</p>
        <p>Licensed under CC BY-NC 4.0</p>
        <a
          href="https://creativecommons.org/licenses/by-nc/4.0/"
          target="_blank"
          rel="noopener"
        >
          <img
            src="https://licensebuttons.net/l/by-nc/4.0/88x31.png"
            alt="Creative Commons License"
          />
        </a>
      </Credits>

      {showHelp && (
        <>
          <Overlay onClick={() => setShowHelp(false)} />
          <HelpModal>
            <CloseButton onClick={() => setShowHelp(false)}>
              &times;
            </CloseButton>
            <HelpContent>
              <p>
                The Fibonacci sequence is a sequence in which each element is
                the sum of the two elements that precede it.
              </p>
              <p className="sequence">
                1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, ...
              </p>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/FibonacciBlocks.svg/1920px-FibonacciBlocks.svg.png" alt="Fibonacci Squares" />
              <p className="caption">
                A tiling with squares whose side lengths are successive
                Fibonacci numbers: <span>1, 1, 2, 3, 5, 8, 13 and 21</span>
              </p>
              <p>
                In this game, you will be given a sequence of numbers. Your goal
                is to merge the numbers to form the next number in the sequence.
              </p>
            </HelpContent>
          </HelpModal>
        </>
      )}
    </Container>
  );
}

export default App;
