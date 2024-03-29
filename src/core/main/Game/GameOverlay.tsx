import React, { ReactElement, useState } from 'react';
import { useSpring, animated } from 'react-spring/web';
import { GameState } from 'types';

import style from './Game.module.scss';

interface Props {
  setActive: (arg0: boolean) => void;
  currentState: GameState;
  score: number;
}
export function GameOverlay({
  setActive, currentState, score
}: Props): ReactElement {
  const { x } = useSpring({ from: { x: 0 }, x: 1, config: { duration: 5000 } });
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');


  switch (currentState) {
    case GameState.INITIALIZING:
      return (
        <div className={currentState === GameState.INITIALIZING ? style.rules : ''}>
          <h3>CONTROLS</h3>
          <div>
            W - Forwards
          </div>
          <div>
            S - Backwards
          </div>
          <div>
            A - Turn Left
          </div>
          <div>
            D - Turn Right
          </div>
          <div>
            SPACE - Shoot
          </div>
          <button
            className={`${style.btn} ${style['draw-border']}`}
            type="button"
            onClick={() => {
              setActive(true);
            }}
          > START
          </button>
        </div>
      );
    case GameState.GAME_OVER:
      return (
        <animated.div
          className={style.rules}
          style={{
            opacity: x.interpolate({ range: [0, 1], output: [0.0, 1] }),
            marginRight: '10rem',
          }}
        >
          <h3>GAME OVER</h3>
          <div className={style.subtitle}>
            You scored {score} points!
          </div>

          <div className={style['input-container']}>
            <div>
              Username: <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              Name: <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              Surname: <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
            </div>
          </div>
          <button
            className={`${style.btn} ${style['draw-border']}`}
            type="button"
            onClick={() => setActive(true)}
          > PLAY AGAIN
          </button>
        </animated.div>
      );
    default:
      return <></>;
  }
}
