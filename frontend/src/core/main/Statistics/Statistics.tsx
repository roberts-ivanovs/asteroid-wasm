import React, { ReactElement, useCallback, useState } from 'react';
import { CountryChart } from './Charts/CountryChart';
import { GameHistory } from './GameHistory/GameHistory';
import { LeaderboardComponent } from './Leaderboard/Leaderboard';

import style from './Statistics.module.scss';

interface Selectable {
  item: ReactElement,
  title: string
}

const tables: { [key: number]: Selectable} = {
  0: {
    item: <GameHistory />,
    title: 'Latest Game History',
  },
  1: {
    item: <LeaderboardComponent />,
    title: 'Top 30 Players',
  },
};

const charts: { [key: number]: Selectable} = {
  0: {
    item: <CountryChart />,
    title: 'Countries With The Most Score',
  },
};

export function Statistics(): ReactElement {
  const [itemIndexTop, setItemIndexTop] = useState<number>(0);
  const [itemIndexBottom, setItemIndexBottom] = useState<number>(0);

  const handleChange = useCallback(
    (newNumber: number, maxItems: number, callback: (arg0: number) => void) => {
      if (newNumber > maxItems - 1) {
        callback(0);
      } else if (newNumber < 0) {
        callback(maxItems - 1);
      } else {
        callback(newNumber);
      }
    },
    [],
  );
  const maxItemsTop = Object.keys(tables).length;
  const maxItemsBot = Object.keys(charts).length;

  const componentTop = tables[itemIndexTop];
  const componentBot = charts[itemIndexBottom];

  return (
    <div className={style['game-table']}>
      <div className={style['title-container']}>
        <button
          type="button"
          onClick={
            () => handleChange(itemIndexTop - 1, maxItemsTop, setItemIndexTop)
          }
        >
          <i className="fas fa-chevron-left" />
        </button>
        <h1 className={style.title}>{componentTop.title}</h1>
        <button
          type="button"
          onClick={
            () => handleChange(itemIndexTop + 1, maxItemsTop, setItemIndexTop)
          }
        >
          <i className="fas fa-chevron-right" />
        </button>
      </div>
      {componentTop.item}
      <div className={`${style['title-container']} ${style['margin-top']}`}>
        <button
          type="button"
          onClick={
            () => handleChange(itemIndexBottom - 1, maxItemsBot, setItemIndexBottom)
          }
        >
          <i className="fas fa-chevron-left" />
        </button>
        <h1 className={style.title}>{componentBot.title}</h1>
        <button
          type="button"
          onClick={
            () => handleChange(itemIndexBottom + 1, maxItemsBot, setItemIndexBottom)
          }
        >
          <i className="fas fa-chevron-right" />
        </button>
      </div>
      {componentBot.item}
    </div>
  );
}
